const express = require('express');
const Redis = require('ioredis');

const app = express();
const redis = new Redis();
app.use(express.json());

app.get('/redisApi/v0.3/users', async (req, res) => {
  try {
    const key_res = await redis.scan(0, 'MATCH', 'user:info:*', 'COUNT', 10000);
    const users = await Promise.all(key_res[1].map(key => redis.hgetall(key)));

    res.status(200).json({ status: 'success', data: { users } });
  } catch (error) {
    res.status(500).json({ status: 'failure', data: { error } });
  }
});

app.get('/redisApi/v0.3/sensors', async (req, res) => {
  try {
    const key_res = await redis.scan(
      0,
      'MATCH',
      'sensor:info:*',
      'COUNT',
      10000
    );
    const sensors = await Promise.all(
      key_res[1].map(key => redis.hgetall(key))
    );

    res.status(200).json({ status: 'success', data: { sensors } });
  } catch (error) {
    res.status(500).json({ status: 'failure', data: { error } });
  }
});

const port = 8000;
app.listen(port, () => {
  console.log(`running on port: ${port}`);
});
