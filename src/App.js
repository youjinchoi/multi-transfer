import React, { useEffect, useState } from "react";

import { useMediaQuery } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";

import "./App.css";
import frame_left from "./assets/frame_left.svg";
import frame_right from "./assets/frame_right.svg";
import { SUPPORTED_CHAIN_ID } from "./constants";
import Header from "./views/Header";
import Transfer from "./views/Transfer";

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

const injected = new InjectedConnector({
  supportedChainIds: Object.values(SUPPORTED_CHAIN_ID),
});
const connector = injected;

function App() {
  const classes = useStyles();
  const [covacBalanceStr, setCovacBalanceStr] = useState(null);

  const showBackgroundImage = useMediaQuery("(min-width: 1500px)");

  const { activate } = useWeb3React();

  const connectWallet = async () => {
    activate(connector, async (error) => {
      console.error(error);
    });
  };

  useEffect(() => {
    connectWallet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={showBackgroundImage ? classes.app : undefined}>
      <Header
        connectWallet={connectWallet}
        covacBalanceStr={covacBalanceStr}
        setCovacBalanceStr={setCovacBalanceStr}
      />
      <Transfer
        covacBalanceStr={covacBalanceStr}
        connectWallet={connectWallet}
      />
    </div>
  );
}

export default App;
