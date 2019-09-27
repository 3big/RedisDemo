const Redis = require('ioredis');
const redis = new Redis();

exports.getSensors = async (req, res) => {
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
};
