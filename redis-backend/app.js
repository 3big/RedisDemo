const express = require('express');
const Redis = require('ioredis');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const app = express();
const redis = new Redis();

const userController = require('./controllers/userController');
const sensorController = require('./controllers/sensorController');
const authController = require('./controllers/authController');

const JWT_SECRETE = 'secrete';

app.use(express.json());

app.route('/redisApi/v0.3/users').get(userController.getUsers);

app
  .route('/redisApi/v0.3/adminusers')
  .get(authController.protect, userController.getUsers);

app.route('/redisApi/v0.3/sensors').get(sensorController.getSensors);

//login
app.route('/redisApi/v0.3/login').post(authController.logIn);

//

const port = 8000;
app.listen(port, () => {
  console.log(`running on port: ${port}`);
});
