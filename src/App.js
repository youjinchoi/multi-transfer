import React, { useEffect, useState } from 'react';
import './App.css';
import AppBar from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Transfer from './components/Transfer';
import getWeb3 from './getWeb3';

const useStyles = makeStyles(() => ({
  title: {
    display: 'block',
  },
  connectButton: {
    borderRadius: 15,
    textTransform: "unset",
    minWidth: 100,
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
      <AppBar position="static">
        <Box display="flex" justifyContent="space-between" m={1}>
          <Box justifyContent="flex-start">
            <Typography className={classes.title} variant="h6" noWrap>
              TokenTool
            </Typography>
          </Box>
          <Box justifyContent="flex-end">
            <Button variant="contained" size="small" disableRipple className={classes.connectButton} onClick={onConnect}>{account ? account : "Connect"}</Button>
          </Box>
        </Box>
      </AppBar>
      <Transfer web3={web3} account={account} />
    </div>
  );
}

export default App;
