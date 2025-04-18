const csv = require("csvtojson");
const { MongoClient } = require("mongodb");
const _ = require("lodash"); // To group by bank name
const path = require("path");
require("dotenv").config();

const csvFilePath = path.join(__dirname, "./IFSC.csv"); // Path to your CSV file
console.log("csvFilePath", csvFilePath);

// Ensure MongoDB URI is defined
// const uri = process.env.MONGO_URI;
// console.log("process.env.MONGO_URI", process.env.MONGO_URI);
// if (!uri) {
//   throw new Error("MongoDB URI is not defined in .env file.");
// }

const dbName = "wealthMax"; // Database name
const collectionName = "banks"; // Collection name

async function processCSVAndStoreInMongoDB() {
  try {
    // Step 1: Convert CSV to JSON
    const jsonArray = await csv().fromFile(csvFilePath);
    if (jsonArray.length === 0) {
      throw new Error("CSV file is empty or not formatted correctly.");
    }

    // Step 2: Group branches by bank name
    const groupedData = _(jsonArray)
      .groupBy("BANK")
      .map((branches, bankName) => ({
        bankName: bankName,
        branches: branches.map((branch) => ({
          ifsc: branch.IFSC,
          branchName: branch.BRANCH,
          centre: branch.CENTRE,
          city: branch.CITY,
          state: branch.STATE,
        })),
      }))
      .value();

    if (groupedData.length === 0) {
      throw new Error("No data to insert into MongoDB.");
    }

    // Step 3: Connect to MongoDB
    const client = new MongoClient(
      "mongodb+srv://Kushang:Kush%40ng3092@practice.qdpf8.mongodb.net/wealthMax",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    await client.connect();
    console.log("Connected to MongoDB successfully.");

    // Step 4: Insert structured data into MongoDB
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Insert the grouped data into the collection
    const result = await collection.insertMany(groupedData);

    console.log(
      `${result.insertedCount} documents were inserted successfully!`
    );

    // Step 5: Close the connection
    await client.close();
    console.log("MongoDB connection closed.");
  } catch (err) {
    console.error("Error:", err);
  }
}

// Call the function to process CSV and store data in MongoDB
processCSVAndStoreInMongoDB();
