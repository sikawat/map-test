import React, { useState, useEffect } from "react";
import Map, { Marker, Popup, MapMouseEvent } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "./map.css"; // Import the external CSS
import { MapPin } from "lucide-react"; // Import Lucide Icons

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

interface MarkerData {
  id: number;
  longitude: number;
  latitude: number;
  title: string;
  image: string;
}

const MapComponent: React.FC = () => {
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [isAddingMarker, setIsAddingMarker] = useState(false);
  const [editMarker, setEditMarker] = useState<MarkerData | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);

  useEffect(() => {
    const storedMarkers = localStorage.getItem("markers");
    if (storedMarkers) {
      try {
        const parsedMarkers = JSON.parse(storedMarkers);
        if (Array.isArray(parsedMarkers)) {
          setMarkers(parsedMarkers);
        }
      } catch (error) {
        console.error("Failed to parse markers from localStorage:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (markers.length > 0) {
      localStorage.setItem("markers", JSON.stringify(markers));
    } else {
      localStorage.removeItem("markers");
    }
  }, [markers]);

  const handleMapClick = (event: MapMouseEvent) => {
    if (isAddingMarker) {
      const { lng, lat } = event.lngLat;
      const newMarker = {
        id: Date.now(),
        longitude: lng,
        latitude: lat,
        title: "New Location",
        image: "https://via.placeholder.com/150",
      };
      setMarkers((prevMarkers) => [...prevMarkers, newMarker]);
      setIsAddingMarker(false);
    }
  };

  const saveEditedMarker = () => {
    if (editMarker) {
      setMarkers((prevMarkers) =>
        prevMarkers.map((marker) =>
          marker.id === editMarker.id ? { ...editMarker } : marker
        )
      );
      setSelectedMarker(editMarker);
      setEditMarker(null);
    }
  };

  const removeMarker = (id: number) => {
    setMarkers((prevMarkers) => prevMarkers.filter((marker) => marker.id !== id));
  };

  return (
    <div className="map-container">
      {/* Button for adding a marker */}
      <div className="add-marker-button" onClick={() => setIsAddingMarker(true)}>
        <MapPin size={20} />
        Add Marker
      </div>
      <Map
        initialViewState={{
          longitude: 100.523186,
          latitude: 13.736717,
          zoom: 12,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        onClick={handleMapClick}
      >
        {markers.map((marker) => (
          <Marker key={marker.id} longitude={marker.longitude} latitude={marker.latitude}>
            <div
              style={{
                position: "relative",
                transform: "translate(0%, -40%)",
                cursor: "pointer",
              }}
              onClick={() => setSelectedMarker(marker)}
            >
              <MapPin color="#FF0000" size={40} strokeWidth={3} fill="yellow" />
            </div>
          </Marker>
        ))}
        {selectedMarker && (
          <Popup
            longitude={selectedMarker.longitude}
            latitude={selectedMarker.latitude}
            anchor="top"
            onClose={() => setSelectedMarker(null)}
            closeOnClick={false}
          >
            <div className="popup-content">
              <h4 className="popup-header">{selectedMarker.title}</h4>
              <img
                src={selectedMarker.image}
                alt={selectedMarker.title}
                style={{ width: "100%", marginBottom: "0.5rem", borderRadius: "0.25rem" }}
              />
              <button
                onClick={() => {
                  setSelectedMarker(null);
                  setEditMarker(selectedMarker);
                }}
                className="save-button"
              >
                Edit Marker
              </button>
              <button
                onClick={() => {
                  removeMarker(selectedMarker.id);
                  setSelectedMarker(null);
                }}
                className="delete-button"
              >
                Delete Marker
              </button>
            </div>
          </Popup>
        )}
        {editMarker && (
          <Popup
            longitude={editMarker.longitude}
            latitude={editMarker.latitude}
            anchor="top"
            onClose={() => setEditMarker(null)}
            closeOnClick={false}
          >
            <div className="popup-content">
              <h4 className="popup-header">Edit Marker Details</h4>
              <input
                type="text"
                placeholder="Title"
                value={editMarker.title}
                onChange={(e) => setEditMarker({ ...editMarker, title: e.target.value })}
                className="popup-input"
              />
              <input
                type="text"
                placeholder="Image URL"
                value={editMarker.image}
                onChange={(e) => setEditMarker({ ...editMarker, image: e.target.value })}
                className="popup-input"
              />
              <button onClick={saveEditedMarker} className="save-button">
                Save
              </button>
              <button
                onClick={() => {
                  removeMarker(editMarker.id);
                  setEditMarker(null);
                }}
                className="delete-button"
              >
                Delete Marker
              </button>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
};

export default MapComponent;