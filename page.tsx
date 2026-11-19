
"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Truck, MapPin, Navigation } from "lucide-react";

const VehicleMap = dynamic(() => import("@/components/vehicle-map"), {
  ssr: false,
});

const vehicles = [
  {
    id: "V001",
    name: "Vehicle MH26 AB 1234",
    driver: "Rahul Sharma",
    location: "Nanded",
    status: "On Route",
  },
  {
    id: "V002",
    name: "Vehicle MH12 CD 4567",
    driver: "Amit Patil",
    location: "Pune",
    status: "Available",
  },
  {
    id: "V003",
    name: "Vehicle MH20 EF 7890",
    driver: "Priya Deshmukh",
    location: "Chhatrapati Sambhajinagar",
    status: "On Route",
  },
  {
    id: "V004",
    name: "Vehicle MH14 GH 2345",
    driver: "Sneha Kulkarni",
    location: "Mumbai",
    status: "Maintenance",
  },
];

type GPSVehicle = {
  vehicleId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
};

export default function TrackingPage() {
  const [gpsVehicles, setGpsVehicles] = useState<GPSVehicle[]>([]);
  const [gpsError, setGpsError] = useState("");

  useEffect(() => {
    const fetchGPS = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/vehicles");

        if (!response.ok) {
          throw new Error("GPS fetch failed");
        }

        const data: GPSVehicle[] = await response.json();

        setGpsVehicles(data);
        setGpsError("");
      } catch {
        setGpsError("GPS server connection failed");
      }
    };

    fetchGPS();

    const interval = setInterval(fetchGPS, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">LOGISTICS</p>
          <h1>Vehicle Tracking</h1>
          <p>Monitor medical waste collection vehicles.</p>
        </div>

        <span className="status active">Demo tracking</span>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <Truck />
          <h2>04</h2>
          <p>Total Vehicles</p>
        </div>

        <div className="stat-card">
          <Navigation />
          <h2>02</h2>
          <p>On Route</p>
        </div>

        <div className="stat-card">
          <MapPin />
          <h2>01</h2>
          <p>Available</p>
        </div>
      </div>

      <div className="tracking-grid">
        <div className="content-card">
          <h3>Live Vehicle Locations</h3>

          {gpsError && <p>{gpsError}</p>}

          {gpsVehicles.length > 0 ? (
            <>
              {gpsVehicles.map((vehicle) => (
                <div
                  key={vehicle.vehicleId}
                  className="tracking-placeholder"
                  style={{ marginBottom: "20px" }}
                >
                  <VehicleMap vehicles={[vehicle]} />

                  <MapPin size={42} />

                  <h2>{vehicle.vehicleId}</h2>

                  <p>Latest location received</p>

                  <p>Latitude: {vehicle.latitude}</p>

                  <p>Longitude: {vehicle.longitude}</p>

                  <p>
                    Accuracy: {vehicle.accuracy ?? "N/A"} metres
                  </p>

                  <a
                    href={`https://www.google.com/maps?q=${vehicle.latitude},${vehicle.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open vehicle location in Google Maps
                  </a>
                </div>
              ))}
            </>
          ) : (
            <p>Waiting for GPS location...</p>
          )}
        </div>
      </div>
    </div>
  );
}
