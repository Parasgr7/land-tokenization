import React from 'react';

const LandAcquisition = ({ threeWords, onClaimLand }) => {
  return (
    <div className="grid mb-5 items-center justify-center text-center">
      <div className="max-w-sm w-96 rounded-lg overflow-hidden shadow-lg bg-white">
        <div className="px-6 py-4 font-bold border-b border-gray-300">
          Acquisition
        </div>
        <div className="px-6 py-4">
          {threeWords && (
            <span className="text-sm text-gray-600 block mt-1">
              📍 <b>Unique Identifier: </b>{threeWords}
            </span>
          )}
          <br/>
          <button
            className="text-md bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-800"
            onClick={onClaimLand}
          >
            Claim Land
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandAcquisition; 