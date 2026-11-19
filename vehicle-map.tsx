
"use client";

type Vehicle = {
  vehicleId: string;
  latitude: number;
  longitude: number;
};

type Props = {
  vehicles: Vehicle[];
};

export default function VehicleMap({ vehicles }: Props) {
  if (!vehicles || vehicles.length === 0) {
    return <p>No GPS location available.</p>;
  }

  return (
    <>
      {vehicles.map((vehicle) => {
        const lat = vehicle.latitude;
        const lon = vehicle.longitude;

        const left = lon - 0.01;
        const right = lon + 0.01;
        const bottom = lat - 0.01;
        const top = lat + 0.01;

        const embedUrl =
          `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik`;

        const googleMapsUrl =
          `https://www.google.com/maps?q=${lat},${lon}`;

        return (
          <div
            key={vehicle.vehicleId}
            style={{
              position: "relative",
              width: "100%",
              marginBottom: "20px",
            }}
          >
            <iframe
              title={`Map of ${vehicle.vehicleId}`}
              src={embedUrl}
              width="100%"
              height="400"
              style={{
                border: "none",
                borderRadius: "12px",
              }}
            />

            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              title={`Open ${vehicle.vehicleId} in Google Maps`}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -100%)",
                zIndex: 10,
                textDecoration: "none",
              }}
            >
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  background: "#2e7d32",
                  border: "3px solid white",
                  borderRadius: "50%",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
                  cursor: "pointer",
                }}
              />
            </a>
          </div>
        );
      })}
    </>
  );
}
