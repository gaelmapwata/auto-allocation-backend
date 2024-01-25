import express, { Express } from 'express';
import dotenv from 'dotenv';
import http from 'http';
import expressFormData from 'express-form-data';
import os from 'os';
import cors from 'cors';
import path from 'path';
import router from './router';
import sequelize from './sequelize-instance';
import LogHelper from './utils/logHelper';

/**
 * Create express instance and initialize dotenv
 */

dotenv.config();
const app: Express = express();
const server = http.createServer(app);

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
    // eslint-disable-next-line no-console
    console.log('Connection has been established successfully.');
  })
  .catch((error: Error) => {
    // eslint-disable-next-line no-console
    console.error('Unable to connect to the database:', error);
  });

/**
 * Run server
 */

const port = process.env.NODE_SERVER_PORT;
server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`app listening on port ${port}`);
  LogHelper.info(`Server started on port ${port}`);
});
