import React, { useEffect, useState } from 'react';
import './App.css';
import AppBar from '@material-ui/core/AppBar';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Transfer from './components/Transfer';
import getWeb3 from './getWeb3';
import covac_log_white from './assets/covac_logo_white.png';

const useStyles = makeStyles(() => ({
  header: {
    backgroundColor: "transparent",
    height: 80,
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
  connectButton: {
    backgroundColor: "#27689E",
    borderRadius: 20,
    textTransform: "unset",
    minWidth: 100,
    color: "#FFFFFF",
    height: 40,
  }
}));

function App() {
  const classes = useStyles();
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  // const [networkId, setNetworkId] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const web3 = await getWeb3();
        const accounts = await web3.eth.getAccounts();
        const networkId = await web3.eth.net.getId();
        window.__networkId__ = networkId;
        setWeb3(web3);
        setAccount(accounts[0]);
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

  const onConnect = async () => {
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
        <Button variant="contained" size="small" disableRipple className={classes.connectButton} onClick={onConnect}>{account ? account : "Connect"}</Button>
      </AppBar>
      <Transfer web3={web3} account={account} />
    </div>
  );
}

export default App;
