import express from 'express';
import { status } from '../controllers/stats';

export const statsRouter = express.Router();

statsRouter.get('/', status as any);
