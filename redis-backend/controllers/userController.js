const Redis = require('ioredis');
const redis = new Redis();

exports.getUsers = async (req, res) => {
  try {
    const key_res = await redis.scan(0, 'MATCH', 'user:info:*', 'COUNT', 10000);
    const users = await Promise.all(key_res[1].map(key => redis.hgetall(key)));

    res.status(200).json({ status: 'success', data: { users } });
  } catch (error) {
    res.status(500).json({ status: 'failure', data: { error } });
  }
};
