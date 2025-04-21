// import MultiSigWallet from '../abis/MultiSigWallet.json'
// import MultiSigFactory from '../abis/MultiSigFactory.json'
// import Link from '../abis/Link.json'
// import Dai from '../abis/Dai.json'
import LandManagement from '../abis/LandManagement.json'

export const loadContract = async (contractName, web3) => {
  console.log(`[loadContract] Starting to load contract: ${contractName}`);
  
  if (!web3) {
    console.error("[loadContract] Web3 instance is not available");
    return null;
  }

  try {
    const NETWORK_ID = await web3.eth.net.getId();
    console.log(`[loadContract] Network ID: ${NETWORK_ID}`);

    let Artifact = null;
    if(contractName === "LandManagement"){
      Artifact = LandManagement;
      console.log("[loadContract] Using LandManagement artifact");
    }
//  else if(contractName === "MultiSigWallet"){
//    Artifact = MultiSigWallet;
//  }else if (contractName === "MultiSigFactory"){
//    Artifact = MultiSigFactory;
//  }
//  else if (contractName === "LINK"){
//    Artifact = Link;
//  }
//  else{
//    Artifact = Dai;
//  }

    if (!Artifact) {
      console.error(`[loadContract] No artifact found for contract: ${contractName}`);
      return null;
    }

    const networkData = Artifact.networks[NETWORK_ID];
    
    if (!networkData) {
      console.error(`[loadContract] No network data found for network ID: ${NETWORK_ID}`);
      return null;
    }

    console.log(`[loadContract] Creating contract instance at address: ${networkData.address}`);
    
    const contract = new web3.eth.Contract(
      Artifact.abi,
      networkData.address
    );

    console.log("[loadContract] Contract instance created successfully");
    return contract;
  }
  catch (err) {
    console.error("[loadContract] Error loading contract:", err);
    return null;
  }
};
