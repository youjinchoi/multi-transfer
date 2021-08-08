import React, {useEffect, useState} from 'react';
import {Box, CircularProgress, Typography} from '@material-ui/core';
import Web3Utils from "web3-utils";
import { getContractABI } from "../apis/bscscan";
import CustomTextField from "./CustomTextField";
import {makeStyles} from "@material-ui/core/styles";
import InputAdornment from "@material-ui/core/InputAdornment";
import search from "../assets/search.png";
import ErrorMessage from "./ErrorMessage";

const useStyles = makeStyles((theme) => ({
  label: {
    color: "#FFFFFF",
    marginTop: 8,
    marginBottom: 8,
  },
  tokenAddress: {
    background: "#F9FAFB",
    border: "0.6px solid #E5E7EB",
    borderRadius: 15,
  },
  button: {
    background: "#EC008C",
  },
  loading: {
    color: "#FFFFFF",
  },
  inputAlignCenter: {
    "& input": {
      textAlign: "center",
      width: 150,
    },
  },
}));

const useStylesInput = makeStyles((theme) => ({
  root: {
    padding: 10,
    height: 50,
    border: "0.6px solid #E5E7EB",
    borderRadius: 15,
    background: "#F9FAFB",
  },
  'input': {
    '&::placeholder': {
      color: '#00636C',
      opacity: 1,
    }
  },
  disabled: {
    color: "#00636C",
  },
}));

function TokenInfo({ web3, account, networkId, activeStep, tokenInfo, setTokenInfo, totalAmountWithDecimalsBN }) {
  const classes = useStyles();
  const inputClasses = useStylesInput();
  const [isLoading, setIsLoading] = useState(false);

  const onTokenAddressChange = async (e) => {
    const value = e?.target?.value;
    if (!value || !value.trim()) {
      setTokenInfo(null);
      return;
    }
    if (!Web3Utils.isAddress(value)) {
      console.log("here");
      setTokenInfo({ isValid: false, errorMessage: "Invalid token address. please check again" });
      return;
    }
    setIsLoading(true);
    if (!tokenInfo?.isValid) {
      setTokenInfo({ isValid: true, errorMessage: null });
    }
    const abi = await getContractABI(value, networkId);
    if (!abi) {
      setTokenInfo({ isValid: false, errorMessage: "Invalid token address. please check again" });
      setIsLoading(false);
      return;
    }
    const contract = new web3.eth.Contract(abi, value);
    const decimals = await contract.methods.decimals().call();
    const name = await contract.methods.name().call();
    const symbol = await contract.methods.symbol().call();
    const balance = account ? await contract.methods.balanceOf(account).call() : null;
    let adjustedBalance = null;
    let balanceBN = null;
    if (balance) {
      const decimalsBN = new web3.utils.BN(decimals);
      balanceBN = new web3.utils.BN(balance);
      const divisor = new web3.utils.BN(10).pow(decimalsBN);
      const beforeDecimal = balanceBN.div(divisor);
      const afterDecimal  = balanceBN.mod(divisor);
      adjustedBalance = `${beforeDecimal.toString()}.${afterDecimal.toString()}`;
    }
    setTokenInfo({ contract, address: value, name, symbol, decimals, balance: adjustedBalance, balanceBN, isValid: true });
    setIsLoading(false);
  };

  useEffect(() => {
    if (!tokenInfo?.balanceBN || !totalAmountWithDecimalsBN) {
      setTokenInfo({ ...tokenInfo, notEnoughBalance: false })
      return;
    }
    if (tokenInfo?.balanceBN.lte(totalAmountWithDecimalsBN)) {
      setTokenInfo({ ...tokenInfo, notEnoughBalance: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenInfo?.balanceBN, totalAmountWithDecimalsBN]);

  return (
    <Box>
      <Box display="flex" justifyContent="center" m={1} flexDirection="column">
        <Box display="flex" justifyContent="flex-start">
          <Typography className={classes.label}>Token Address</Typography>
        </Box>
        <CustomTextField
          onChange={onTokenAddressChange}
          disabled={activeStep !== 0}
          InputProps={{
            classes: inputClasses,
            startAdornment: (
              <InputAdornment position="start">
                <img src={search} width={30} height={30} alt="search icon" />
              </InputAdornment>
            ),
            disableUnderline: true,
            placeholder: "Input your Token Address",
          }}
          error={tokenInfo?.isValid === false}
          helperText={tokenInfo?.isValid === false ? tokenInfo?.errorMessage : null}
        />
      </Box>
      {isLoading && (
        <Box m={1} mt={2} display="flex" justifyContent="center">
          <CircularProgress className={classes.loading}/>
        </Box>
      )}
      {!isLoading && !!tokenInfo && tokenInfo.isValid && (
        <>
          <Box display="flex" justifyContent="space-between" p={1}>
            <Box>
              <Box display="flex" justifyContent="flex-start">
                <Typography className={classes.label}>Name</Typography>
              </Box>
              <CustomTextField value={tokenInfo.name} disabled m={1} className={classes.inputAlignCenter} />
            </Box>
            <Box>
              <Box display="flex" justifyContent="flex-start">
                <Typography className={classes.label}>Symbol</Typography>
              </Box>
              <CustomTextField value={tokenInfo.symbol} disabled m={1} className={classes.inputAlignCenter} />
            </Box>
            <Box>
              <Box display="flex" justifyContent="flex-start">
                <Typography className={classes.label}>Decimals</Typography>
              </Box>
              <CustomTextField value={tokenInfo.decimals} disabled m={1} className={classes.inputAlignCenter} />
            </Box>
          </Box>
          <Box display="flex" justifyContent="center" flexDirection="column" m={1}>
            <Box display="flex" justifyContent="flex-start">
              <Typography className={classes.label}>Token Balance of Connected Wallet</Typography>
            </Box>
            <CustomTextField
              value={tokenInfo.balance}
              disabled
              error={activeStep === 1 && tokenInfo?.notEnoughBalance}
              helperText={activeStep === 1 && tokenInfo?.notEnoughBalance ? <ErrorMessage text="token balance is less than total amount to transfer" /> : null}
            />
          </Box>
        </>
      )}
    </Box>
  );
}

export default TokenInfo;
