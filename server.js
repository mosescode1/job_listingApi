const dotenv = require("dotenv");
dotenv.config({ path: ".env" });
const config = require("./@config");

process.on("UncaughtException", (err) => {
	console.log(err.name, err.message);
	console.log("Uncaught Exception Shutting down");
});
process.on("ReferenceError", (err) => {
	console.log(err.name, err.message);
	console.log("Reference Error Shutting Down");
});
const app = require("./src/app");

const PORT = config.port;

app.listen(PORT, () => {
	console.log(`App is running on Port ${PORT}`);
});
