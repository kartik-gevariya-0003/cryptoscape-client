/* General API Constants */
const API_URL =
  process.env.REACT_APP_CONTAINER_1_URL || "https://ldxiss620g.execute-api.us-east-1.amazonaws.com/prod";
const COIN_GECKO_URL = "https://api.coingecko.com/api/v3/";

const LOGIN = API_URL + "/login";
const REGISTER = API_URL + "/register";

/* Coin Gecko Url Constants */
const GET_CRYPTO_MARKET_DATA = COIN_GECKO_URL + "/coins/markets";

/* Custom Endpoint Constants */
const GET_PORTFOLIO = API_URL + "/get-portfolio";
const GET_WATCHLIST = API_URL + "/get-watchlist";
const POST_CONVERT_CRYPTO = API_URL + "/convert-crypto";
const POST_SELL_CRYPTO = API_URL + "/sell-crypto";
const ADD_TO_WATCHLIST = API_URL + "/add-to-watchlist";
const GET_TRANSACTIONS = API_URL + "/get-transactions";
const POST_BUY_CRYPTO = API_URL + "/buy-crypto";
module.exports = {
  REGISTER,
  LOGIN,
  API_URL,
  COIN_GECKO_URL,
  GET_CRYPTO_MARKET_DATA,
  GET_PORTFOLIO,
  GET_WATCHLIST,
  POST_CONVERT_CRYPTO,
  POST_SELL_CRYPTO,
  ADD_TO_WATCHLIST,
  GET_TRANSACTIONS,
  POST_BUY_CRYPTO,
};
