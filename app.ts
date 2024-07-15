import express, { Express } from 'express';
import dotenv from 'dotenv';
import https from 'https'; // Utilisez https à la place de http
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

const port = process.env.NODE_SERVER_PORT || 3000;
const privateKeyPath = path.join(__dirname, '10.80.6.136-key.pem'); // Chemin vers votre clé privée
const certificatePath = path.join(__dirname, '10.80.6.136.pem'); // Chemin vers votre certificat SSL

const httpsOptions = {
  key: fs.readFileSync(privateKeyPath),
  cert: fs.readFileSync(certificatePath),
};

const server = https.createServer(httpsOptions, app);

server.listen(port, () => {
  console.log(`app listening on port ${port}`);
  LogHelper.info(`Server started on port ${port}`);
});
