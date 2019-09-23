const express = require('express');
const Redis = require('ioredis');

const app = express();
const redis = new Redis();
app.use(express.json());

app.get('/redisApi/v0.3/users', (req, res) => {
  var users = [];
  redis.scan(0, 'MATCH', 'user:info:*', 'COUNT', 10000).then(key_res => {
    for (let i = 0; i < key_res[1].length; i++) {
      redis.hgetall(key_res[1][i]).then(user_res => {
        const newOBJ = Object.assign(user_res);
        users.push(newOBJ);
        if (i === key_res[1].length - 1) {
          res.status(200).json({
            status: 'success',
            data: {
              users
            }
          });
        }
      });
    }
  });
});

app.get('/redisApi/v0.3/sensors', (req, res) => {
  var sensors = [];
  redis.scan(0, 'MATCH', 'sensor:info:*', 'COUNT', 10000).then(key_res => {
    for (let i = 0; i < key_res[1].length; i++) {
      redis.hgetall(key_res[1][i]).then(user_res => {
        const newOBJ = Object.assign(user_res);
        sensors.push(newOBJ);
        if (i === key_res[1].length - 1) {
          res.status(200).json({
            status: 'success',
            data: {
              sensors
            }
          });
        }
      });
    }
  });
});

const port = 8000;
app.listen(port, () => {
  console.log(`running on port: ${port}`);
});
