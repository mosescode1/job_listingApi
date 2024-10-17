const dotenv = require("dotenv");
dotenv.config();

const config = {
	db: {
		url:
			process.env.NODE_ENV === "development"
				? "postgres://temz:Temitope_12@localhost:5432/easework"
				: process.env.DATABASE_URL,
	},
	redis: {
		url:
			process.env.NODE_ENV === "development"
				? "redis://localhost:6379"
				: process.env.REDIS_URL,
	},
	jwt: {
		accessSecretToken:
			process.env.NODE_ENV === "development"
				? "Jesusmystrongtowerandmypersonalsavior"
				: process.env.SECRET_KEY_JWT,
		refreshSecretToken:
			process.env.NODE_ENV === "development"
				? "Jesusismylife2024"
				: process.env.REFRESH_SECRET_KEY_JWT,
		expiry:
			process.env.NODE_ENV === "development"
				? "1h"
				: process.env.SECRET_KEY_JWT_EXPIRES,
		refreshExpiry:
			process.env.NODE_ENV === "development"
				? "1d"
				: process.env.REFRESH_SECRET_KEY_JWT_EXPIRES,
	},
	port: process.env.PORT || 3000,
	environment: process.env.NODE_ENV || "development",
};

module.exports = config;
