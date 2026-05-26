require("dotenv").config();
const express = require("express");
const port = process.env.PORT;
const routes = require("./router");

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  const start = new Date();
  res.on("finish", () => {
    console.log("finish");
  });
  next();
});

app.use("/api", routes);
app.use("/", routes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
