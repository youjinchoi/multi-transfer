export const numberWithCommas = number => number.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");

export const getBalanceStrWithDecimalsConsidered = (web3, balance, decimals) => {
  if (!balance) {
    return null;
  }
  const decimalsBN = new web3.utils.BN(decimals);
  const balanceBN = new web3.utils.BN(balance);
  const divisor = new web3.utils.BN(10).pow(decimalsBN);
  const beforeDecimal = balanceBN.div(divisor);
  const afterDecimalStr = balance.replace(beforeDecimal.toString(), "");

  if (Number(`0.${afterDecimalStr}`) === 0) {
    return beforeDecimal.toString();
  } else {
    return `${beforeDecimal.toString()}.${afterDecimalStr}`;
  }
}
