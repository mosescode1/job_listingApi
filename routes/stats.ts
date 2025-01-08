import express from 'express';
import statsController from '../controllers/stats';

export const statsRouter = express.Router();

statsRouter.get('/', statsController.status);
