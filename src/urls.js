export const getTransactionUrl = (hash, networkId) => {
  if (networkId === 97) {
    return `https://testnet.bscscan.com/tx/${hash}`;
  } else if (networkId === 56) {
    return `https://bscscan.com/tx/${hash}`;
  }
  throw Error("not supported network");
};

export const getBaseApiUrl = (networkId) => {
  if (networkId === 97) {
    return "https://api-testnet.bscscan.com";
  } else if (networkId === 56) {
    return "https://api.bscscan.com";
  }
  throw Error("not supported network");
};
