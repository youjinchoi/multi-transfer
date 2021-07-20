import React, { useState, useEffect} from 'react';
import { Box, CircularProgress, Typography, Link } from '@material-ui/core';
import { Check, Error } from '@material-ui/icons';
import MultiTransferer from "../abis/MultiTransferer.json";
import { getTransactionUrl } from "../urls";


const deadAddress = "0x0000000000000000000000000000000000000000";

function SingleTransactionInfo({ index, web3, account, tokenInfo, recipientInfo, gasPrice, addEstimatedGasAmount, increaseFinishedTransactionCount, startTransfer }) {
  const [transactionHash, setTransactionHash] = useState(null);
  const [transactionErrorMessage, setTransactionErrorMessage] = useState(null);
  const [transactionStatus, setTransactionStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [gasAmount, setGasAmount] = useState(null);

  const decimalsBN = new web3.utils.BN(tokenInfo.decimals);
  const multiplierBN = new web3.utils.BN(10).pow(decimalsBN);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => addEstimatedGasAmount(gasAmount), [gasAmount]);

  useEffect(() => {
    if (transactionStatus === "finish") {
      increaseFinishedTransactionCount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionStatus])

  useEffect(() => {
    const multiTransfererAddress = MultiTransferer.addresses[window.__networkId__];

    const calculateGas = async () => {
      const multiTransferer = new web3.eth.Contract(MultiTransferer.abi, multiTransfererAddress);
      const addresses = [];
      const amounts = [];
      recipientInfo.forEach(({ address, amount }) => {
        addresses.push(address);
        const amountBN = new web3.utils.BN(amount);
        amounts.push(amountBN.mul(multiplierBN).toString());
      });

      try {
        const encodedData = await multiTransferer.methods.multiTransferToken(tokenInfo.address, addresses, amounts).encodeABI({
          from: account
        })
        console.log("gasPrice", gasPrice);
        const gasResult = await web3.eth.estimateGas({
          from: account,
          data: encodedData,
          gasPrice: gasPrice,
          to: multiTransfererAddress,
        })
        console.log('gas', gasResult);
        setGasAmount(gasResult);
      } catch (error) {
        setTransactionErrorMessage(error?.message ?? "gas estimation error");
        console.error(error);
        return;
      }

      const failedAddresses = await multiTransferer.methods.multiTransferToken(tokenInfo.address, addresses, amounts).call({
        from: account,
        gasPrice: gasPrice,
      });
      const filteredFailedAddresses = failedAddresses.filter(address => address !== deadAddress);
      if (filteredFailedAddresses?.length) {
        console.warn("found failed addresses", filteredFailedAddresses);
      }
    }

    calculateGas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!startTransfer) {
      return;
    }
    setIsLoading(true);
    const multiTransfererAddress = MultiTransferer.addresses[window.__networkId__];
    const multiTransferer = new web3.eth.Contract(MultiTransferer.abi, multiTransfererAddress);
    const addresses = [];
    const amounts = [];
    recipientInfo.forEach(({ address, amount }) => {
      addresses.push(address);
      const amountBN = new web3.utils.BN(amount);
      amounts.push(amountBN.mul(multiplierBN).toString());
    });
    try {
      multiTransferer.methods.multiTransferToken(tokenInfo.address, addresses, amounts)
        .send({
          from: account,
          gasPrice: gasPrice,
        })
        .on('transactionHash', hash => {
          setTransactionHash(hash);
          setTransactionStatus("pending");
        })
        .on('error', (error) => {
          setTransactionErrorMessage(error?.message ?? "failed to multi transfer");
          setIsLoading(false);
        })
        .then(result => {
          console.log("transaction finisih", result);
          setTransactionStatus("finish");
          setIsLoading(false);
        });
    } catch (error) {
      setTransactionErrorMessage(error?.message ?? "failed to multi transfer");
      setIsLoading(false);
      console.error(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTransfer]);

  if (!startTransfer) {
    return null;
  }

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Box style={{ width: "612px" }}>
        <div>
          <Typography>
            Transaction {index + 1}
            {isLoading && <CircularProgress style={{ width: 12, height: 12, marginLeft: 10 }} />}
            {transactionStatus === "finish" && <Check style={{ color: '#784af4', fontSize: 18, marginLeft: 10 }} />}
            {!!transactionErrorMessage && <Error color="error" style={{ fontSize: 18, marginLeft: 10 }}/>}
          </Typography>
        </div>
        {!!transactionHash && (
          <Typography variant="caption">
            <Link href={getTransactionUrl(transactionHash)} target="_blank">{transactionHash}</Link>
          </Typography>
        )}
        {!!transactionErrorMessage && (
          <Typography variant="caption" color="error">
            {transactionErrorMessage}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default SingleTransactionInfo;
