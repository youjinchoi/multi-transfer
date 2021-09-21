import axios from "axios";

export const getTokens = (chainId, account) =>
  axios.get(`/.netlify/functions/tokens?chainId=${chainId}&account=${account}`);
