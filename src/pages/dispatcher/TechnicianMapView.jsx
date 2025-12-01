// src/pages/dispatcher/TechnicianMapView.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { GoogleMap, MarkerF, useJsApiLoader } from "@react-google-maps/api";


// Inline icon components (same as TSX, just no typing)
const ArrowLeft = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 19l-7-7m0 0l7-7m-7 7h18"
    />
  </svg>
);

const MapPinIcon = ({ className, style, fill = "none", stroke = "currentColor", strokeWidth = 2 }) => (
  <svg
    className={className}
    style={style}
    fill={fill}
    viewBox="0 0 24 24"
    stroke={stroke}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const RefreshCw = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
);

const Navigation = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
    />
  </svg>
);

const Users = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);

// helper
function formatTime(timeString) {
  if (!timeString) return "Just now";
  const d = new Date(timeString);
  if (Number.isNaN(d.getTime())) return "Just now";
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function getPinColor(status) {
  switch (status) {
    case "Active":
      return "#16a34a"; // green
    case "Busy":
      return "#ea580c"; // orange
    case "Blocked":
      return "#dc2626"; // red
    default:
      return "#6b7280"; // gray
  }
}

function getStatusBgColor(status) {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-800";
    case "Busy":
      return "bg-orange-100 text-orange-800";
    case "Blocked":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

const TechnicianMapView = () => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [hoveredTechnician, setHoveredTechnician] = useState(null);
  const [technicianLocations, setTechnicianLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    });



  // load technicians + recent work orders
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [locRes, workRes] = await Promise.all([
        axiosClient.get("/dispatch/technician-locations"),
        axiosClient.get("/dispatch/recent-work-orders"),
      ]);

      const locations = Array.isArray(locRes.data) ? locRes.data : [];
      const workOrders = Array.isArray(workRes.data) ? workRes.data : [];

      const mapped = locations.map((tech) => {
        const currentWo = workOrders.find(
          (wo) => wo.technician && wo.technician.id === tech.id &&
            (wo.status === "IN_PROGRESS" || wo.status === "ASSIGNED")
        );

        let status = "Active";
        if (
          tech.locationStatus === "BUSY" ||
          (currentWo && (currentWo.status === "IN_PROGRESS" || currentWo.status === "ASSIGNED"))
        ) {
          status = "Busy";
        } else if (tech.locationStatus !== "ONLINE") {
          status = "Blocked";
        }

        return {
          id: tech.id,
          name: tech.name,
          lat: tech.lastLatitude,
          lng: tech.lastLongitude,
          status,
          currentJob: currentWo ? currentWo.woNumber : null,
          specialty: tech.technicianProfile?.specialization || "",
          lastUpdated: formatTime(tech.locationUpdatedAt),
        };
      });

      setTechnicianLocations(mapped);
      setLastRefresh(new Date());
    } catch (err) {
      console.error("Failed to load technician locations:", err);
      setError("Failed to load technician locations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      loadData();
    }, 30000); // 30s auto refresh
    return () => clearInterval(interval);
  }, []);

  const filteredTechnicians = technicianLocations.filter((tech) =>
    tech.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // calculate bounds for simple coordinate -> percentage mapping
  let minLat = null,
    maxLat = null,
    minLng = null,
    maxLng = null;
  technicianLocations.forEach((t) => {
    if (t.lat == null || t.lng == null) return;
    if (minLat === null || t.lat < minLat) minLat = t.lat;
    if (maxLat === null || t.lat > maxLat) maxLat = t.lat;
    if (minLng === null || t.lng < minLng) minLng = t.lng;
    if (maxLng === null || t.lng > maxLng) maxLng = t.lng;
  });

  // fallback bounds (rough around Nairobi)
  if (minLat === null) {
    minLat = -1.30;
    maxLat = -1.28;
    minLng = 36.81;
    maxLng = 36.83;
  }

  const rangeLat = Math.max(maxLat - minLat, 0.01);
  const rangeLng = Math.max(maxLng - minLng, 0.01);

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/dispatcher/overview")}
            className="inline-flex items-center rounded-md px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#c20001]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </button>

          <div className="flex-1">
            <h2 className="text-base font-semibold text-gray-900">
              Technician Map View
            </h2>
            <p className="text-sm text-gray-500">
              Last updated:{" "}
              {lastRefresh.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            {loading && (
              <p className="text-xs text-gray-400">Refreshing locations...</p>
            )}
            {error && (
              <p className="text-xs text-red-500">
                {error}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-600" />
              <span className="text-gray-600">Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-orange-600" />
              <span className="text-gray-600">Busy</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-600" />
              <span className="text-gray-600">Blocked</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Map Area */}
        <div className="relative flex-1 bg-gray-200">
          {/* Map Placeholder */}
          {loadError && (
  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-red-500">
    Failed to load map
  </div>
)}

{isLoaded && !loadError ? (
  <GoogleMap
    mapContainerClassName="w-full h-full"
    center={{
      lat: technicianLocations[0]?.lat ?? -1.286389, // fallback Nairobi
      lng: technicianLocations[0]?.lng ?? 36.817223,
    }}
    zoom={13}
    options={{
      disableDefaultUI: true,
      clickableIcons: false,
    }}
  >
    {filteredTechnicians.map((tech) =>
      tech.lat != null && tech.lng != null ? (
        <MarkerF
          key={tech.id}
          position={{ lat: tech.lat, lng: tech.lng }}
        />
      ) : null
    )}
  </GoogleMap>
) : (
  !loadError && (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300 text-gray-500">
      Loading map...
    </div>
  )
)}


          {/* Floating Action Buttons */}
          <div className="absolute bottom-6 right-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={loadData}
              title="Refresh"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 shadow-lg hover:bg-gray-50"
            >
              <RefreshCw className="h-5 w-5" />
            </button>

            <button
              type="button"
              title="Locate Me"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 shadow-lg hover:bg-gray-50"
            >
              <Navigation className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={() => navigate("/dispatcher/overview")}
              className="rounded-full bg-[#c20001] px-6 py-2 text-sm font-medium text-white shadow-lg hover:bg-[#a10001]"
            >
              Back to Overview
            </button>
          </div>
        </div>

        {/* Right Side Panel */}
        <div className="flex w-80 flex-col border-l border-gray-200 bg-white">
          {/* Header */}
          <div className="border-b border-gray-200 px-4 py-3">
            <div className="flex items-center gap-2 text-gray-900">
              <Users className="h-5 w-5" />
              <span className="text-sm font-semibold">
                Technicians ({filteredTechnicians.length})
              </span>
            </div>
          </div>

          {/* Search */}
          <div className="border-b border-gray-200 p-4">
            <input
              type="text"
              placeholder="Search technician by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#c20001] focus:outline-none focus:ring-1 focus:ring-[#c20001]"
            />
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            <div className="divide-y divide-gray-100">
              {filteredTechnicians.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  <Users className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                  <p className="text-sm">
                    {loading ? "Loading technicians..." : "No technicians found"}
                  </p>
                </div>
              ) : (
                filteredTechnicians.map((tech) => (
                  <div
                    key={tech.id}
                    className={`cursor-pointer p-4 text-sm transition-colors ${
                      hoveredTechnician === tech.id
                        ? "bg-gray-50"
                        : "hover:bg-gray-50"
                    }`}
                    onMouseEnter={() => setHoveredTechnician(tech.id)}
                    onMouseLeave={() => setHoveredTechnician(null)}
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-[#c20001]">
                          {tech.name}
                        </p>
                        {tech.specialty && (
                          <p className="text-xs text-gray-600">
                            {tech.specialty}
                          </p>
                        )}
                      </div>
                      <div
                        className="mt-1 h-3 w-3 rounded-full"
                        style={{ backgroundColor: getPinColor(tech.status) }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${getStatusBgColor(
                          tech.status
                        )}`}
                      >
                        {tech.status}
                      </span>
                      <span className="text-xs text-gray-400">
                        {tech.lastUpdated}
                      </span>
                    </div>

                    {tech.currentJob && (
                      <div className="mt-2 rounded bg-gray-50 px-2 py-1 text-xs text-gray-500">
                        Current Job: {tech.currentJob}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicianMapView;
