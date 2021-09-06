import BigNumber from "bignumber.js";
import { Contract } from "ethers";

import MultiTransferer from "./abis/MultiTransferer.json";
import { defaultGasMarginRate } from "./configs";

export const numberWithCommas = (number) => {
  if (number !== 0 && number !== "0" && !number) {
    return null;
  }
  if (isNaN(Number(number))) {
    return null;
  }
  const parts = number.toString().split(".");
  if (!parts?.length) {
    return null;
  }
  if (!parts[0]) {
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
  if (!chainId || !library || !account) {
    return null;
  }
  return getContract(
    MultiTransferer.addresses[chainId],
    MultiTransferer.abi,
    library,
    account
  );
};

export const calculateGasMargin = (
  value,
  marginRate = defaultGasMarginRate
) => {
  if (value !== 0 && !value) {
    return null;
  }
  return new BigNumber(value).multipliedBy(marginRate).toFixed(0);
};
