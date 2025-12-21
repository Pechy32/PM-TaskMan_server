import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";

import taskController from './controller/taskController.js';
import userController from './controller/userController.js';
import projectController from './controller/projectController.js';
import authController from './controller/authController.js';

import logger from './middleware/logger.js'
import authMiddleware from './middleware/auth.js'
import { validateProject } from './middleware/projectIdValidator.js';
import { setupPassport } from './config/passport.js';

// --- SWAGGER ---
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import yaml from "yaml";

const app = express();
dotenv.config();
setupPassport();

// --- ENV SETUP ---
const PORT = process.env.PORT || 8080;
const DB_HOST = process.env.DB_HOST || "mongodb://localhost";
const DB_PORT = process.env.DB_PORT || 27017;
const DB_PATH = process.env.DB_PATH || "taskmandb";

// --- CORE MIDDLEWARE ---
app.use(express.json());
app.use(cors());

// --- SESSION & PASSPORT ---
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecretkey",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // secure: true only for HTTPS
  })
);
app.use(passport.initialize());
app.use(passport.session());

// --- LOGGER ---
app.use(logger);

// --- SWAGGER SETUP ---
try {
  const swaggerFile = fs.readFileSync("./swagger.yaml", "utf8");
  const swaggerDocument = yaml.parse(swaggerFile);

  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      explorer: true,
      swaggerOptions: {
        persistAuthorization: true, // keep Bearer token after refresh
      },
    })
  );

  console.log("Swagger UI available at /api-docs");
} catch (err) {
  console.error("Failed to load swagger.yaml:", err.message);
}

// --- DB CONNECTION ---
const databaseConnectionUri = `${DB_HOST}:${DB_PORT}/${DB_PATH}`;
mongoose.connect(databaseConnectionUri);
mongoose.connection.on('connected', () => console.log('Connected to MongoDB'));
mongoose.connection.on('error', (err) => console.error('MongoDB connection error:', err));

// --- ROUTES ---
app.use('/api/auth', authController);
app.use('/api/users', authMiddleware, userController);
app.use('/api/projects', authMiddleware, projectController);

// --- SERVER START ---
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger docs at http://localhost:${PORT}/api-docs`);
});
