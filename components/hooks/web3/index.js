import { useHooks, useWeb3 } from "../../providers/web3";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export const useAccount = () => {
  const { state } = useWeb3();

  const data = useHooks((hooks) => {
    if (!hooks) return () => null;
    return hooks.useAccount;
  })();

  return {
    account: data,
  };
};

export const useAccountRequest = () => {
  const { state } = useWeb3();

  const account_transactions = useHooks((hooks) => {
    if (!hooks) return () => ({ data: [] });
    return hooks.useAccountRequest;
  })();

  const result = account_transactions.data
    ? account_transactions.data.filter((element) => element.status === "pending")
    : [];

  return {
    result,
  };
};

export const useTransferRequest = () => {
  const { state } = useWeb3();

  const transfer_requests = useHooks((hooks) => {
    if (!hooks) return () => ({ data: [] });
    return hooks.useTransferRequest;
  })();

  const result = transfer_requests.data
    ? transfer_requests.data.filter((element) => element.status === "pending")
    : [];

  return {
    transferRequest: result,
  };
};

export const useWalletDetails = () => {
  const { state } = useWeb3();

  const walletDetails = useHooks((hooks) => {
    if (!hooks) return () => null;
    return hooks.useWalletDetails;
  })();

  return {
    walletDetails,
  };
};

export const useWalletList = () => {
  const { state } = useWeb3();

  const walletList = useHooks((hooks) => {
    if (!hooks) return () => [];
    return hooks.useWalletList;
  })();

  return {
    walletList,
  };
};

export const useOwnerList = () => {
  const { state } = useWeb3();

  const ownerList = useHooks((hooks) => {
    if (!hooks) return () => [];
    return hooks.useOwnerList;
  })();

  return {
    ownerList,
  };
};

export const useApprovalLimit = () => {
  const { state } = useWeb3();

  const approvalLimit = useHooks((hooks) => {
    if (!hooks) return () => null;
    return hooks.useApprovalLimit;
  })();

  return {
    approvalLimit,
  };
};
