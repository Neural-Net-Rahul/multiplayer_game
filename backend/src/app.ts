import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client';

const app = express();
app.use(express.json());
app.use(cors());

const client = new PrismaClient();

export {app,client};