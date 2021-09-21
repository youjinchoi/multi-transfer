const axios = require("axios");

const KEY = "ckey_4a08f7f3f50d42eaa211f68922f";

// Docs on event and context https://www.netlify.com/docs/functions/#the-handler-method
const handler = async (event) => {
  try {
    const account = event.queryStringParameters.account;
    const chainId = event.queryStringParameters.chainId;

    console.info(`get token list for chainId ${chainId}, account ${account}`);

    const response = await axios.get(
      `https://api.covalenthq.com/v1/${chainId}/address/${account}/balances_v2/?&key=${KEY}`
    );
    if (response && response.status === 200) {
      const items =
        response &&
        response.data &&
        response.data.data &&
        response.data.data.items;
      const result = (items || [])
        .filter(
          (item) =>
            (item.supports_erc || []).some((erc) => erc === "erc20") &&
            item.balance !== "0"
        )
        .map((item) => ({
          name: item.contract_name,
          symbol: item.contract_ticker_symbol,
          decimals: item.contract_decimals,
          address: item.contract_address,
          balance: item.balance,
          logo: item.logo_url,
        }));
      return {
        statusCode: 200,
        body: JSON.stringify(result),
        // // more keys you can return:
        // headers: { "headerName": "headerValue", ... },
        // isBase64Encoded: true,
      };
    } else {
      throw Error("External API returns error");
    }
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: error.toString() };
  }
};

module.exports = { handler };
