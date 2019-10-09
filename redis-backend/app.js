const dotenv = require('dotenv');
const express = require('express');

const app = express();

const userController = require('./controllers/userController');
const sensorController = require('./controllers/sensorController');
const authController = require('./controllers/authController');

app.use(express.json());

dotenv.config({ path: './config.env' });

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
