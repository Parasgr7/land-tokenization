import React, { useContext, useEffect, useState, useRef, Fragment } from "react";
import { useWeb3 } from "../providers/web3";
import Link from "next/link";
import { trackPromise } from "react-promise-tracker";
import { LoadingSpinerComponent } from "../../utils/Spinner";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Web3 from "web3";
import ClientOnlyMap from "./ClientOnlyMap";
import LocationTracker from "./LocationTracker";
import LandAcquisition from "./LandAcquisition";
import LandInventory from "./LandInventory";
import LandSwap from "./LandSwap";
import { useLandManagement } from "../hooks/useLandManagement";

export default function Landing({ walletList, accountAddr }) {
  const { state } = useWeb3();
  const [location, setLocation] = useState(null);
  const [inputLat, setInputLat] = useState("");
  const [inputLng, setInputLng] = useState("");
  const [locationName, setLocationName] = useState("");
  const [address, setAddress] = useState("");
  const [threeWords, setThreeWords] = useState('');
  const [userLands, setUserLands] = useState([]);
  const [selectedLandForSwap, setSelectedLandForSwap] = useState(null);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [recipientLandId, setRecipientLandId] = useState("");
  const [landDetails, setLandDetails] = useState([]);

  const { fetchUserLands, claimLand, releaseLand, transferLand, deleteUser } = useLandManagement(
    state.landManagement,
    accountAddr,
    setUserLands,
    setLandDetails
  );


  useEffect(() => {
    const getThreeWords = (name) => {
      return name
        .split(',')
        .map(part =>
          part
            .trim()
            .split(' ')[0]
            .replace(/[^a-zA-Z0-9]/g, '')
        )
        .filter(Boolean)
        .slice(0, 3)
        .join('.')
        .toLowerCase();
    };
  
    if (locationName) {
      console.log('locationName', locationName);
      setThreeWords(getThreeWords(locationName));
    }
  }, [locationName]);

  // Automatically fetch user lands when component mounts or when landManagement/accountAddr changes
  useEffect(() => {
    if (state.landManagement && accountAddr) {
      fetchUserLands();
      
      // Set up an interval to refresh lands every 50 seconds
      const intervalId = setInterval(() => {
        fetchUserLands();
      }, 50000);
      
      // Clean up the interval when component unmounts or dependencies change
      return () => clearInterval(intervalId);
    }
  }, [state.landManagement, accountAddr]);

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
      setLocationName(name);
      setAddress(location)
    });
  }, []);

  const fetchLocationName = async (lat, lng) => {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.MAP_API_KEY}`
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
    setLocationName(name);
    setAddress(location)
};


  const handleLocationUpdate = (newLocation, newLocationName, newAddress) => {
    setLocation(newLocation);
    setLocationName(newLocationName);
    setAddress(newAddress);
  };

  const handleClaimLand = () => {
    if (!threeWords) {
      toast.error("Please wait for location data to be processed", {
        hideProgressBar: true,
        theme: "white",
      });
      return;
    }
    
    claimLand(threeWords, inputLat, inputLng);
  };

  const handleReleaseLand = (landId) => {
    releaseLand(landId);
  };

  const handleTransferLand = () => {
    transferLand(selectedLandForSwap, recipientLandId, recipientAddress);
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <LocationTracker 
            location={location}
            setLocation={setLocation}
            inputLat={inputLat}
            setInputLat={setInputLat}
            inputLng={inputLng}
            setInputLng={setInputLng}
            locationName={locationName}
            address={address}
            threeWords={threeWords}
            onLocationUpdate={handleLocationUpdate}
            landDetails={landDetails}
          />
        </div>
        <div className="md:col-span-1">
          <LandAcquisition 
              threeWords={threeWords}
              onClaimLand={handleClaimLand}
            />
            <LandSwap 
              selectedLandForSwap={selectedLandForSwap}
              recipientAddress={recipientAddress}
              setRecipientAddress={setRecipientAddress}
              recipientLandId={recipientLandId}
              setRecipientLandId={setRecipientLandId}
              onTransferLand={handleTransferLand}
            />
        </div>
        <div className="md:col-span-1">
          <LandInventory 
            userLands={userLands}
            selectedLandForSwap={selectedLandForSwap}
            setSelectedLandForSwap={setSelectedLandForSwap}
            onReleaseLand={handleReleaseLand}
          />
        </div>
        
      </div>
    </div>
  );
}
