import { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { MapPin, Crosshair, X } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Fix for default marker icon in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom red marker for vendor location
const vendorIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Component to handle map click events
function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });
    },
  });

  return position ? (
    <Marker position={[position.lat, position.lng]} icon={vendorIcon} />
  ) : null;
}

// Component to recenter map
function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView([center.lat, center.lng], 15);
    }
  }, [center, map]);
  return null;
}

export default function LocationPicker({
  isOpen,
  onClose,
  onSelect,
  initialPosition,
}) {
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Default center (India)
  const defaultCenter = { lat: 20.5937, lng: 78.9629 };
  const [mapCenter, setMapCenter] = useState(defaultCenter);

  useEffect(() => {
    if (initialPosition?.lat && initialPosition?.lng) {
      setPosition(initialPosition);
      setMapCenter(initialPosition);
    }
  }, [initialPosition]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPosition = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setPosition(newPosition);
          setMapCenter(newPosition);
          setLoading(false);
        },
        (error) => {
          alert("Failed to get location: " + error.message);
          setLoading(false);
        },
        { enableHighAccuracy: true },
      );
    } else {
      alert("Geolocation is not supported by this browser");
    }
  };

  // Search for location using Nominatim (OpenStreetMap geocoding - free)
  const searchLocation = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query,
        )}&limit=5&countrycodes=in`,
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Search error:", error);
    }
    setSearching(false);
  };

  // Debounced search
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchLocation(value);
    }, 500);
  };

  const selectSearchResult = (result) => {
    const newPosition = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
    };
    setPosition(newPosition);
    setMapCenter(newPosition);
    setSearchQuery(result.display_name);
    setSearchResults([]);
  };

  const handleConfirm = () => {
    if (position) {
      // Reverse geocode to get address details
      fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}&addressdetails=1`,
      )
        .then((res) => res.json())
        .then((data) => {
          const address = data.address || {};

          // Extract city (can be in different fields depending on location)
          const city =
            address.city ||
            address.town ||
            address.village ||
            address.municipality ||
            address.suburb ||
            address.county ||
            "";

          // Extract state
          const state = address.state || "";

          // Extract pincode/postcode
          const pincode = address.postcode || "";

          onSelect({
            latitude: position.lat,
            longitude: position.lng,
            address: data.display_name || "",
            city: city,
            state: state,
            pincode: pincode,
          });
          onClose();
        })
        .catch(() => {
          onSelect({
            latitude: position.lat,
            longitude: position.lng,
            address: "",
            city: "",
            state: "",
            pincode: "",
          });
          onClose();
        });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="w-full max-w-4xl overflow-hidden bg-white rounded-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <MapPin className="text-red-500" size={20} />
            Select Location
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative p-4 border-b z-[1001]">
          <div className="relative">
            <input
              type="text"
              className="w-full input-field"
              placeholder="Search for a location..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {searching && (
              <div className="absolute -translate-y-1/2 right-3 top-1/2">
                <div className="w-4 h-4 border-b-2 border-orange-600 rounded-full animate-spin"></div>
              </div>
            )}

            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute left-0 right-0 z-[1000] mt-1 overflow-y-auto bg-white border rounded-lg shadow-lg top-full max-h-48">
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 text-sm border-b cursor-pointer hover:bg-gray-50 last:border-b-0"
                    onClick={() => selectSearchResult(result)}
                  >
                    {result.display_name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="relative h-[400px]">
          <MapContainer
            center={[mapCenter.lat, mapCenter.lng]}
            zoom={5}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker position={position} setPosition={setPosition} />
            <RecenterMap center={mapCenter} />
          </MapContainer>

          {/* Get Current Location Button */}
          <button
            onClick={getCurrentLocation}
            disabled={loading}
            className="absolute bottom-4 right-4 bg-white shadow-lg rounded-lg px-4 py-2 flex items-center gap-2 hover:bg-gray-50 transition z-[1000]"
          >
            {loading ? (
              <div className="w-4 h-4 border-b-2 border-orange-600 rounded-full animate-spin"></div>
            ) : (
              <Crosshair size={18} className="text-orange-600" />
            )}
            <span className="text-sm font-medium">
              {loading ? "Getting..." : "My Location"}
            </span>
          </button>
        </div>

        {/* Selected Coordinates */}
        {position && (
          <div className="p-4 border-t bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Selected Coordinates:</p>
                <p className="font-mono text-sm">
                  Lat: {position.lat.toFixed(6)}, Lng: {position.lng.toFixed(6)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!position}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
}
