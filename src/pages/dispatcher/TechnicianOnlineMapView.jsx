// src/pages/dispatcher/TechnicianMapViewNearby.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { GoogleMap, MarkerF, useJsApiLoader, Autocomplete } from "@react-google-maps/api";


// ---------------------------------------------------------------------
// Small inline icons
// ---------------------------------------------------------------------
const ArrowLeft = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 19l-7-7m0 0l7-7m-7 7h18"
    />
  </svg>
);

const RefreshCw = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
);

const Navigation = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
    />
  </svg>
);

const Users = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 0 018 0z"
    />
  </svg>
);

// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------
function formatTime(timeString) {
  if (!timeString) return "Just now";
  const d = new Date(timeString);
  if (Number.isNaN(d.getTime())) return "Just now";
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function getPinColor(isOnline) {
  return isOnline ? "#16a34a" : "#6b7280"; // green / gray
}

function getStatusBgClass(isOnline) {
  return isOnline
    ? "bg-green-100 text-green-800"
    : "bg-gray-100 text-gray-700";
}

// parse specialization: হতে পারে normal string বা '["HVAC","Electrical"]'
function normalizeSpecialization(raw) {
  if (!raw) return "";
  if (typeof raw === "string" && raw.trim().startsWith("[")) {
    try {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr.join(", ");
    } catch {
      return raw;
    }
  }
  return raw;
}

const TechnicianMapViewNearby = () => {


  const [auto, setAuto] = useState(null);

  const onAutoLoad = (a) => setAuto(a);

  const onPlaceChanged = () => {
    if (!auto) return;
    const place = auto.getPlace();
    const loc = place?.geometry?.location;
    if (!loc) {
      setError("Select a suggestion from the dropdown.");
      return;
    }
    const newCenter = { lat: loc.lat(), lng: loc.lng() };
    setCenter(newCenter);
    fetchNearbyTechnicians(newCenter.lat, newCenter.lng, radius);
  };




  const navigate = useNavigate();

  // buyer/job location (map center)
  const [center, setCenter] = useState({
    lat: 23.8103, // Dhaka default
    lng: 90.4125,
  });

  const [radius, setRadius] = useState(5000); // শুধু zoom control-এর জন্য
  const [locationQuery, setLocationQuery] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [totalCount, setTotalCount] = useState(0);
  const [technicianLocations, setTechnicianLocations] = useState([]);
  const [hoveredTechnician, setHoveredTechnician] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  // -------------------------------------------------------------------
  // API: /api/dispatcher/technicians/nearby?latitude=&longitude=
  // -------------------------------------------------------------------
  const fetchNearbyTechnicians = async (lat, lng, radiusMeters = radius) => {
    try {
      setLoading(true);
      setError("");

      const maxDistanceKm = Math.max(1, Math.round(radiusMeters / 1000)); // meters -> km

      const { data } = await axiosClient.get("/dispatcher/technicians/nearby", {
        params: {
          latitude: lat,
          longitude: lng,
          maxDistance: maxDistanceKm,
          // status: "ONLINE", // ✅ চাইলে toggle দিয়ে add করবেন, এখন remove রাখুন
        },
      });

      const technicians = Array.isArray(data?.technicians) ? data.technicians : [];

      // ✅ jobLocation থেকে center update
      if (data?.jobLocation?.latitude != null && data?.jobLocation?.longitude != null) {
        setCenter({
          lat: Number(data.jobLocation.latitude),
          lng: Number(data.jobLocation.longitude),
        });
      }

      const mapped = technicians.map((t) => {
        const status = String(t.locationStatus || "").toUpperCase();
        const isOnline = status === "ONLINE";

        const rawLat = t.currentLocation?.latitude ?? null;
        const rawLng = t.currentLocation?.longitude ?? null;

        const latNum = rawLat != null ? Number(rawLat) : null;
        const lngNum = rawLng != null ? Number(rawLng) : null;

        return {
          id: t.id,
          name: t.name,
          phone: t.phone,
          type: t.type, // INTERNAL / FREELANCER
          specialty: normalizeSpecialization(t.specialization),
          isOnline,
          statusLabel: isOnline ? "Online" : "Offline",
          lat: Number.isFinite(latNum) ? latNum : null,
          lng: Number.isFinite(lngNum) ? lngNum : null,
          lastUpdated: formatTime(t.lastLocationUpdate),
          distanceKm: t.distanceKm || null,
          estimatedTravelTime: t.estimatedTravelTime || null,
          openJobsCount: t.openJobsCount ?? 0,
        };
      });

      setTechnicianLocations(mapped);
      setTotalCount(data?.total ?? mapped.length);
      setLastRefresh(new Date());
    } catch (err) {
      console.error("Failed to load nearby technicians:", err);
      setError("Failed to load nearby technicians.");
    } finally {
      setLoading(false);
    }
  };


  // initial load
  useEffect(() => {
    fetchNearbyTechnicians(center.lat, center.lng);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // auto-refresh every 30s for current center
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNearbyTechnicians(center.lat, center.lng, radius);
    }, 30000);

    return () => clearInterval(interval);
  }, [center.lat, center.lng, radius]);


  // technician name filter (right panel)
  const filteredTechnicians = technicianLocations.filter((tech) =>
    tech.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onlineCount = filteredTechnicians.filter((t) => t.isOnline).length;
const totalFilteredCount = filteredTechnicians.length;


  const mapZoom =
    radius <= 2000 ? 14 : radius <= 5000 ? 13 : radius <= 10000 ? 12 : 11;

  // -------------------------------------------------------------------
  // Location search: buyer address -> geocode -> update center & reload
  // -------------------------------------------------------------------
  const handleSearchLocation = () => {
  fetchNearbyTechnicians(center.lat, center.lng, radius);
};


  const handleRadiusChange = (e) => {
    const value = Number(e.target.value);
    if (!Number.isNaN(value) && value > 0) {
      setRadius(value);
      fetchNearbyTechnicians(center.lat, center.lng, value); // ✅ radius -> maxDistance
    }
  };

  // -------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------
  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Top header */}
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
  Nearby Technicians (Online {onlineCount} / {totalFilteredCount})
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
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>

          {/* Legend: Online / Offline */}
          <div className="flex items-center gap-4 text-xs md:text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-600" />
              <span className="text-gray-600">Online</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-gray-400" />
              <span className="text-gray-600">Offline</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Map area */}
        <div className="relative flex-1 bg-gray-200">
          {loadError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-red-500">
              Failed to load map
            </div>
          )}

          {isLoaded && !loadError ? (
            <GoogleMap
              mapContainerClassName="w-full h-full"
              center={center}
              zoom={mapZoom}
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
                    icon={{
                      path: window.google.maps.SymbolPath.CIRCLE,
                      fillColor: getPinColor(tech.isOnline), // green/gray
                      fillOpacity: 1,
                      strokeColor: "#ffffff",
                      strokeWeight: 2,
                      scale: 7,
                    }}
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

          {/* Floating buttons */}
          <div className="absolute bottom-6 right-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => fetchNearbyTechnicians(center.lat, center.lng, radius)}
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

        {/* Right side panel */}
        <div className="flex w-80 flex-col border-l border-gray-200 bg-white">
          {/* Panel header */}
          <div className="border-b border-gray-200 px-4 py-3">
            <div className="flex items-center gap-2 text-gray-900">
              <Users className="h-5 w-5" />
              <span className="text-sm font-semibold">
  Technicians (Online {onlineCount} / {totalFilteredCount})
</span>

            </div>
          </div>

          {/* Location + radius controls */}
          <div className="border-b border-gray-200 p-4 space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">
                Buyer Location
              </label>
              <Autocomplete onLoad={onAutoLoad} onPlaceChanged={onPlaceChanged}>
                <input
                  type="text"
                  placeholder="Type address / area..."
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#c20001] focus:outline-none focus:ring-1 focus:ring-[#c20001]"
                />
              </Autocomplete>

            </div>

            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-1">
                <label className="text-xs font-medium text-gray-700">
                  Radius (meters)
                </label>
                <input
                  type="number"
                  min={500}
                  step={500}
                  value={radius}
                  onChange={handleRadiusChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#c20001] focus:outline-none focus:ring-1 focus:ring-[#c20001]"
                />
              </div>
              <button
                type="button"
                onClick={handleSearchLocation}
                className="rounded-md bg-[#c20001] px-4 py-2 text-xs font-semibold text-white hover:bg-[#a10001]"
              >
                Find Techs
              </button>
            </div>
          </div>

          {/* Name search */}
          <div className="border-b border-gray-200 p-4">
            <input
              type="text"
              placeholder="Search technician by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#c20001] focus:outline-none focus:ring-1 focus:ring-[#c20001]"
            />
          </div>

          {/* Technician list */}
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
                    className={`cursor-pointer p-4 text-sm transition-colors ${hoveredTechnician === tech.id
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
                        {tech.distanceKm && (
                          <p className="mt-1 text-[11px] text-gray-500">
                            {tech.distanceKm}
                            {tech.estimatedTravelTime
                              ? ` • ${tech.estimatedTravelTime}`
                              : ""}
                          </p>
                        )}
                        {tech.openJobsCount > 0 && (
                          <p className="mt-1 text-[11px] text-gray-500">
                            Open jobs: {tech.openJobsCount}
                          </p>
                        )}
                      </div>
                      <div
                        className="mt-1 h-3 w-3 rounded-full"
                        style={{ backgroundColor: getPinColor(tech.isOnline) }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${getStatusBgClass(
                          tech.isOnline
                        )}`}
                      >
                        {tech.isOnline ? "Online" : "Offline"}
                      </span>
                      <span className="text-xs text-gray-400">
                        {tech.lastUpdated}
                      </span>
                    </div>
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

export default TechnicianMapViewNearby;
