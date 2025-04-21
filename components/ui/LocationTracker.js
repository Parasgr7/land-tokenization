import React, { useEffect } from 'react';
import ClientOnlyMap from './ClientOnlyMap';

const MAP_API_KEY = "AIzaSyAP4AlyjcbTH6o4dQnIc8U-uCHhjmZZha0";

const LocationTracker = ({ 
  location, 
  setLocation, 
  inputLat, 
  setInputLat, 
  inputLng, 
  setInputLng, 
  locationName, 
  address, 
  onLocationUpdate,
  landDetails = []
}) => {
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      setLocation({
        lat: lat,
        lng: lng
      });
      setInputLat(lat.toFixed(6));
      setInputLng(lng.toFixed(6));

      const {name, location} = await fetchLocationName(lat, lng);
      onLocationUpdate({ lat, lng }, name, location);
    });
  }, []);

  const fetchLocationName = async (lat, lng) => {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${MAP_API_KEY}`
    );
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const filteredData = data.results.reduce((acc, result) => {
        if (result.address_components) {
          result.address_components.forEach(component => {
            if (
              component.types.includes("administrative_area_level_1") ||
              component.types.includes("administrative_area_level_2") ||
              component.types.includes("administrative_area_level_3") ||
              component.types.includes("country")
            ) {
              // Only add the type if it hasn't been added already
              if (!acc.some(entry => entry.type === component.types[0])) {
                acc.push({
                  type: component.types[0],
                  long_name: component.long_name
                });
              }
            }
          });
        }
        return acc;
      }, []);
      const highLevelAddress = filteredData.map(item => item.long_name).join(', ');
      return {"name": data.results[0].formatted_address, "location": highLevelAddress};
    }
    return {"name": "Unknown location", "location":"Unknown location"};
  };

  const handleSubmit = async () => {
    if (!inputLat || !inputLng) return;
    const lat = parseFloat(inputLat);
    const lng = parseFloat(inputLng);
    setLocation({ lat, lng });
  
    const {name, location} = await fetchLocationName(lat, lng);
    onLocationUpdate({ lat, lng }, name, location);
  };

  return (
    <div className="w-full sm:max-w-md md:max-w-lg lg:max-w-xl rounded-lg overflow-hidden shadow-lg bg-white">
      <div className="px-6 py-4 font-bold border-b border-gray-300 text-center">
        Location Tracker
      </div>
      <div className="px-6 py-4 space-y-4">
        <div className="flex flex-col md:flex-row items-end gap-4">
          <div className="flex flex-col w-full md:w-auto">
            <label className="mb-1 font-medium text-sm">Latitude</label>
            <input
              type="text"
              placeholder="Latitude"
              value={inputLat}
              onChange={(e) => setInputLat(e.target.value)}
              className="border px-4 py-2 rounded w-full"
            />
          </div>

          <div className="flex flex-col w-full md:w-auto">
            <label className="mb-1 font-medium text-sm">Longitude</label>
            <input
              type="text"
              placeholder="Longitude"
              value={inputLng}
              onChange={(e) => setInputLng(e.target.value)}
              className="border px-4 py-2 rounded w-full"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white font-bold px-4 py-2 rounded hover:bg-blue-600 w-full md:w-auto"
          >
            Go
          </button>
        </div>

        {address && (
          <span className="text-sm text-gray-600 block mt-1">
            📍 <b>Current Location: </b>{address}
          </span>
        )}

        {/* Map Section */}
        {location ? (
          <ClientOnlyMap 
            key={`${location.lat}-${location.lng}`} 
            locationName={locationName} 
            lat={location.lat} 
            lng={location.lng}
            landDetails={landDetails}
          />
        ) : (
          <p>Fetching location...</p>
        )}
      </div>
    </div>
  );
};

export default LocationTracker; 