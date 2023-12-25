// server/server.js
import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import mongoose from 'mongoose';
// import { DATABASE } from './config.js';

import authRoutes from './routes/auth.js';
import courseRoutes from './routes/course.js';

const app = express();

// db
mongoose
    .connect(process.env.DATABASE_MONGODB_ATLAS_URI)
    .then(() => {
        app.listen(8000, () => console.log('Server running in port 8000'));
        console.log('db_connected');
    })
    .catch((err) => console.log(err));

// middlewares
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));
app.use(cors());

// middlewares for processing body from post method
app.use(express.urlencoded());
app.use(express.json());

// apply as middleware
app.use('/', authRoutes);
app.use('/', courseRoutes);
