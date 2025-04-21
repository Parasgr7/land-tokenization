// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LandManagement {
    struct Land {
        bool claimed;
        address owner;
        int256 latitude;
        int256 longitude;
    }

    mapping(string => Land) public landRegistry;
    mapping(address => string[]) public userLandInventory;

    event LandClaimed(address indexed user, string landId, int256 latitude, int256 longitude);
    event LandReleased(address indexed user, string landId);
    event LandSwapped(address indexed user1, address indexed user2, string landId1, string landId2);
    event UserDeleted(address indexed user);

    modifier onlyOwner(string memory landId) {
        require(landRegistry[landId].owner == msg.sender, "You do not own this land.");
        _;
    }

    modifier landNotClaimed(string memory landId) {
        require(!landRegistry[landId].claimed, "Land already claimed.");
        _;
    }

    modifier landClaimed(string memory landId) {
        require(landRegistry[landId].claimed, "Land is not claimed.");
        _;
    }

    modifier userHasLand(string memory landId) {
        bool ownsLand = false;
        string[] storage userLands = userLandInventory[msg.sender];
        for (uint256 i = 0; i < userLands.length; i++) {
            if (keccak256(abi.encodePacked(userLands[i])) == keccak256(abi.encodePacked(landId))) {
                ownsLand = true;
                break;
            }
        }
        require(ownsLand, "You do not own this land.");
        _;
    }

    modifier validLandId(string memory landId) {
        require(bytes(landId).length > 0, "Invalid land ID.");
        _;
    }

    function claimLand(string memory landId, int256 latitude, int256 longitude) 
        public 
        validLandId(landId) 
        landNotClaimed(landId) 
    {
        landRegistry[landId].claimed = true;
        landRegistry[landId].owner = msg.sender;
        landRegistry[landId].latitude = latitude;
        landRegistry[landId].longitude = longitude;

        userLandInventory[msg.sender].push(landId);

        emit LandClaimed(msg.sender, landId, latitude, longitude);
    }

    function releaseLand(string memory landId) public validLandId(landId) landClaimed(landId) userHasLand(landId) {
        string[] storage userLands = userLandInventory[msg.sender];
        for (uint256 i = 0; i < userLands.length; i++) {
            if (keccak256(abi.encodePacked(userLands[i])) == keccak256(abi.encodePacked(landId))) {
                userLands[i] = userLands[userLands.length - 1];
                userLands.pop();
                break;
            }
        }

        landRegistry[landId].claimed = false;
        landRegistry[landId].owner = address(0);
        landRegistry[landId].latitude = 0;
        landRegistry[landId].longitude = 0;

        emit LandReleased(msg.sender, landId);
    }

    function swapLand(string memory landId1, string memory landId2, address user2) public validLandId(landId1) validLandId(landId2) landClaimed(landId1) landClaimed(landId2) userHasLand(landId1) {
        require(user2 != msg.sender, "Land can't be swapped b/w same users");
        require(landRegistry[landId2].owner == user2, "User2 does not own the second land.");

        address tempOwner = landRegistry[landId1].owner;
        landRegistry[landId1].owner = landRegistry[landId2].owner;
        landRegistry[landId2].owner = tempOwner;

        int256 tempLat = landRegistry[landId1].latitude;
        int256 tempLng = landRegistry[landId1].longitude;
        
        landRegistry[landId1].latitude = landRegistry[landId2].latitude;
        landRegistry[landId1].longitude = landRegistry[landId2].longitude;
        
        landRegistry[landId2].latitude = tempLat;
        landRegistry[landId2].longitude = tempLng;

        _swapLandInInventory(landId1, landId2, msg.sender, user2);

        emit LandSwapped(msg.sender, user2, landId1, landId2);
    }

    function _swapLandInInventory(string memory landId1, string memory landId2, address user1, address user2) private {
        string[] storage user1Lands = userLandInventory[user1];
        string[] storage user2Lands = userLandInventory[user2];

        _removeLandFromInventory(user1Lands, landId1);
        _removeLandFromInventory(user2Lands, landId2);

        user1Lands.push(landId2);
        user2Lands.push(landId1);
    }

    function _removeLandFromInventory(string[] storage lands, string memory landId) private {
        for (uint256 i = 0; i < lands.length; i++) {
            if (keccak256(abi.encodePacked(lands[i])) == keccak256(abi.encodePacked(landId))) {
                lands[i] = lands[lands.length - 1];
                lands.pop();
                break;
            }
        }
    }

    function getUserInventory() public view returns (string[] memory) {
        return userLandInventory[msg.sender];
    }

    function getLandDetails(string memory landId) public view returns (bool claimed, address owner, int256 latitude, int256 longitude) {
        Land memory land = landRegistry[landId];
        return (land.claimed, land.owner, land.latitude, land.longitude);
    }

    function getAllLands() public view returns (string[] memory landIds, address[] memory owners, int256[] memory latitudes, int256[] memory longitudes) {
        uint256 count = 0;
        for (uint256 i = 0; i < userLandInventory[msg.sender].length; i++) {
            if (landRegistry[userLandInventory[msg.sender][i]].claimed) {
                count++;
            }
        }
        
        landIds = new string[](count);
        owners = new address[](count);
        latitudes = new int256[](count);
        longitudes = new int256[](count);
        
        uint256 index = 0;
        for (uint256 i = 0; i < userLandInventory[msg.sender].length; i++) {
            string memory landId = userLandInventory[msg.sender][i];
            if (landRegistry[landId].claimed) {
                landIds[index] = landId;
                owners[index] = landRegistry[landId].owner;
                latitudes[index] = landRegistry[landId].latitude;
                longitudes[index] = landRegistry[landId].longitude;
                index++;
            }
        }
        
        return (landIds, owners, latitudes, longitudes);
    }

    function deleteUser() public {
        string[] storage userLands = userLandInventory[msg.sender];

        for (uint256 i = 0; i < userLands.length; i++) {
            string memory landId = userLands[i];
            landRegistry[landId].claimed = false;
            landRegistry[landId].owner = address(0);
            landRegistry[landId].latitude = 0;
            landRegistry[landId].longitude = 0;

            emit LandReleased(msg.sender, landId);
        }

        delete userLandInventory[msg.sender];

        emit UserDeleted(msg.sender);
    }
}
