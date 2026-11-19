const express = require("express");
const router = express.Router();
const db = require("../db");

// 1. Get collection requests with hospital and waste details
router.get("/requests", async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                cr.request_id,
                cr.requested_date,
                cr.scheduled_date,
                cr.pickup_address,
                cr.status,
                h.hospital_name,
                wc.category_name,
                wr.quantity,
                wr.unit,
                c.collector_name,
                c.vehicle_number
            FROM collection_request cr
            JOIN waste_records wr ON cr.waste_id = wr.waste_id
            JOIN hospital h ON wr.hospital_id = h.hospital_id
            JOIN waste_categories wc
                ON wr.waste_category_id = wc.waste_category_id
            LEFT JOIN collectors c
                ON cr.collector_id = c.collector_id
            ORDER BY cr.requested_date DESC
        `);

        res.json({ success: true, requests: rows });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// 2. Get available collectors
router.get("/collectors", async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT collector_id, collector_name,
                   contact_number, vehicle_number, vehicle_type
            FROM collectors
            WHERE availability_status = 'Available'
            ORDER BY collector_name
        `);

        res.json({ success: true, collectors: rows });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// 3. Assign a collector and schedule collection
router.post("/requests/:id/assign", async (req, res) => {
    const { collectorId, scheduledDate, remarks } = req.body;
    const requestId = Number(req.params.id);
    const collectorID = Number(collectorId);

    if (
        !Number.isInteger(requestId) || requestId < 1 ||
        !Number.isInteger(collectorID) || collectorID < 1 ||
        typeof scheduledDate !== "string" ||
        !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(scheduledDate) ||
        Number.isNaN(Date.parse(scheduledDate.replace(" ", "T")))
    ) {
        return res.status(400).json({
            success: false,
            message: "Provide a valid request ID, collector ID and scheduled date (YYYY-MM-DD HH:MM:SS)."
        });
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [requests] = await connection.query(
            "SELECT * FROM collection_request WHERE request_id = ? FOR UPDATE",
            [requestId]
        );

        if (requests.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: "Collection request not found."
            });
        }

        if (requests[0].status !== "Pending" || requests[0].collector_id !== null) {
            await connection.rollback();
            return res.status(409).json({
                success: false,
                message: "This request is not available for assignment."
            });
        }

        const [collectors] = await connection.query(
            "SELECT * FROM collectors WHERE collector_id = ? FOR UPDATE",
            [collectorID]
        );

        if (
            collectors.length === 0 ||
            collectors[0].availability_status !== "Available"
        ) {
            await connection.rollback();
            return res.status(409).json({
                success: false,
                message: "Collector not found or not available."
            });
        }

        await connection.query(
            `UPDATE collection_request
             SET collector_id = ?, scheduled_date = ?,
                 status = 'Assigned', remarks = ?
             WHERE request_id = ?`,
            [collectorID, scheduledDate, remarks || null, requestId]
        );

        await connection.query(
            `UPDATE collectors
             SET availability_status = 'Busy'
             WHERE collector_id = ?`,
            [collectorID]
        );

        await connection.query(
            `INSERT INTO collection_history
             (request_id, previous_status, new_status, updated_by, remarks)
             VALUES (?, 'Pending', 'Assigned', NULL, ?)`,
            [requestId, remarks || "Collector assigned"]
        );

        await connection.commit();

        res.json({
            success: true,
            message: "Collector assigned and collection scheduled successfully."
        });

    } catch (error) {
        await connection.rollback();
        res.status(500).json({
            success: false,
            message: error.message
        });

    } finally {
        connection.release();
    }
});

// 4. Update collection status
router.patch("/requests/:id/status", async (req, res) => {
    const requestId = Number(req.params.id);
    const { status, remarks } = req.body;

    const allowedStatuses = ["In Progress", "Completed", "Cancelled"];

    if (!Number.isInteger(requestId) || requestId < 1 ||
        !allowedStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: "Invalid request ID or status."
        });
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [rows] = await connection.query(
            "SELECT * FROM collection_request WHERE request_id = ? FOR UPDATE",
            [requestId]
        );

        if (rows.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: "Request not found."
            });
        }

        const request = rows[0];

        const validTransition =
            (request.status === "Assigned" &&
                ["In Progress", "Cancelled"].includes(status)) ||
            (request.status === "In Progress" &&
                ["Completed", "Cancelled"].includes(status));

        if (!validTransition) {
            await connection.rollback();
            return res.status(409).json({
                success: false,
                message: "This status change is not allowed."
            });
        }

        await connection.query(
            "UPDATE collection_request SET status = ?, remarks = ? WHERE request_id = ?",
            [status, remarks || null, requestId]
        );

        if (status === "Completed" || status === "Cancelled") {
            await connection.query(
                "UPDATE collectors SET availability_status = 'Available' WHERE collector_id = ?",
                [request.collector_id]
            );
        }

        await connection.query(
            `INSERT INTO collection_history
             (request_id, previous_status, new_status, updated_by, remarks)
             VALUES (?, ?, ?, NULL, ?)`,
            [requestId, request.status, status, remarks || null]
        );

        await connection.commit();

        res.json({
            success: true,
            message: "Collection status updated successfully."
        });

    } catch (error) {
        await connection.rollback();
        res.status(500).json({
            success: false,
            message: error.message
        });

    } finally {
        connection.release();
    }
});

module.exports = router;
