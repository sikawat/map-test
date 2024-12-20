import React, { useState, useEffect } from "react";
import Map, { Marker, Popup, MapMouseEvent, Source, Layer } from "react-map-gl";
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
  const [polygonPoints, setPolygonPoints] = useState<{ longitude: number; latitude: number }[]>([]);
  const [savedPolygons, setSavedPolygons] = useState<{ longitude: number; latitude: number }[][]>([]);

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

    const storedPolygons = localStorage.getItem("polygons");
    if (storedPolygons) {
      try {
        const parsedPolygons = JSON.parse(storedPolygons);
        if (Array.isArray(parsedPolygons)) {
          setSavedPolygons(parsedPolygons);
        }
      } catch (error) {
        console.error("Failed to parse polygons from localStorage:", error);
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

  useEffect(() => {
    if (savedPolygons.length > 0) {
      localStorage.setItem("polygons", JSON.stringify(savedPolygons));
    } else {
      localStorage.removeItem("polygons");
    }
  }, [savedPolygons]);

  const handleMapClick = (event: MapMouseEvent) => {
    const { lng, lat } = event.lngLat;

    if (isAddingMarker) {
      const newMarker = {
        id: Date.now(),
        longitude: lng,
        latitude: lat,
        title: "New Location",
        image: "https://via.placeholder.com/150",
      };
      setMarkers((prevMarkers) => [...prevMarkers, newMarker]);
      setIsAddingMarker(false);
    } else {
      setPolygonPoints((prevPoints) => [...prevPoints, { longitude: lng, latitude: lat }]);
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

  const clearPolygon = () => {
    setPolygonPoints([]);
  };

  const savePolygon = () => {
    if (polygonPoints.length > 2) {
      setSavedPolygons((prevPolygons) => [...prevPolygons, polygonPoints]);
      clearPolygon();
      alert("Polygon has been saved!");
    } else {
      alert("A polygon must have at least 3 points!");
    }
  };

  return (
    <div className="map-container">
      <div className="toolbar">
        <div className="add-marker-button" onClick={() => setIsAddingMarker(true)}>
          <MapPin size={20} /> Add Marker
        </div>
        <div className="clear-polygon-button" onClick={clearPolygon}>
          Clear Polygon
        </div>
        <div className="save-polygon-button" onClick={savePolygon}>
          Save Polygon
        </div>
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

        {polygonPoints.length > 2 && (
          <Source
            id="polygon"
            type="geojson"
            data={{
              type: "Feature",
              geometry: {
                type: "Polygon",
                coordinates: [polygonPoints.map((point) => [point.longitude, point.latitude])],
              },
            }}
          >
            <Layer
              id="polygon-layer"
              type="fill"
              paint={{ "fill-color": "#888888", "fill-opacity": 0.4 }}
            />
          </Source>
        )}

        {savedPolygons.map((polygon, index) => (
          <Source
            key={`saved-polygon-${index}`}
            id={`saved-polygon-${index}`}
            type="geojson"
            data={{
              type: "Feature",
              geometry: {
                type: "Polygon",
                coordinates: [polygon.map((point) => [point.longitude, point.latitude])],
              },
            }}
          >
            <Layer
              id={`saved-polygon-layer-${index}`}
              type="fill"
              paint={{ "fill-color": "#007bff", "fill-opacity": 0.4 }}
            />
          </Source>
        ))}
      </Map>
    </div>
  );
};

export default MapComponent;