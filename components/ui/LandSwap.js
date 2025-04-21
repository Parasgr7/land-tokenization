import React from 'react';

const LandSwap = ({ 
  selectedLandForSwap, 
  recipientAddress, 
  setRecipientAddress, 
  recipientLandId, 
  setRecipientLandId, 
  onTransferLand 
}) => {
  return (
    <div className="grid my-10 items-center justify-center text-center">
      <div className="max-w-sm w-96 rounded-lg overflow-hidden shadow-lg bg-white">
        <div className="px-6 py-4 font-bold border-b border-gray-300">
          Swap Land
        </div>
        <div className="px-6 py-4 space-y-4">
          {selectedLandForSwap ? (
            <div className="bg-green-50 p-2 rounded">
              <p className="text-sm text-green-700">
                <b>Selected land:</b> <span className="font-medium">{selectedLandForSwap}</span>
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center">
              Select a land from your inventory to swap
            </p>
          )}
          
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recipient Address
              </label>
              <input
                type="text"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder="0x..."
                className="w-full border rounded px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recipients Land ID
              </label>
              <input
                type="text"
                value={recipientLandId}
                onChange={(e) => setRecipientLandId(e.target.value)}
                placeholder="Enter the land ID to swap with"
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
          
          <button
            onClick={onTransferLand}
            disabled={!selectedLandForSwap || !recipientAddress || !recipientLandId}
            className={`w-full py-2 px-4 rounded font-bold ${
              !selectedLandForSwap || !recipientAddress || !recipientLandId
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            Swap Lands
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandSwap; 