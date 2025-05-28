require('dotenv').config({ path: __dirname + '/.env' })
const cors = require('cors');
const cookieParser = require("cookie-parser");
const express = require('express');
const mongoose = require('mongoose');

const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");

// Connect to mongo db
mongoose.connect(process.env.mongoURL, { family: 4 });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGINS.split(','),
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.get('/', async (req, res) => {
  res.json({ status: "up" })
})

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT,"0.0.0.0",() => {
  console.log(`Server running on port ${PORT}`);
});

