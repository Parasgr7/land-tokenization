import React, { useState, useEffect } from "react";
import { Menu } from "@headlessui/react";
import { useWeb3 } from "../../components/providers/web3";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAccount } from "../../components/hooks/web3";
import { useLandManagement } from "../hooks/useLandManagement";
import { toast } from 'react-toastify';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { LoadingSpinerComponent } from "../../utils/Spinner";

export default function Navbar() {
  const router = useRouter();
  const { state, selectedToken, setSelectedToken, balance, setBalance } =
    useWeb3();
  const { account } = useAccount();
  const account_address = account?.data;
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Get the deleteUser function from useLandManagement hook
  const { deleteUser } = useLandManagement(
    state.landManagement,
    account_address,
    () => {}, // setUserLands
    () => {}  // setLandDetails
  );

  useEffect(() => {
    if (!state.selectedWallet) {
      router.push("/");
    }
    const fetchBalance = async () => {
      if (state.walletContract && state.selectedWallet) {
        const response = await state.walletContract.methods
          .getBalance(selectedToken, state.selectedWallet)
          .call();
        setBalance(state.web3.utils.fromWei(response, "ether"));
      }
    };
    fetchBalance();
  }, [selectedToken, state.selectedWallet]);

  const handleDeleteAccount = async () => {
    if (!showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    try {
      setIsDeleting(true);
      await deleteUser();
      toast.success('Account deleted successfully');
      router.push('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowConfirmation(false);
    }
  };

  return (
    <>
      <ToastContainer
        position="bottom-right"
        toastStyle={{ backgroundColor: "#2e2d29" }}
      />
      <LoadingSpinerComponent />
      
      <nav className="bg-gray-800">
        <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
          <div className="relative flex h-16 items-center justify-between">
            <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                aria-controls="mobile-menu"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>

                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>

                <svg
                  className="hidden h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
              <div className="flex flex-shrink-0 items-center">
                <img
                  className="block h-8 w-auto lg:hidden"
                  src="https://img.icons8.com/color/48/blockchain-technology.png"
                  alt="Your Company"
                />
                <img
                  className="hidden h-8 w-auto lg:block"
                  src="https://img.icons8.com/color/48/blockchain-technology.png"
                  alt="Your Company"
                />
              </div>
              <span className="text-lg font-bold text-white">Land Management Tracker Dapp</span>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">

              <div className="px-4 py-1 ml-4 text-white border bg-gray-800 border-gray-400 rounded-md">
                {account_address
                  ? account_address.slice(0, 7) +
                    "..." +
                    account_address.slice(account_address.length - 7)
                  : "UserID: N/A"}
              </div>
              
              {account_address && deleteUser && (
                <div className="ml-4">
                  <button
                    className={`px-3 py-1 rounded-md font-medium text-white transition-colors ${
                      showConfirmation 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-red-500 hover:bg-red-600'
                    } ${isDeleting ? 'opacity-70 cursor-not-allowed' : ''}`}
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                  >
                    {isDeleting
                      ? 'Deleting...'
                      : showConfirmation
                      ? 'Confirm Delete'
                      : 'Delete Account'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      
    </>
  );
}
