import express, { Express } from 'express';
import dotenv from 'dotenv';
import http from 'http';
import https from 'https';
import expressFormData from 'express-form-data';
import os from 'os';
import cors from 'cors';
import path from 'path';
import fs from 'fs'; // Importez fs pour lire les fichiers

import router from './router';
import sequelize from './sequelize-instance';
import LogHelper from './utils/logHelper';

/**
 * Create express instance and initialize dotenv
 */

dotenv.config();
const app: Express = express();

/**
 * Middleware
 */

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(express.static(path.join(__dirname, '../public')));
app.use(cors({
  origin: '*',
}));
app.use((_, res, next) => {
  res.header(
    'Access-Control-Allow-Headers',
    'x-access-token, Origin, Content-Type, Accept',
  );
  next();
});

/**
 * Express-form-data
 */

const options = {
  uploadDir: os.tmpdir(),
  autoClean: true,
};
app.use(expressFormData.parse(options));

/**
 * Bind router to app
 */
app.use('/api', router);

/**
 * Init Sequelize
 */
sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((error: Error) => {
    console.error('Unable to connect to the database:', error);
  });

/**
 * Run server with HTTPS
 */

const key = fs.readFileSync(path.resolve(__dirname, process.env.CERTIFICAT_PRIVATE_KEY_PATH || ''));
const cert = fs.readFileSync(path.resolve(__dirname, process.env.CERTIFICAT_PATH || ''));
const ca = [
  fs.readFileSync(path.resolve(__dirname, process.env.ROOT_CERTIFICAT_PATH || '')),
  fs.readFileSync(path.resolve(__dirname, process.env.INTERMEDIATE_CERTIFICAT_PATH || '')),
];
const httpsOptions = { key, cert, ca };

const httpServer = http.createServer(app);
const httpsServer = https.createServer(httpsOptions, app);

const port = process.env.NODE_SERVER_PORT || 3000;
const portSecure = process.env.NODE_SERVER_PORT_SECURE || 3006;

httpServer.listen(port, () => {
  console.log(`Http Server Running port ${port}`);
  LogHelper.info(`Http Server Running port ${port}`);
});

httpsServer.listen(portSecure, () => {
  console.log(`Https Server Running port ${portSecure}`);
  LogHelper.info(`Https Server Running port ${portSecure}`);
});
