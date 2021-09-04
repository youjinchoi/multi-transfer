import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";

import metamask_logo from "./assets/metamask_logo.svg";
import walletconnect_logo from "./assets/walletconnect_logo.svg";

export const SUPPORTED_CHAIN_ID = Object.freeze({
  BSC_MAINNET: 56,
  BSC_TESTNET: 97,
});

const nodeUrl = "https://bsc-dataseed1.ninicoin.io";

export const POLLING_INTERVAL = 12000;

const metamask = {
  key: "metamask",
  name: "Metamask",
  image: metamask_logo,
  connector: new InjectedConnector({
    supportedChainIds: Object.values(SUPPORTED_CHAIN_ID),
  }),
};

const walletConnect = {
  key: "walletConnect",
  name: "WalletConnect",
  image: walletconnect_logo,
  connector: new WalletConnectConnector({
    rpc: {
      [SUPPORTED_CHAIN_ID.BSC_MAINNET]: [nodeUrl],
    },
    qrcode: true,
    pollingInterval: POLLING_INTERVAL,
  }),
};

export const wallet = Object.freeze({
  metamask,
  walletConnect,
});
