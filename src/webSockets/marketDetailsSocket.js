const Binance = require("binance-api-node").default;
const WebSocket = require("ws");

// Initialize the Binance client
const client = Binance({
  apiKey: process.env.BINANCE_API_KEY,
  apiSecret: process.env.BINANCE_SECRET_KEY,
});

// WebSocket server running on port 8082
const wss = new WebSocket.Server({ port: 8082 });

wss.on("connection", (ws) => {
  console.log("Client connected");

  // Store the symbols requested by each client
  let subscribedSymbols = [];

  // Listen for messages from the frontend to know which symbols to track
  ws.on("message", (message) => {
    const { symbol } = JSON.parse(message); // Message from the frontend
    console.log(`Client requested data for symbol: ${symbol}`);

    // Subscribe to Binance WebSocket ticker for the requested symbol
    let previousPrices = 0;
    if (!subscribedSymbols.includes(symbol)) {
      subscribedSymbols.push(symbol);

      // Ticker stream for price data
      client.ws.ticker(symbol, (ticker) => {
        const currentPrice = parseFloat(ticker.curDayClose);
        let priceDifference = null;
        let percentageDifference = null;

        if (previousPrices !== 0) {
          priceDifference = currentPrice - previousPrices;
          const differenceType = priceDifference > 0 ? "+" : "";
          priceDifference = `${differenceType}${priceDifference.toFixed(2)}`;

          // Calculate percentage difference
          percentageDifference = (priceDifference / previousPrices) * 100;
          percentageDifference = `${differenceType}${percentageDifference.toFixed(
            2
          )}%`;
        }

        previousPrices = currentPrice;

        // Send the price data to the client in real-time
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(
            JSON.stringify({
              symbol, // Symbol (e.g., BTCUSDT)
              currentPrice, // Latest price
              priceDifference, // Price difference
              percentageDifference, // Percentage difference
              open: ticker.open, // Open price
              high: ticker.high, // High price
              volume: ticker.volume, // Volume
              totalTradeValue: ticker.volumeQuote, // Total traded value
              prevDayClose: ticker.prevDayClose, // Previous day's close price
              low: ticker.low, // Low price
              close: ticker.close, // Closing price
            })
          );
        }
      });

      // Depth stream for buy and sell order quantities (order book)
      client.ws.depth(symbol, (depth) => {
        const { bidDepth, askDepth } = depth;
        // console.log("depth", depth);
        // Calculate total buy (bids) and sell (asks) orders
        let totalBuyOrders = 0;
        let totalSellOrders = 0;

        // Sum all buy orders
        // bids.forEach((bid) => {
        //   const bidQuantity = parseFloat(bid[1]); // bid[1] is the quantity
        //   totalBuyOrders += bidQuantity;
        // });

        // // Sum all sell orders
        // asks.forEach((ask) => {
        //   const askQuantity = parseFloat(ask[1]); // ask[1] is the quantity
        //   totalSellOrders += askQuantity;
        // });

        // // Send the order data to the client in real-time
        // if (ws.readyState === WebSocket.OPEN) {
        //   ws.send(
        //     JSON.stringify({
        //       symbol,
        //       totalBuyOrders, // Total buy orders (quantity)
        //       totalSellOrders, // Total sell orders (quantity)
        //     })
        //   );
        // }
      });
    }
  });

  // Handle WebSocket errors
  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

console.log("WebSocket server is running on ws://localhost:8082");
