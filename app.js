const express = require("express");
const index = require("./api/index");

const app = express();

const PORT = process.env.PORT || 3000;

app.use("/api/index", index);

app.listen(PORT, () => console.log(`Server is running in port ${PORT}`));
