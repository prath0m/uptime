const mongoose = require("mongoose");
require('dotenv').config(); 

const connectDB = (URI) => {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};


module.exports = connectDB