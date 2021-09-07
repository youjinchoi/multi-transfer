import React, { useEffect, useState } from "react";

import { useMediaQuery } from "@material-ui/core";
import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import { UnsupportedChainIdError, useWeb3React } from "@web3-react/core";
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from "@web3-react/injected-connector";
import {
  UserRejectedRequestError as UserRejectedRequestErrorWalletConnect,
  WalletConnectConnector,
} from "@web3-react/walletconnect-connector";

import "./App.css";
import frame_left from "./assets/frame_left.svg";
import frame_right from "./assets/frame_right.svg";
import ErrorMessage from "./components/ErrorMessage";
import { wallet } from "./configs";
import ConnectWalletModal from "./views/ConnectWalletModal";
import Header from "./views/Header";
import Transfer from "./views/Transfer";
import WalletActionModal from "./views/WalletActionModal";

const useStyles = makeStyles(() => ({
  app: {
    "&:before": {
      backgroundImage: `url(${frame_left})`,
      left: 100,
      top: 40,
      content: "''",
      position: "absolute",
      backgroundRepeat: "no-repeat",
      height: 1000,
      width: 310,
      zIndex: -1,
    },
    "&:after": {
      backgroundImage: `url(${frame_right})`,
      left: "calc(100% - 410px)",
      top: 135,
      content: "''",
      position: "absolute",
      backgroundRepeat: "no-repeat",
      height: 905,
      width: 310,
      zIndex: -1,
    },
  },
}));

const walletLocalStorageKey = "tokenBlastWallet";

function App() {
  const classes = useStyles();
  const [isConnectWalletModalVisible, setIsConnectWalletModalVisible] =
    useState(false);
  const [isWalletActionModalVisible, setIsWalletActionModalVisible] =
    useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const showBackgroundImage = useMediaQuery("(min-width: 1500px)");

  const { activate, deactivate } = useWeb3React();

  const connectWallet = async (walletKey) => {
    const selectedWallet = wallet[walletKey];
    if (!selectedWallet) {
      return;
    }
    const connector = selectedWallet.connector;
    activate(connector, null, true)
      .then(() => {
        setErrorMessage(null);
        window.localStorage.setItem(walletLocalStorageKey, walletKey);
      })
      .catch((error) => {
        console.error(error);
        if (error instanceof UnsupportedChainIdError) {
          setErrorMessage(
            "Current network is not supported. Please switch to BSC network."
          );
        } else {
          if (error instanceof NoEthereumProviderError) {
            setErrorMessage("No provider was found.");
          } else if (
            error instanceof UserRejectedRequestErrorInjected ||
            error instanceof UserRejectedRequestErrorWalletConnect
          ) {
            if (connector instanceof WalletConnectConnector) {
              connector.walletConnectProvider = null;
            }
            setErrorMessage("Please authorize to access your account.");
          } else {
            setErrorMessage(error.message);
          }
        }
      });
  };

  const openConnectWalletModal = () => setIsConnectWalletModalVisible(true);

  const openWalletActionModal = () => setIsWalletActionModalVisible(true);

  const disconnectWallet = () => {
    deactivate();
    // This localStorage key is set by @web3-react/walletconnect-connector
    if (window.localStorage.getItem("walletconnect")) {
      const walletConnectConnector = wallet.walletConnect.connector;
      walletConnectConnector.close();
      walletConnectConnector.walletConnectProvider = null;
    }
    window.localStorage.removeItem(walletLocalStorageKey);
  };

  useEffect(() => {
    // window.localStorage.removeItem(walletLocalStorageKey);
    // window.localStorage.removeItem("walletconnect");
    const storedWalletKey = window.localStorage.getItem(walletLocalStorageKey);
    const storedWallet = wallet[storedWalletKey];
    if (storedWallet) {
      connectWallet(storedWallet.key);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={showBackgroundImage ? classes.app : undefined}>
      <Header
        openConnectWalletModal={openConnectWalletModal}
        openWalletActionModal={openWalletActionModal}
      />
      {errorMessage && (
        <Box display="flex" justifyContent="center" mt={4}>
          <ErrorMessage text={errorMessage} />
        </Box>
      )}
      <ConnectWalletModal
        isVisible={isConnectWalletModalVisible}
        setIsVisible={setIsConnectWalletModalVisible}
        connectWallet={connectWallet}
      />
      <WalletActionModal
        isVisible={isWalletActionModalVisible}
        setIsVisible={setIsWalletActionModalVisible}
        openConnectWalletModal={openConnectWalletModal}
        disconnectWallet={disconnectWallet}
      />
      <Transfer openConnectWalletModal={openConnectWalletModal} />
    </div>
  );
}

export default App;
