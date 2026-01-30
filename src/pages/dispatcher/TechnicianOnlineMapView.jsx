// src/pages/dispatcher/TechnicianMapViewNearby.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { GoogleMap, MarkerF, InfoWindow, Autocomplete, useJsApiLoader } from "@react-google-maps/api";


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

function getPinColor(statusLabel) {
  if (statusLabel === "Online") return "#16a34a"; // green
  if (statusLabel === "Busy") return "#eab308"; // yellow
  return "#6b7280"; // gray for offline
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
  const navigate = useNavigate();

  // job location (map center) - will be updated from API response
  const [center, setCenter] = useState({
    lat: 18.0858, // Default to Nouakchott, Mauritania coordinates
    lng: -15.9785,
  });

  const [radius, setRadius] = useState(5000); // for zoom control only
  const [locationQuery, setLocationQuery] = useState("");
  const [autocompleteRef, setAutocompleteRef] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [totalCount, setTotalCount] = useState(0);
  const [technicianLocations, setTechnicianLocations] = useState([]);
  const [hoveredTechnician, setHoveredTechnician] = useState(null);
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const mapRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  // -------------------------------------------------------------------
  // API: /api/dispatcher/technicians/nearby?latitude=&longitude=
  // -------------------------------------------------------------------
  const fetchNearbyTechnicians = async (lat, lng) => {
    try {
      setLoading(true);
      setError("");

      const { data } = await axiosClient.get("/dispatcher/technicians/nearby", {
        params: {
          latitude: lat,
          longitude: lng,
        },
      });

      const technicians = Array.isArray(data?.technicians) ? data.technicians : [];

      // Update center from jobLocation in response
      if (data?.jobLocation?.latitude != null && data?.jobLocation?.longitude != null) {
        setCenter({
          lat: Number(data.jobLocation.latitude),
          lng: Number(data.jobLocation.longitude),
        });
      }

      const mapped = technicians.map((t) => {
        const status = String(t.locationStatus || "").toUpperCase();
        // Consider ONLINE and BUSY as online/active
        const isOnline = status === "ONLINE" || status === "BUSY";

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
          statusLabel: status === "ONLINE" ? "Online" : status === "BUSY" ? "Busy" : "Offline",
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
      fetchNearbyTechnicians(center.lat, center.lng);
    }, 30000);

    return () => clearInterval(interval);
  }, [center.lat, center.lng]);


  // technician name filter (right panel)
  const filteredTechnicians = technicianLocations.filter((tech) =>
    tech.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onlineCount = filteredTechnicians.filter((t) => t.isOnline).length;
  const totalFilteredCount = filteredTechnicians.length;


  const mapZoom =
    radius <= 2000 ? 14 : radius <= 5000 ? 13 : radius <= 10000 ? 12 : 11;

  const handleRadiusChange = (e) => {
    const value = Number(e.target.value);
    if (!Number.isNaN(value) && value > 0) {
      setRadius(value);
      // Radius is only used for zoom level, not for API filtering
    }
  };

  // Handle location search with Autocomplete restricted to Mauritania
  const onPlaceChanged = () => {
    if (autocompleteRef) {
      const place = autocompleteRef.getPlace();
      const location = place?.geometry?.location;
      if (location) {
        const newCenter = {
          lat: location.lat(),
          lng: location.lng(),
        };
        setCenter(newCenter);
        fetchNearbyTechnicians(newCenter.lat, newCenter.lng);
      }
    }
  };

  // Handle technician click - center map on technician location
  const handleTechnicianClick = (tech) => {
    if (tech.lat != null && tech.lng != null) {
      setSelectedTechnician(tech.id);
      const newCenter = { lat: tech.lat, lng: tech.lng };
      setCenter(newCenter);
      
      // Zoom in closer when selecting a technician
      if (mapRef.current) {
        mapRef.current.panTo(newCenter);
        mapRef.current.setZoom(15);
      }
    }
  };

  const onMapLoad = (map) => {
    mapRef.current = map;
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

          {/* Legend: Online / Busy / Offline */}
          <div className="flex items-center gap-4 text-xs md:text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-600" />
              <span className="text-gray-600">Online</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <span className="text-gray-600">Busy</span>
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
              onLoad={onMapLoad}
              options={{
                disableDefaultUI: true,
                clickableIcons: false,
              }}
            >
              {filteredTechnicians.map((tech) =>
                tech.lat != null && tech.lng != null ? (
                  <React.Fragment key={tech.id}>
                    {/* Outer pulsing circles for selected technician */}
                    {selectedTechnician === tech.id && window.google?.maps && (
                      <>
                        {/* Largest outer circle */}
                        <MarkerF
                          position={{ lat: tech.lat, lng: tech.lng }}
                          icon={{
                            path: window.google.maps.SymbolPath.CIRCLE,
                            fillColor: "#c20001",
                            fillOpacity: 0.15,
                            strokeColor: "#c20001",
                            strokeWeight: 4,
                            scale: 25,
                          }}
                          zIndex={1}
                        />
                        {/* Medium outer circle */}
                        <MarkerF
                          position={{ lat: tech.lat, lng: tech.lng }}
                          icon={{
                            path: window.google.maps.SymbolPath.CIRCLE,
                            fillColor: "#c20001",
                            fillOpacity: 0.25,
                            strokeColor: "#c20001",
                            strokeWeight: 3,
                            scale: 20,
                          }}
                          zIndex={2}
                        />
                        {/* Inner circle */}
                        <MarkerF
                          position={{ lat: tech.lat, lng: tech.lng }}
                          icon={{
                            path: window.google.maps.SymbolPath.CIRCLE,
                            fillColor: "#c20001",
                            fillOpacity: 0.35,
                            strokeColor: "#c20001",
                            strokeWeight: 2,
                            scale: 16,
                          }}
                          zIndex={3}
                        />
                      </>
                    )}
                    {/* Main technician marker */}
                    <MarkerF
                      position={{ lat: tech.lat, lng: tech.lng }}
                      icon={window.google?.maps ? {
                        path: window.google.maps.SymbolPath.CIRCLE,
                        fillColor: selectedTechnician === tech.id ? "#c20001" : getPinColor(tech.statusLabel),
                        fillOpacity: selectedTechnician === tech.id ? 1 : 1,
                        strokeColor: selectedTechnician === tech.id ? "#ffffff" : "#ffffff",
                        strokeWeight: selectedTechnician === tech.id ? 6 : 3,
                        scale: selectedTechnician === tech.id ? 18 : 11,
                      } : undefined}
                      onClick={() => handleTechnicianClick(tech)}
                      zIndex={selectedTechnician === tech.id ? 10 : 3}
                    />
                    {selectedTechnician === tech.id && (
                      <InfoWindow
                        position={{ lat: tech.lat, lng: tech.lng }}
                        onCloseClick={() => setSelectedTechnician(null)}
                        options={window.google?.maps ? {
                          pixelOffset: new window.google.maps.Size(0, -10),
                        } : {}}
                      >
                        <div className="p-4 min-w-[220px]">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-bold text-[#c20001] text-base mb-1">{tech.name}</h3>
                              <div className="flex items-center gap-2">
                                <div
                                  className="h-2.5 w-2.5 rounded-full"
                                  style={{ backgroundColor: getPinColor(tech.statusLabel) }}
                                />
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                  tech.statusLabel === "Online"
                                    ? "bg-green-100 text-green-800"
                                    : tech.statusLabel === "Busy"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-700"
                                }`}>
                                  {tech.statusLabel}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Divider */}
                          <div className="border-t border-gray-200 my-3" />

                          {/* Details */}
                          <div className="space-y-2.5">
                            {tech.specialty && (
                              <div className="flex items-start gap-2">
                                <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <div>
                                  <p className="text-xs text-gray-500 font-medium">Specialization</p>
                                  <p className="text-sm text-gray-900 mt-0.5">{tech.specialty}</p>
                                </div>
                              </div>
                            )}

                            {tech.phone && (
                              <div className="flex items-start gap-2">
                                <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <div>
                                  <p className="text-xs text-gray-500 font-medium">Phone</p>
                                  <p className="text-sm text-gray-900 mt-0.5">{tech.phone}</p>
                                </div>
                              </div>
                            )}

                            {tech.distanceKm && (
                              <div className="flex items-start gap-2">
                                <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <div>
                                  <p className="text-xs text-gray-500 font-medium">Distance</p>
                                  <p className="text-sm text-gray-900 mt-0.5">
                                    {tech.distanceKm}
                                    {tech.estimatedTravelTime && (
                                      <span className="text-gray-500 ml-1">• {tech.estimatedTravelTime}</span>
                                    )}
                                  </p>
                                </div>
                              </div>
                            )}

                            {tech.openJobsCount > 0 && (
                              <div className="flex items-start gap-2">
                                <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                <div>
                                  <p className="text-xs text-gray-500 font-medium">Open Jobs</p>
                                  <p className="text-sm text-gray-900 mt-0.5">{tech.openJobsCount} active job{tech.openJobsCount !== 1 ? 's' : ''}</p>
                                </div>
                              </div>
                            )}

                            {tech.type && (
                              <div className="flex items-start gap-2">
                                <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <div>
                                  <p className="text-xs text-gray-500 font-medium">Type</p>
                                  <p className="text-sm text-gray-900 mt-0.5">
                                    {tech.type === "INTERNAL" ? "Internal Employee" : "Freelancer"}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </InfoWindow>
                    )}
                  </React.Fragment>
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
              onClick={() => fetchNearbyTechnicians(center.lat, center.lng)}
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
                Total Technicians ({totalFilteredCount})
              </span>

            </div>
          </div>

          {/* Location search - restricted to Mauritania */}
          <div className="border-b border-gray-200 p-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">
                Search Location (Mauritania only)
              </label>
              {isLoaded ? (
                <Autocomplete
                  onLoad={(autocomplete) => setAutocompleteRef(autocomplete)}
                  onPlaceChanged={onPlaceChanged}
                  options={{
                    componentRestrictions: { country: "mr" }, // Restrict to Mauritania
                    types: ["geocode", "establishment"],
                  }}
                >
                  <input
                    type="text"
                    placeholder="Search location in Mauritania..."
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#c20001] focus:outline-none focus:ring-1 focus:ring-[#c20001]"
                  />
                </Autocomplete>
              ) : (
                <input
                  type="text"
                  placeholder="Loading Google Places..."
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  disabled
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-gray-100 text-gray-500"
                />
              )}
              <p className="text-xs text-gray-500 mt-1">
                Search restricted to locations in Mauritania
              </p>
            </div>
          </div>

          {/* Radius control (for zoom level only) */}
          <div className="border-b border-gray-200 p-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">
                Map Zoom Level (meters)
              </label>
              <input
                type="number"
                min={500}
                step={500}
                value={radius}
                onChange={handleRadiusChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#c20001] focus:outline-none focus:ring-1 focus:ring-[#c20001]"
              />
              <p className="text-xs text-gray-500 mt-1">
                Adjusts map zoom level only
              </p>
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
                    className={`cursor-pointer p-4 text-sm transition-colors ${
                      selectedTechnician === tech.id
                        ? "bg-[#c20001]/10 border-l-4 border-[#c20001]"
                        : hoveredTechnician === tech.id
                        ? "bg-gray-50"
                        : "hover:bg-gray-50"
                    }`}
                    onMouseEnter={() => setHoveredTechnician(tech.id)}
                    onMouseLeave={() => setHoveredTechnician(null)}
                    onClick={() => handleTechnicianClick(tech)}
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
                        style={{ backgroundColor: getPinColor(tech.statusLabel) }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          tech.statusLabel === "Online"
                            ? "bg-green-100 text-green-800"
                            : tech.statusLabel === "Busy"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {tech.statusLabel}
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
