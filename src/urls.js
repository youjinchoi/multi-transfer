export const getTransactionUrl = hash => {
  if (window.__networkId__ === 97) {
    return `https://testnet.bscscan.com/tx/${hash}`;
  } else if (window.__networkId__ === 56) {
    return `https://bscscan.com/tx/${hash}`;
  }
  throw Error("not supported network");
}

export const getBaseApiUrl = () => {
  if (window.__networkId__ === 97) {
    return "https://api-testnet.bscscan.com";
  } else if (window.__networkId__ === 56) {
    return "https://api.bscscan.com";
  }
  throw Error("not supported network");
}