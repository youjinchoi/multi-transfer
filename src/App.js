import React, { useEffect, useState } from "react";

import { useMediaQuery } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useWeb3React } from "@web3-react/core";

import "./App.css";
import frame_left from "./assets/frame_left.svg";
import frame_right from "./assets/frame_right.svg";
import ConnectWalletModal from "./views/ConnectWalletModal";
import Header from "./views/Header";
import Transfer from "./views/Transfer";
import WalletActionModal from "./views/WalletActionModal";
import { wallet } from "./walletConfigs";

const useStyles = makeStyles(() => ({
  app: {
    "&:before": {
      backgroundImage: `url(${frame_left})`,
      left: 100,
      top: 58,
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
      top: 153,
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
  const [covacBalanceStr, setCovacBalanceStr] = useState(null);
  const [isConnectWalletModalVisible, setIsConnectWalletModalVisible] =
    useState(false);
  const [isWalletActionModalVisible, setIsWalletActionModalVisible] =
    useState(false);

  const showBackgroundImage = useMediaQuery("(min-width: 1500px)");

  const { activate, deactivate } = useWeb3React();
  // deactivate();

  const connectWallet = async (walletKey) => {
    const selectedWallet = wallet[walletKey];
    if (!selectedWallet) {
      return;
    }
    activate(selectedWallet.connector, null, true)
      .then(() => window.localStorage.setItem(walletLocalStorageKey, walletKey))
      .catch((error) => console.error("onError", error));
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
        covacBalanceStr={covacBalanceStr}
        setCovacBalanceStr={setCovacBalanceStr}
      />
      <ConnectWalletModal
        isVisible={isConnectWalletModalVisible}
        setIsVisible={setIsConnectWalletModalVisible}
        connectWallet={connectWallet}
      />
      <WalletActionModal
        isVisible={isWalletActionModalVisible}
        setIsVisible={setIsWalletActionModalVisible}
        covacBalanceStr={covacBalanceStr}
        openConnectWalletModal={openConnectWalletModal}
        disconnectWallet={disconnectWallet}
      />
      <Transfer
        covacBalanceStr={covacBalanceStr}
        connectWallet={openConnectWalletModal}
      />
    </div>
  );
}

export default App;
