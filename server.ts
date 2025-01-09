import { Config } from './src/config';

process.on('UncaughtException', (err) => {
	console.log(err.name, err.message);
	console.log('Uncaught Exception Shutting down');
});
process.on('ReferenceError', (err) => {
	console.log(err.name, err.message);
	console.log('Reference Error Shutting Down');
});
import { app } from './src/app';

const PORT = Config.port;
app.listen(PORT, () => {
	console.log(`App is running on Port ${PORT}`);
});
