import BigNumber from "bignumber.js";
import { Contract } from "ethers";

import MultiTransferer from "./abis/MultiTransferer.json";

export const numberWithCommas = (number) => {
  const parts = number?.toString().split(".");
  if (!parts?.length) {
    return null;
  }
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
};

export const getBalanceStrWithDecimalsConsidered = (
  balance,
  decimals,
  decimalsToRound = 2
) => {
  if (!balance) {
    return null;
  }
  BigNumber.set({ DECIMAL_PLACES: decimalsToRound });
  return new BigNumber(balance).div(10 ** decimals).toString();
};

const getSigner = (library, account) =>
  library.getSigner(account).connectUnchecked();

export const getProviderOrSigner = (library, account) =>
  account ? getSigner(library, account) : library;

export const getContract = (address, abi, library, account) =>
  new Contract(address, abi, getProviderOrSigner(library, account));

export const getTokenBlastContract = (chainId, library, account) => {
  return getContract(
    MultiTransferer.addresses[chainId],
    MultiTransferer.abi,
    library,
    account
  );
};
