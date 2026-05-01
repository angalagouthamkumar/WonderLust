const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const dburl = "mongodb://127.0.0.1:27017/WonderLust";

main().then(() => {
    console.log("connected to db");
}).catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(dburl);
}

const initDB = async () => {
    await Listing.deleteMany({});
    // Store the returned array from map into a variable
    const updatedData = initData.data.map((obj) => ({ ...obj, owner: "69eb155f747f9ba32a75e295" }));
    // Use the updated variable for insertion
    await Listing.insertMany(updatedData);
    console.log("data was initialized");
}

initDB();