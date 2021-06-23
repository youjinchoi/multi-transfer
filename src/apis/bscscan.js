import axios from 'axios';

const API_KEY = "4EVTT1FDIJ1P5MF9G8UFKDACCWWN8X3V4E";

export const getContractABI = async (address) => {
  const response = await axios.get(`https://api.bscscan.com/api?module=contract&action=getabi&address=${address}&apikey=${API_KEY}`);
  const abi = response?.data?.result;
  if (abi) {
    return JSON.parse(abi);
  } else {
    return null;
  }
}