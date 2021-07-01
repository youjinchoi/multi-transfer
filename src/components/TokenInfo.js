import React, { useState } from 'react';
import { Box, CircularProgress, TextField } from '@material-ui/core';
import Web3Utils from "web3-utils";
import { getContractABI } from "../apis/bscscan";

function TokenInfo({ web3, account, activeStep, tokenInfo, setTokenInfo }) {
  const [isLoading, setIsLoading] = useState(false);

  const onTokenAddressChange = async (e) => {
    const value = e?.target?.value;
    if (!value || !value.trim()) {
      setTokenInfo(null);
      return;
    }
    if (!Web3Utils.isAddress(value)) {
      setTokenInfo({ isValid: false, errorMessage: "Invalid token address. please check again" });
      return;
    }
    setIsLoading(true);
    const abi = await getContractABI(value);
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
    if (balance) {
      const decimalsBN = new web3.utils.BN(decimals);
      const balanceBN = new web3.utils.BN(balance);
      const divisor = new web3.utils.BN(10).pow(decimalsBN);
      const beforeDecimal = balanceBN.div(divisor);
      const afterDecimal  = balanceBN.mod(divisor);
      adjustedBalance = `${beforeDecimal.toString()}.${afterDecimal.toString()}`;
    }
    setTokenInfo({ contract, address: value, name, symbol, decimals, balance: adjustedBalance, isValid: true });
    setIsLoading(false);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="center" m={1}>
        <TextField
          required
          error={tokenInfo?.isValid === false}
          helperText={tokenInfo?.errorMessage}
          label="Token Address"
          variant="outlined"
          onChange={onTokenAddressChange}
          disabled={activeStep !== 0}
          style={{ width: "612px" }}
        />
      </Box>
      {isLoading && (
        <Box m={1} mt={2}>
          <CircularProgress />
        </Box>
      )}
      {!!tokenInfo && tokenInfo.isValid && (
        <>
          <Box display="flex" justifyContent="center">
            <Box m={1}>
              <TextField label="Name" variant="outlined" value={tokenInfo.name} disabled m={1} />
            </Box>
            <Box m={1}>
              <TextField label="Symbol" variant="outlined" value={tokenInfo.symbol} disabled m={1} />
            </Box>
            <Box m={1}>
              <TextField label="Decimals" variant="outlined" value={tokenInfo.decimals} disabled m={1} />
            </Box>
          </Box>
          <Box display="flex" justifyContent="center" m={1}>
            <TextField
              label="Token Balance of Connected Wallet"
              variant="outlined"
              value={tokenInfo.balance}
              disabled
              style={{ width: "612px" }}
            />
          </Box>
        </>
      )}
    </Box>
  );
}

export default TokenInfo;
