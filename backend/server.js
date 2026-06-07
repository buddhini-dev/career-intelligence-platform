require("dotenv").config({ path: "../.env" });
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const jobsRouter = require("./routes/jobs");
const predictionsRouter = require("./routes/predictions");
const usersRouter = require("./routes/users");
const assistantRouter = require("./routes/assistant");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.use("/api/jobs", jobsRouter);
app.use("/api/predictions", predictionsRouter);
app.use("/api/users", usersRouter);
app.use("/api/assistant", assistantRouter);

app.get("/", (req, res) => {
    res.json({ message: "✅ Career Platform API is running" });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});