const express = require("express");
require("dotenv").config();
require("./db/mongoose");
const taskrouter = require("./router/task");
const userrouter = require("./router/user");

console.log(process.env.MONGODB_URL);
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(taskrouter);
app.use(userrouter);
app.listen(port, () => {
	console.log("server is listening is on port" + port);
});
