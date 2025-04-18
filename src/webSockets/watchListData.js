const Binance = require("binance-api-node").default;
const WebSocket = require("ws");

// Initialize the Binance client
const client = Binance({
  apiKey: process.env.BINANCE_API_KEY,
  apiSecret: process.env.BINANCE_SECRET_KEY,
});

// WebSocket server running on port 8083
const wss = new WebSocket.Server({ port: 8083 });

wss.on("connection", (ws) => {
  console.log("Client connected");

  // Store the symbols requested by each client
  let subscribedSymbols = [];
  let pricesData = {}; // Store live price data for all symbols
  let previousPrices = {}; // Store previous prices for difference calculation

  // Listen for messages from the frontend to know which symbols to track
  ws.on("message", (message) => {
    const { symbols } = JSON.parse(message); // Message from the frontend (symbols is an array)
    console.log(`Client requested data for symbols: ${symbols}`);

    // Subscribe to new symbols if not already subscribed
    symbols.forEach((symbol) => {
      if (!subscribedSymbols.includes(symbol)) {
        subscribedSymbols.push(symbol);

        // Ticker stream for price data
        client.ws.ticker(symbol, (ticker) => {
          const currentPrice = parseFloat(ticker.curDayClose);
          let priceDifference = null;
          let percentageDifference = null;

          // Calculate price difference and percentage change
          if (previousPrices[symbol]) {
            priceDifference = currentPrice - previousPrices[symbol];
            const differenceType = priceDifference > 0 ? "+" : "";
            priceDifference = `${differenceType}${priceDifference.toFixed(2)}`;

            // Calculate percentage difference
            percentageDifference =
              (priceDifference / previousPrices[symbol]) * 100;
            percentageDifference = `${differenceType}${percentageDifference.toFixed(
              2
            )}%`;
          }

          previousPrices[symbol] = currentPrice;

          // Store the latest price data in the `pricesData` object
          pricesData[symbol] = {
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
          };
        });
      }
    });
  });

  // Send price updates at regular intervals (e.g., every 1 second)
  const intervalId = setInterval(() => {
    if (
      ws.readyState === WebSocket.OPEN &&
      Object.keys(pricesData).length > 0
    ) {
      // Send all symbols' data together in one message
      ws.send(JSON.stringify(pricesData));
    }
  }, 1000); // Sends every second

  // Handle WebSocket errors
  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
    clearInterval(intervalId); // Clear the interval in case of an error
  });
});

console.log("WebSocket server is running on ws://localhost:8083");
