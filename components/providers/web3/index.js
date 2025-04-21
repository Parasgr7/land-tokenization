import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import detectEthereumProvider from "@metamask/detect-provider";
import Web3 from "web3";
import { setupHooks } from "./hooks/setupHooks";
import { loadContract } from "../../../utils/loadContract";

export const Web3Context = createContext(null);

const setListeners = (provider) => {
  provider.on("chainChanged", (_) => window.location.reload());
};

export const Web3Provider = ({ children }) => {
  const [web3Api, setWeb3Api] = useState({
    provider: null,
    web3: null,
    landManagement: null,
    isLoading: true,
    error: null,
    hooks: setupHooks({ web3: null, provider: null, selectedWallet: null })
  });

  const [selectedToken, setSelectedToken] = useState("ETH");
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        // Check if MetaMask is installed
        if (window.ethereum) {
          const provider = window.ethereum;
          const web3Instance = new Web3(provider);
          
          // Request account access
          const accounts = await provider.request({ method: 'eth_requestAccounts' });
          const selectedWallet = accounts[0];
          
          // Load the contract
          const landManagement = await loadContract("LandManagement", web3Instance);
          
          if (!landManagement) {
            throw new Error("Failed to load LandManagement contract");
          }
          
          setWeb3Api({
            provider,
            web3: web3Instance,
            landManagement,
            isLoading: false,
            error: null,
            hooks: setupHooks({ web3: web3Instance, provider, selectedWallet })
          });
          
          setListeners(provider);
        } else {
          setWeb3Api(prevState => ({
            ...prevState,
            isLoading: false,
            error: 'Please install MetaMask!'
          }));
        }
      } catch (error) {
        console.error('Error in Web3Provider initialization:', error);
        setWeb3Api(prevState => ({
          ...prevState,
          isLoading: false,
          error: error.message
        }));
      }
    };

    init();
  }, []);

  const _web3Api = useMemo(() => {
    const { web3, provider, isLoading } = web3Api;

    return {
      ...web3Api,
      requireInstall: !isLoading && !web3,
      connect: provider
        ? async () => {
            try {
              const accounts = await provider.request({
                method: "eth_requestAccounts",
              });
              const selectedWallet = accounts[0];
              setWeb3Api(prevState => ({
                ...prevState,
                selectedWallet,
                hooks: setupHooks({ 
                  web3: prevState.web3, 
                  provider: prevState.provider, 
                  selectedWallet 
                })
              }));
            } catch {
              location.reload();
            }
          }
        : () => console.log("Cannot find provider"),
    };
  }, [web3Api]);

  return (
    <Web3Context.Provider
      value={{
        state: _web3Api,
        selectedToken,
        setSelectedToken,
        balance,
        setBalance,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

// Add default export for backward compatibility
export default Web3Provider;

export function useWeb3() {
  return useContext(Web3Context);
}

export function useHooks(callback) {
  const { state } = useWeb3();
  return callback(state.hooks);
}

/*

getHooks() method returns a dictionary containing name of the hook (key) and the handler to the hook (value)
That dictionary will be accessible anywhere useHooks() method is called because the dictionary is passed as an argument to the callback.

*/
