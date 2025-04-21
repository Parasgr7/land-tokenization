import { trackPromise } from "react-promise-tracker";
import { toast } from "react-toastify";

export const useLandManagement = (landManagement, accountAddr, setUserLands, setLandDetails) => {
  const fetchUserLands = async () => {
    try {
      const lands = await landManagement.methods.getUserInventory().call({ from: accountAddr });
      setUserLands(lands);
      
      // Fetch details for each land
      const landDetailsArray = [];
      for (const landId of lands) {
        const landDetails = await landManagement.methods.getLandDetails(landId).call({ from: accountAddr });
        if (landDetails.claimed) {
          landDetailsArray.push({
            landId,
            claimed: landDetails.claimed,
            owner: landDetails.owner,
            latitude: landDetails.latitude,
            longitude: landDetails.longitude
          });
        }
      }
      setLandDetails(landDetailsArray);
    } catch (e) {
      console.error("Error fetching user lands:", e);
      toast.error("Failed to fetch your lands", {
        hideProgressBar: true,
        theme: "white",
      });
    }
  };

  const claimLand = async (threeWords, inputLat, inputLng) => {
    
    if (!landManagement) {
      toast.error("Land management contract not loaded", {
        hideProgressBar: true,
        theme: "white",
      });
      return;
    }
    
    if (!landManagement.methods || !landManagement.methods.claimLand) {
      toast.error("Claim land method not found in contract", {
        hideProgressBar: true,
        theme: "white",
      });
      return;
    }
    
    try {
      const result = await trackPromise(
        landManagement.methods
          .claimLand(
            threeWords, 
            Math.floor(parseFloat(inputLat) * 1000000), 
            Math.floor(parseFloat(inputLng) * 1000000), 
          )
          .send({ from: accountAddr })
      );
      
      toast.success("Land claimed successfully!", {
        hideProgressBar: true,
        theme: "white",
      });
      fetchUserLands(); // Refresh the land inventory
    } catch (e) {
      console.error("Error claiming land:", e);
      
      if (e.code === 4001) {
        toast.error("Transaction Rejected!!!", {
          hideProgressBar: true,
          theme: "white",
        });
      } else if (e.code === -32603) {
        try {
          // Try to extract the error message from the contract
          const errorParts = e.message.split("'");
          if (errorParts.length > 1) {
            const errorJson = errorParts[1];
            const parsedError = JSON.parse(errorJson);
            
            if (parsedError && parsedError.value && parsedError.value.data && parsedError.value.data.message) {
              const errorMessage = parsedError.value.data.message.split("revert")[1] || "Unknown contract error";
              toast.error(errorMessage, { hideProgressBar: true, theme: "white" });
            } else {
              toast.error("Land already claimed or invalid coordinates", { hideProgressBar: true, theme: "white" });
            }
          } else {
            toast.error("Land already claimed or invalid coordinates", { hideProgressBar: true, theme: "white" });
          }
        } catch (parseError) {
          console.error("Error parsing contract error:", parseError);
          toast.error("Land already claimed or invalid coordinates", { hideProgressBar: true, theme: "white" });
        }
      } else {
        toast.error(`Error: ${e.message}`, {
          hideProgressBar: true,
          theme: "white",
        });
      }
    }
  };

  const releaseLand = async (landId) => {
    if (!landId) {
      toast.error("Please select a land to release", {
        hideProgressBar: true,
        theme: "white",
      });
      return;
    }
    try {
      await trackPromise(
        landManagement.methods
          .releaseLand(landId)
          .send({ from: accountAddr })
      );
      toast.success("Land released successfully!", {
        hideProgressBar: true,
        theme: "white",
      });
      fetchUserLands();
    } catch (e) {
      if (e.code === 4001) {
        toast.error("Transaction Rejected!!!", {
          hideProgressBar: true,
          theme: "white",
        });
      } else if (e.code === -32603) {
        try {
          // Try to extract the error message from the contract
          const errorParts = e.message.split("'");
          if (errorParts.length > 1) {
            const errorJson = errorParts[1];
            const parsedError = JSON.parse(errorJson);
            
            if (parsedError && parsedError.value && parsedError.value.data && parsedError.value.data.message) {
              const errorMessage = parsedError.value.data.message.split("revert")[1] || "Unknown contract error";
              toast.error(errorMessage, { hideProgressBar: true, theme: "white" });
            } else {
              toast.error("Failed to release land", { hideProgressBar: true, theme: "white" });
            }
          } else {
            toast.error("Failed to release land", { hideProgressBar: true, theme: "white" });
          }
        } catch (parseError) {
          console.error("Error parsing contract error:", parseError);
          toast.error("Failed to release land", { hideProgressBar: true, theme: "white" });
        }
      }
    }
  };

  const transferLand = async (selectedLandForSwap, recipientLandId, recipientAddress) => {
    if (!selectedLandForSwap) {
      toast.error("Please select a land to swap", {
        hideProgressBar: true,
        theme: "white",
      });
      return;
    }

    if (!recipientAddress || !recipientLandId) {
      toast.error("Please enter recipient address and land ID", {
        hideProgressBar: true,
        theme: "white",
      });
      return;
    }

    try {
      await trackPromise(
        landManagement.methods
          .swapLand(selectedLandForSwap, recipientLandId, recipientAddress)
          .send({ from: accountAddr })
      );
      toast.success("Land swapped successfully!", {
        hideProgressBar: true,
        theme: "white",
      });
      fetchUserLands();
    } catch (e) {
      if (e.code === 4001) {
        toast.error("Transaction Rejected!!!", {
          hideProgressBar: true,
          theme: "white",
        });
      } else if (e.code === -32603) {
        try {
          // Try to extract the error message from the contract
          const errorParts = e.message.split("'");
          if (errorParts.length > 1) {
            const errorJson = errorParts[1];
            const parsedError = JSON.parse(errorJson);
            
            if (parsedError && parsedError.value && parsedError.value.data && parsedError.value.data.message) {
              const errorMessage = parsedError.value.data.message.split("revert")[1] || "Unknown contract error";
              toast.error(errorMessage, { hideProgressBar: true, theme: "white" });
            } else {
              toast.error("Failed to swap land", { hideProgressBar: true, theme: "white" });
            }
          } else {
            toast.error("Failed to swap land", { hideProgressBar: true, theme: "white" });
          }
        } catch (parseError) {
          console.error("Error parsing contract error:", parseError);
          toast.error("Failed to swap land", { hideProgressBar: true, theme: "white" });
        }
      }
    }
  };

  const deleteUser = async () => {
    if (!landManagement) {
      toast.error("Land management contract not loaded", {
        hideProgressBar: true,
        theme: "white",
      });
      return;
    }
    
    if (!landManagement.methods || !landManagement.methods.deleteUser) {
      toast.error("Delete user method not found in contract", {
        hideProgressBar: true,
        theme: "white",
      });
      return;
    }
    
    try {
      await trackPromise(
        landManagement.methods
          .deleteUser()
          .send({ from: accountAddr })
      );
      
      toast.success("Account deleted successfully! All lands have been released.", {
        hideProgressBar: true,
        theme: "white",
      });
      
      // Clear the user's lands
      setUserLands([]);
      setLandDetails([]);
      
      // Reload the page to reset the application state
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (e) {
      console.error("Error deleting user:", e);
      
      if (e.code === 4001) {
        toast.error("Transaction Rejected!!!", {
          hideProgressBar: true,
          theme: "white",
        });
      } else if (e.code === -32603) {
        try {
          // Try to extract the error message from the contract
          const errorParts = e.message.split("'");
          if (errorParts.length > 1) {
            const errorJson = errorParts[1];
            const parsedError = JSON.parse(errorJson);
            
            if (parsedError && parsedError.value && parsedError.value.data && parsedError.value.data.message) {
              const errorMessage = parsedError.value.data.message.split("revert")[1] || "Unknown contract error";
              toast.error(errorMessage, { hideProgressBar: true, theme: "white" });
            } else {
              toast.error("Failed to delete account", { hideProgressBar: true, theme: "white" });
            }
          } else {
            toast.error("Failed to delete account", { hideProgressBar: true, theme: "white" });
          }
        } catch (parseError) {
          console.error("Error parsing contract error:", parseError);
          toast.error("Failed to delete account", { hideProgressBar: true, theme: "white" });
        }
      } else {
        toast.error(`Error: ${e.message}`, {
          hideProgressBar: true,
          theme: "white",
        });
      }
    }
  };

  // Ensure deleteUser is always defined
  const safeDeleteUser = deleteUser || (() => {
    console.error("deleteUser function is not defined");
    return Promise.reject(new Error("deleteUser function is not defined"));
  });

  return {
    fetchUserLands,
    claimLand,
    releaseLand,
    transferLand,
    deleteUser: safeDeleteUser
  };
}; 