const AppError = require("../../utils/AppError");
const config = require("../../@config");

const errProd = (err, res) => {
	// Operational errors we want to display to the client
	if (err.isOperational) {
		res.status(err.statusCode).json({
			status: err.status,
			message: err.message,
		});
	} else {
		// Log the error (can be sent to a monitoring service here)
		console.error("ERROR 💥:", err);
		// Send a generic error message to the client
		res.status(500).json({
			status: "error",
			message: "Something went wrong!",
		});
	}
};

const errDev = (err, res) => {
	console.log(err);
	res.status(err.statusCode).json({
		status: err.status,
		error: err,
		message: err.message,
		//stack: err.stack,
	});
};

const prismaClientValidationError = () => {
	return new AppError("Wrong Infomation passeed", 404);
}

const handleJsonWebTokenError = () => {
	return new AppError("Please provide a valid json token", 401);
};

const globalError = (err, _, res, next) => {
	err.statusCode = err.statusCode || 500;
	err.status = err.status || "error";

	if (config.environment === "development") {
		errDev(err, res);
	} else if (config.environment === "production") {
		// Create a copy of the error object to handle properties safely
		let error = { ...err };
		error.message = err.message || "An unknown error occurred";

		if (err.name === "JsonWebTokenError") {
			error = handleJsonWebTokenError();
		}
		if (err.name === "TokenExpiredError")
			error = handleJsonWebTokenError();
		if (err.name === 'PrismaClientValidationError') {
			error = prismaClientValidationError()
		}

		errProd(error, res);
	}
};

module.exports = globalError;
