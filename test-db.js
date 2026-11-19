const db = require("./db");

async function testConnection() {
    try {
        const connection = await db.getConnection();
        console.log("SUCCESS: Connected to SEGREMED database!");
        connection.release();
        await db.end();
    } catch (error) {
        console.log("Database connection failed:", error.message);
    }
}

testConnection();