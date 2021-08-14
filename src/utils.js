const numberWithCommas = number => number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export const getBalanceStrWithDecimalsConsidered = (web3, balance, decimals, withCommas) => {
  if (!balance) {
    return null;
  }
  const decimalsBN = new web3.utils.BN(decimals);
  const balanceBN = new web3.utils.BN(balance);
  const divisor = new web3.utils.BN(10).pow(decimalsBN);
  const beforeDecimal = balanceBN.div(divisor);
  const afterDecimal  = balanceBN.mod(divisor);

  const beforeDecimalStr = withCommas ? numberWithCommas(beforeDecimal.toString()) : beforeDecimal.toString();
  const afterDecimalStr = afterDecimal.toString();

  if (afterDecimalStr === "0") {
    return beforeDecimalStr;
  } else {
    return `${beforeDecimalStr}.${afterDecimalStr}`;
  }
}