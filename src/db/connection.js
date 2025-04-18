const mongoose = require("mongoose");
const User = require("../models/user");
require("dotenv").config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Database Connected");

    // const users = [
    //   {
    //     name: "jk",
    //     email: "jk@gmail.com",
    //     role: "user",
    //   },
    //   {
    //     name: "Darshan",
    //     email: "darshan@gmail.com",
    //     role: "user",
    //   },
    // ];
    // User.insertMany(users);
    // console.log("Data inserted successfully");
  })
  .catch((err) => {
    console.log(err);
  });
