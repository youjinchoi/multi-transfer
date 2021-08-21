import React, { useEffect, useState } from 'react';
import './App.css';
import { useMediaQuery } from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';
import Transfer from './components/Transfer';
import getWeb3 from './getWeb3';
import frame_right from "./assets/frame_right.svg";
import frame_left from "./assets/frame_left.svg";
import Header from "./components/Header";

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
      width: "100%",
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
      width: "100%",
      zIndex: -1,
    },
  }
}));

function App() {
  const classes = useStyles();
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [networkId, setNetworkId] = useState(null);
  const [covacBalanceStr, setCovacBalanceStr] = useState(null);

  const showBackgroundImage = useMediaQuery("(min-width: 1000px)");

  useEffect(() => {
    const init = async () => {
      try {
        const web3 = await getWeb3();
        const accounts = await web3.eth.getAccounts();
        const networkId = await web3.eth.net.getId();
        setWeb3(web3);
        setAccount(accounts[0]);
        setNetworkId(networkId);
        setInterval(async () => {
          const newAccounts = await web3.eth.getAccounts();
          setAccount(newAccounts[0]);
        }, 1000);
      } catch (error) {
        console.error(error);
      }
    }
    if (!web3) {
      init();
    }
  });

  const connectWallet = async () => {
    if (!account) {
      const response = await window.ethereum.send('eth_requestAccounts');
      if (response?.result) {
        setAccount(response.result[0]);
      }
    }
  }

  return (
    <div className={showBackgroundImage && classes.app}>
      <Header web3={web3} account={account} setAccount={setAccount} networkId={networkId} connectWallet={connectWallet} covacBalanceStr={covacBalanceStr} setCovacBalanceStr={setCovacBalanceStr} />
      <Transfer web3={web3} account={account} networkId={networkId} covacBalanceStr={covacBalanceStr} connectWallet={connectWallet} />
    </div>
  );
}

export default App;
