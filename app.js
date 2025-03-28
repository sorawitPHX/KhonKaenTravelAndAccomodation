const express = require("express");
const path = require("path");
const app = express();
const dotenv = require("dotenv");
dotenv.config();

const tourismRouter = require("./routes/tourism");
const accommodationRouter = require("./routes/accommodation");
const userRouter = require("./routes/users");
const reviewRouter = require("./routes/reviews");
const indexRouter = require("./routes/index");

// Middleware
app.set('view engine', 'ejs')
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use('/bootstrap', express.static(path.join(__dirname, "node_modules", "bootstrap", "dist")));
app.use('/leaflet', express.static(path.join(__dirname, "node_modules", "leaflet", "dist")));
app.use('/jquery', express.static(path.join(__dirname, "node_modules", "jquery", "dist")));
app.use('/fancybox', express.static(path.join(__dirname, "node_modules", "@fancyapps", "ui", "dist", "fancybox")));

// Routes
app.use("/api/tourism", tourismRouter);
app.use("/api/accommodation", accommodationRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/users", userRouter);
app.use("/", indexRouter);

app.use((req, res) => {
    res.status(404).json({ message: '404 not found' })
})

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
