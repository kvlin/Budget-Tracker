// Require dependencies
const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const compression = require("compression");

// Create Port 3000 (local)
const PORT = process.env.PORT || 3000;

// Create Express server
const app = express();

app.use(logger("dev"));

app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

// Connect to mongoose
mongoose.connect(process.env.MONGODB_URI ||"mongodb://localhost/budget", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false

});
 
// API routes
app.use(require("./routes/api.js"));

// Listen to PORT
app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});