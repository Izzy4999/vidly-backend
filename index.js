const express = require("express");
const mongoose = require("mongoose");
const genres = require("./routes/genre");
const customers = require("./routes/customer");
const movies = require("./routes/movies");
const rentals = require("./routes/rentals");
const users = require("./routes/user");
const auth = require("./routes/auth");
const returns = require("./routes/returns");
const cors = require("cors");
require("dotenv/config");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/genres", genres);
app.use("/api/customers", customers);
app.use("/api/movies", movies);
app.use("/api/rentals", rentals);
app.use("/api/users", users);
app.use("/api/auth", auth);
app.use("/api/returns", returns);

const PORT = process.env.PORT || 3000;
const db = process.env.DB_CONNECTION;
console.log(db);
mongoose.connect(db, () => {
  console.log("db is connected", db);
});

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
