const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const goalRoutes = require("./routes/goalRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/goals", goalRoutes);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() =>
    console.log("MongoDB Connected ✅")
  )
  .catch((err) =>
    console.log(err)
  );

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});