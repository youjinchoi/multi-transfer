import axios from 'axios';

const API_KEY = "4EVTT1FDIJ1P5MF9G8UFKDACCWWN8X3V4E";

const getBaseUrl = () => {
  if (window.__networkId__ === 97) {
    return "https://api-testnet.bscscan.com";
  }
  return "https://api.bscscan.com";
}

export const getContractABI = async (address) => {
  try {
    const response = await axios.get(`${getBaseUrl()}/api?module=contract&action=getabi&address=${address}&apikey=${API_KEY}`);
    if (response?.data?.message === "OK") {
      return JSON.parse(response?.data?.result);
    } else {
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
}