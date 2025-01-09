"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.status = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const redisClient_1 = require("../../redis/redisClient");
const client_1 = require("../../prisma/client");
const status = (0, catchAsync_1.catchAsync)((req, res, _) => __awaiter(void 0, void 0, void 0, function* () {
    const redisStatus = redisClient_1.redisClient.isAlive();
    const serverStatus = 'online';
    let prismaStatus;
    try {
        client_1.prisma.$connect();
        prismaStatus = 'online';
    }
    catch (err) {
        prismaStatus = 'offline';
        console.log(err);
    }
    res.status(200).json({
        serverStatus,
        redisStatus,
        prismaStatus,
    });
}));
exports.status = status;
