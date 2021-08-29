import BigNumber from "bignumber.js";

export const numberWithCommas = (number) => {
  const parts = number?.toString().split(".");
  if (!parts.length) {
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
