const express = require("express");//create the web server and API's.
const http = require("http");// create http server.
const cors = require("cors");//Control requests from different origins.
const { Server } = require("socket.io");//real time communication.

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const vehicleLocations = new Map();// Temporary storage. not connected to database.

app.get("/", (req, res) => { // Check whether the server is running
  res.json({
    project: "SEGREMED",
    module: "GPS Tracking",
    status: "running"
  });
});

app.get("/api/vehicles", (req, res) => { // Get all current vehicle locations
  res.json(Array.from(vehicleLocations.values()));
});

io.on("connection", (socket) => { // Receive GPS updates from drivers
  console.log("Client connected:", socket.id);

  socket.emit(
    "gps:initial",
    Array.from(vehicleLocations.values())
  );

  socket.on("gps:update", (data, callback) => {//It checks whether the received vehicle GPS data is correct before storing it.
    const valid =
      data &&
      typeof data.vehicleId === "string" &&
      /^[a-zA-Z0-9_-]{1,50}$/.test(data.vehicleId) &&
      Number.isFinite(data.latitude) &&
      Number.isFinite(data.longitude) &&
      Math.abs(data.latitude) <= 90 &&
      Math.abs(data.longitude) <= 180;

    if (!valid) {
      if (typeof callback === "function") {
        callback({
          ok: false,
          error: "Invalid GPS data"
        });
      }
      return;
    }

    const location = {//Store Vehicle Location
      vehicleId: data.vehicleId,
      latitude: data.latitude,
      longitude: data.longitude,
      accuracy: Number.isFinite(data.accuracy)
        ? data.accuracy
        : null,
      updatedAt: new Date().toISOString()
    };

    vehicleLocations.set(data.vehicleId, location);

    
    io.emit("gps:location", location); // Share the latest location with connected clients

    if (typeof callback === "function") {
      callback({ ok: true });
    }
  });
});

server.listen(3001, () => {
  console.log(
    "SEGREMED GPS server running at http://localhost:3001"
  );
});
