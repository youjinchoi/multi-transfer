import axios from 'axios';
import { getBaseApiUrl } from "../urls";

const API_KEY = "4EVTT1FDIJ1P5MF9G8UFKDACCWWN8X3V4E";

export const getContractABI = async (address) => {
  try {
    const response = await axios.get(`${getBaseApiUrl()}/api?module=contract&action=getabi&address=${address}&apikey=${API_KEY}`);
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