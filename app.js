const express = require("express");
const path = require("path");
const app = express();
const dotenv = require("dotenv");
dotenv.config();

const pointRouter = require("./routes/points");
const userRouter = require("./routes/users");
const reviewRouter = require("./routes/reviews");
const indexRouter = require("./routes/index");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use('/bootstrap', express.static(path.join(__dirname, "node_modules", "bootstrap", "dist")));
app.use('/leaflet', express.static(path.join(__dirname, "node_modules", "leaflet", "dist")));

// Routes
app.use("/api/points", pointRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/users", userRouter);
app.use("/", indexRouter);

app.use((req, res) => {
    res.status(404).json({ message: '404 not found' })
})

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
