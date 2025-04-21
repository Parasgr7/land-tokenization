import LandManagement from '../abis/LandManagement.json'

export const loadContract = async (contractName, web3) => {
  
  if (!web3) {
    console.error("[loadContract] Web3 instance is not available");
    return null;
  }

  try {
    const NETWORK_ID = await web3.eth.net.getId();

    let Artifact = null;
    if(contractName === "LandManagement"){
      Artifact = LandManagement;
    }

    if (!Artifact) {
      console.error(`[loadContract] No artifact found for contract: ${contractName}`);
      return null;
    }

    const networkData = Artifact.networks[NETWORK_ID];
    
    if (!networkData) {
      console.error(`[loadContract] No network data found for network ID: ${NETWORK_ID}`);
      return null;
    }
    
    const contract = new web3.eth.Contract(
      Artifact.abi,
      networkData.address
    );

    return contract;
  }
  catch (err) {
    console.error("[loadContract] Error loading contract:", err);
    return null;
  }
};
