import React, { useEffect, useState } from 'react';
import './App.css';
import AppBar from '@material-ui/core/AppBar';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Transfer from './components/Transfer';
import getWeb3 from './getWeb3';
import covac_log_white from './assets/covac_logo_white.png';
import covac_icon from './assets/covac_icon.png';
import twitter_icon from "./assets/twitter_icon.png";
import tg_icon from "./assets/tg_icon.png";
import website_icon from "./assets/website_icon.png";
import Box from "@material-ui/core/Box";
import Covac from "./abis/Covac.json";
import {getBalanceStrWithDecimalsConsidered} from "./utils";
import clsx from "clsx";
import {Typography} from "@material-ui/core";

const useStyles = makeStyles(() => ({
  header: {
    backgroundColor: "transparent",
    height: 120,
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    padding: 40,
    boxShadow: "none",
    borderBottom: "2px solid #C1F4F7",
  },
  title: {
    display: 'block',
  },
  headerButton: {
    backgroundColor: "rgb(255, 255, 255, 0.2)",
    borderRadius: 20,
    textTransform: "unset",
    minWidth: 100,
    color: "#FFFFFF",
    boxShadow: "none",
    height: 40,
    "&:hover": {
      backgroundColor: "rgb(255, 255, 255, 0.2)",
    },
    paddingLeft: 0,
    "& span": {
      color: "rgb(255, 255, 255)",
    },
    "& img": {
      marginRight: 8,
    },
    paddingRight: 16,
  },
  covacBalance: {
    paddingLeft: 16,
  },
  headerButtonCaption: {
    marginBottom: 6,
  },
  headerLink: {
    height: 40,
    marginLeft: 4,
    marginRight: 4,
  },
}));

function App() {
  const classes = useStyles();
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [networkId, setNetworkId] = useState(null);
  const [covacBalanceStr, setCovacBalanceStr] = useState(null);
  // const [networkId, setNetworkId] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const web3 = await getWeb3();
        const accounts = await web3.eth.getAccounts();
        const networkId = await web3.eth.net.getId();
        setWeb3(web3);
        setAccount(accounts[0]);
        setNetworkId(networkId);
        // setNetworkId(networkId);
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

  useEffect(() => {
    const getCovacBalance = async () => {
      const covacAddress = Covac.addresses[networkId];
      const covacContract = new web3.eth.Contract(Covac.abi, covacAddress);
      const balance = account ? await covacContract.methods.balanceOf(account).call() : null;
      const decimals = await covacContract.methods.decimals().call();
      const adjustedBalance = getBalanceStrWithDecimalsConsidered(web3, balance, decimals, true);
      setCovacBalanceStr(adjustedBalance);
    }
    if (account && web3 && networkId) {
      getCovacBalance();
    }
  }, [account, web3, networkId]);

  const connectWallet = async () => {
    if (!account) {
      const response = await window.ethereum.send('eth_requestAccounts');
      if (response?.result) {
        setAccount(response.result[0]);
      }
    }
  }

  return (
    <div className="App">
      <AppBar position="static" className={classes.header}>
        <img src={covac_log_white} height={30} alt="covac logo" />
        <Box display="flex" flexDirection="row" alignItems="center" my={3}>
          <a href="https://twitter.com/covaccrypto" target="_blank" rel="noreferrer" className={classes.headerLink}><img src={twitter_icon} height={40} alt="covac twitter" /></a>
          <a href="https://t.me/CovacCryptoChat" target="_blank" rel="noreferrer" className={classes.headerLink}><img src={tg_icon} height={40} alt="covac telegram" /></a>
          <a href="https://www.covac.io/" target="_blank" rel="noreferrer" className={classes.headerLink}><img src={website_icon} height={40} alt="covac website" /></a>
          <Box display="flex" flexDirection="column" ml={2} mb={account ? 3 : 0}>
            {account && <Typography variant="caption" className={classes.headerButtonCaption}>Wallet address:</Typography>}
            <Button variant="contained" size="small" disableRipple className={classes.headerButton} onClick={connectWallet}>
              <img src={covac_icon} alt="covac icon" />
              {account ? account : "Connect"}
            </Button>
          </Box>
          {account && covacBalanceStr && (
            <Box ml={2} mb={3} display="flex" flexDirection="column">
              <Typography variant="caption" className={classes.headerButtonCaption}>Your $COVAC balance:</Typography>
              <Button variant="contained" size="small" disableRipple className={clsx(classes.headerButton, classes.covacBalance)} onClick={connectWallet}>
                {covacBalanceStr}
              </Button>
            </Box>
          )}
        </Box>
      </AppBar>
      <Transfer web3={web3} account={account} networkId={networkId} covacBalanceStr={covacBalanceStr} connectWallet={connectWallet} />
    </div>
  );
}

export default App;
