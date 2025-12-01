// src/components/map/LocationPickerMap.jsx
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "320px",
};

function LocationPickerMap({ lat, lng, disabled = false, onChange }) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const center = { lat, lng };

  const handleMapClick = (event) => {
    if (disabled) return;
    const newLat = event.latLng.lat();
    const newLng = event.latLng.lng();
    onChange && onChange({ lat: newLat, lng: newLng });
  };

  const handleMarkerDragEnd = (event) => {
    if (disabled) return;
    const newLat = event.latLng.lat();
    const newLng = event.latLng.lng();
    onChange && onChange({ lat: newLat, lng: newLng });
  };

  if (loadError) {
    return (
      <div className="flex h-[320px] items-center justify-center bg-gray-100 text-sm text-red-600">
        Failed to load map
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex h-[320px] items-center justify-center bg-gray-100 text-sm text-gray-500">
        Loading map...
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={14}
      onClick={handleMapClick}
      options={{
        disableDefaultUI: true,
        zoomControl: true,
        draggable: !disabled,
      }}
    >
      <Marker
        position={center}
        draggable={!disabled}
        onDragEnd={handleMarkerDragEnd}
      />
    </GoogleMap>
  );
}

export default LocationPickerMap;
