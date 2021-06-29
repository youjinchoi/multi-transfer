import React, { useEffect, useState } from 'react';
import './App.css';
import AppBar from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';
import { fade, makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Transfer from './components/Transfer';
import getWeb3 from './getWeb3';

const useStyles = makeStyles((theme) => ({
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'block',
    },
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(3),
      width: 'auto',
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'inherit',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
  sectionDesktop: {
    display: 'none',
    [theme.breakpoints.up('md')]: {
      display: 'flex',
    },
  },
  sectionMobile: {
    display: 'flex',
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
}));

function App() {
  const classes = useStyles();
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState(null);
  // const [networkId, setNetworkId] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const web3 = await getWeb3();
        const accounts = await web3.eth.getAccounts();
        const networkId = await web3.eth.net.getId();
        window.__networkId__ = networkId;
        console.log(networkId);
        setWeb3(web3);
        setAccounts(accounts);
        // setNetworkId(networkId);
      } catch (error) {
        console.error(error);
      }
    }
    if (!web3) {
      init();
    }
  });

  const onConnect = async () => {
    if (!accounts?.length) {
      const response = await window.ethereum.send('eth_requestAccounts');
      if (response?.result) {
        setAccounts(response.result);
      }
    }
  }

  return (
    <div className="App">
      <AppBar position="static">
        <Box display="flex" justifyContent="space-between" m={1}>
          <Box justifyContent="flex-start">
            <Typography className={classes.title} variant="h6" noWrap>
              TokenTools
            </Typography>
          </Box>
          <Box justifyContent="flex-end">
            <Button variant="contained" size="small" disableRipple onClick={onConnect}>{accounts?.length ? accounts[0] : "Connect"}</Button>
          </Box>
        </Box>
      </AppBar>
      <Transfer web3={web3} account={accounts?.length ? accounts[0] : null} />
    </div>
  );
}

export default App;
