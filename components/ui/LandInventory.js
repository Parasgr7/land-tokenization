import React from 'react';

const LandInventory = ({ 
  userLands, 
  selectedLandForSwap, 
  setSelectedLandForSwap, 
  onReleaseLand
}) => {
  return (
    <div className="w-full sm:max-w-md md:max-w-lg lg:max-w-xl rounded-lg overflow-hidden shadow-lg bg-white">
      <div className="px-6 py-4 font-bold border-b border-gray-300 text-center">
        My Land Inventory
      </div>
      <div className="px-6 py-4">
        {userLands.length > 0 ? (
          <div className="space-y-2">
            {userLands.map((landId, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm font-medium">{landId}</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onReleaseLand(landId)}
                    className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                  >
                    Release
                  </button>
                  <button
                    onClick={() => setSelectedLandForSwap(landId)}
                    className={`text-xs px-2 py-1 rounded ${
                      selectedLandForSwap === landId
                        ? "bg-green-500 text-white"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                  >
                    {selectedLandForSwap === landId ? "Selected" : "Select for Swap"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No lands claimed yet</p>
        )}
      </div>
    </div>
  );
};

export default LandInventory; 