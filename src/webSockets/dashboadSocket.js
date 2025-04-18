const Binance = require("binance-api-node").default;
const WebSocket = require("ws");

// Initialize the Binance client
const client = Binance({
  apiKey: process.env.BINANCE_API_KEY,
  apiSecret: process.env.BINANCE_SECRET_KEY,
});

// List of symbols you want to subscribe to
const symbols = [
  "BTCUSDT",
  "ETHUSDT",
  "BNBUSDT",
  "BNBBTC",
  "XRPUSDT",
  // "SOLUSDT",
  "ADAUSDT",
  "DOGEUSDT",
  "MATICUSDT",
  "DOTUSDT",
  "LTCUSDT",
  "TRXUSDT",
  "AVAXUSDT",
  "SHIBUSDT",
  "LINKUSDT",
  "ATOMUSDT",
  "NEARUSDT",
  "BCHUSDT",
  "XLMUSDT",
  "APTUSDT",
  "FILUSDT",
  "SANDUSDT",
  "ICPUSDT",
  "ETCUSDT",
  "GALAUSDT",
  // "VETUSDT",
  "EOSUSDT",
  "FTMUSDT",
  // "AAVEUSDT",
  // "EGLDUSDT"
];


// Create a WebSocket server on port 8081
const wss = new WebSocket.Server({ port: 8081 });

wss.on("connection", (ws) => {
  console.log("Client connected");

  // Track previous prices for all symbols
  const previousPrices = {};

  // Subscribe to Binance WebSocket tickers for multiple symbols
  symbols.forEach((symbol) => {
    client.ws.ticker(symbol, (ticker) => {      
      const currentPrice = parseFloat(ticker.curDayClose);
      let priceDifference = null;
      let percentageDifference = null;

      // Calculate the price difference and percentage difference for this symbol
      if (previousPrices[symbol] !== undefined) {
        priceDifference = currentPrice - previousPrices[symbol];
        const differenceType = priceDifference > 0 ? "+" : "";
        priceDifference = `${differenceType}${priceDifference.toFixed(2)}`;

        // Calculate percentage difference
        percentageDifference =
          ((currentPrice - previousPrices[symbol]) / previousPrices[symbol]) *
          100;
        percentageDifference = `${differenceType}${percentageDifference.toFixed(
          2
        )}%`;
      }

      previousPrices[symbol] = currentPrice;

      // Send the updated data for this symbol to the connected client
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            symbol, // Send Binance symbol
            currentPrice,
            priceDifference,
            percentageDifference, // Add percentage difference
            prevDayClose:(+ticker.prevDayClose).toFixed(2)
          })
        );
        // console.log(
        //   `Sent to client ${symbol}: ${currentPrice}, ${priceDifference}, ${percentageDifference}`
        // );
      }
    });
  });

  // Handle WebSocket errors
  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

console.log("WebSocket server is running on ws://localhost:8081");
