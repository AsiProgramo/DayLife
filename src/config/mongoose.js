const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/DayLife";

// conecta a la base de datos
async function connect() {
    await mongoose.connect(MONGODB_URI);
    console.log("db is connected");
}

module.exports = { connect };
