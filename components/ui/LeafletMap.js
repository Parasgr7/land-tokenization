import { useState, useEffect, useRef, Fragment } from "react";
import { MapContainer, TileLayer, Marker, Rectangle, useMapEvents, Popup, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const GRID_SIZE = 0.0002;

function LocationMarker({ setLatLng }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setLatLng([lat, lng]); // Update latLng on map click
    }
  });
  return null;
}

// Custom Legend component
function MapLegend() {
  return (
    <div className="leaflet-control leaflet-control-zoom leaflet-bar leaflet-control-layers">
      <div className="bg-white p-2 rounded shadow-md text-xs">
        <div className="flex items-center mb-1">
          <div className="w-4 h-4 bg-blue-500 mr-1"></div>
          <span>Current Location</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-500 mr-1"></div>
          <span>Your Land</span>
        </div>
      </div>
    </div>
  );
}

export default function LeafletMap({ key, locationName, lat, lng, landDetails = [] }) {
  const [latLng, setLatLng] = useState([lat, lng]);

  const bounds = [
    [latLng[0], latLng[1]],
    [latLng[0] + GRID_SIZE, latLng[1] + GRID_SIZE]
  ];

  // Create a custom marker icon (using Leaflet CDN images)
  const defaultIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png", // Changed to blue for current location
    iconSize: [25, 41], // Size of the icon
    iconAnchor: [12, 41], // Anchor point of the icon
    popupAnchor: [1, -34], // Popup anchor
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png", // CDN URL for marker shadow
    shadowSize: [41, 41], // Shadow size
  });

  // Create a custom marker icon for claimed lands
  const claimedIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png", // Red for user's lands
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    shadowSize: [41, 41],
  });

  // Get the center of the rectangle for the marker position
  const rectangleCenter = [
    (bounds[0][0] + bounds[1][0]) / 2,
    (bounds[0][1] + bounds[1][1]) / 2
  ];

  // Convert integer coordinates back to float
  const convertToFloat = (intValue) => {
    return intValue / 1000000;
  };

  // Calculate map bounds to include all lands
  const calculateMapBounds = () => {
    if (!landDetails || landDetails.length === 0) {
      return null;
    }

    let minLat = lat;
    let maxLat = lat;
    let minLng = lng;
    let maxLng = lng;

    landDetails.forEach(land => {
      const landLat = convertToFloat(land.latitude);
      const landLng = convertToFloat(land.longitude);
      
      if (landLat !== 0 && landLng !== 0) {
        minLat = Math.min(minLat, landLat);
        maxLat = Math.max(maxLat, landLat);
        minLng = Math.min(minLng, landLng);
        maxLng = Math.max(maxLng, landLng);
      }
    });

    // Add padding
    const padding = 0.01;
    return [
      [minLat - padding, minLng - padding],
      [maxLat + padding, maxLng + padding]
    ];
  };

  // Check if current location matches any of the user's lands
  const isCurrentLocationOnUserLand = () => {
    if (!landDetails || landDetails.length === 0) return false;
    
    return landDetails.some(land => {
      const landLat = convertToFloat(land.latitude);
      const landLng = convertToFloat(land.longitude);
      
      // Check if coordinates match (with a small tolerance for floating point comparison)
      const latMatch = Math.abs(landLat - lat) < 0.000001;
      const lngMatch = Math.abs(landLng - lng) < 0.000001;
      
      return latMatch && lngMatch;
    });
  };

  const mapBounds = calculateMapBounds();
  const currentLocationOnUserLand = isCurrentLocationOnUserLand();

  return (
    <div className="relative">
      <MapContainer
        key={key} 
        center={latLng}
        zoom={16}
        scrollWheelZoom={true}
        style={{ height: "400px", width: "100%" }}
        bounds={mapBounds}
        boundsOptions={{ padding: [50, 50] }}
        zoomControl={false}
      >
        <ZoomControl position="bottomright" />
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution='Tiles © Esri'
        />
        
        {/* Current location marker - only show if not on user's land */}
        {!currentLocationOnUserLand && (
          <Marker position={rectangleCenter} icon={defaultIcon} draggable={false}> 
            <Popup>
              <span><b>Full Address:</b> {locationName || "You are here"}</span>
            </Popup>
          </Marker>
        )}
        
        {/* Current location rectangle - only show if not on user's land */}
        {!currentLocationOnUserLand && (
          <Rectangle
            bounds={bounds}
            pathOptions={{ color: "blue", fillOpacity: 0.3 }}
          />
        )}
        
        {/* Display all claimed lands */}
        {landDetails && landDetails.map((land, index) => {
          const landLat = convertToFloat(land.latitude);
          const landLng = convertToFloat(land.longitude);
          
          if (landLat === 0 && landLng === 0) return null; // Skip lands with no coordinates
          
          const landBounds = [
            [landLat, landLng],
            [landLat + GRID_SIZE, landLng + GRID_SIZE]
          ];
          
          // Check if this land is at the current location
          const isCurrentLand = Math.abs(landLat - lat) < 0.000001 && Math.abs(landLng - lng) < 0.000001;
          
          return (
            <Fragment key={index}>
              <Marker 
                position={[landLat, landLng]} 
                icon={claimedIcon}
              >
                <Popup>
                  <div>
                    <p><b>Land ID:</b> {land.landId}</p>
                    <p><b>Owner:</b> {land.owner.substring(0, 6)}...{land.owner.substring(land.owner.length - 4)}</p>
                    {/* <p><b>Three Words:</b> {land.threeWords}</p> */}
                    {isCurrentLand && <p className="text-blue-500 font-bold">You are here</p>}
                  </div>
                </Popup>
              </Marker>
              <Rectangle
                bounds={landBounds}
                pathOptions={{ color: "red", fillOpacity: 0.5, weight: 2 }}
              />
            </Fragment>
          );
        })}
        
        {/* <LocationMarker setLatLng={setLatLng} /> */}
      </MapContainer>
      <div className="absolute bottom-10 left-2 z-[1000]">
        <MapLegend />
      </div>
    </div>
  );
}
