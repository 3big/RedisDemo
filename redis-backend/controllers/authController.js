const Redis = require('ioredis');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const redis = new Redis();
const JWT_SECRETE = 'secrete';
//authorization middleware
exports.protect = async (req, res, next) => {
  //console.log(JSON.stringify(req.headers));
  let token;
  if (req.headers.authorization) {
    token = req.headers.authorization;
  }
  if (!token) {
    res.status(400).json({
      status: 'fail',
      message: 'please log in'
    });
    return;
  } else {
    try {
      const decoded = await promisify(jwt.verify)(token, JWT_SECRETE);
    } catch (err) {
      res.status(400).json({
        status: 'fail',
        message: err
      });
      return;
    }
  }
  next();
};

//this is a mock up function, dont use this as final
const correctPW = async (username, password) => {
  var flag = false;
  const userNames = await redis.sort(
    'user:idList',
    'BY',
    'user:info:*->id',
    'GET',
    'user:info:*->id',
    'GET',
    'user:info:*->usn'
  );
  for (let i = 1; i < userNames.length; i = i + 2) {
    if (userNames[i] == username) {
      const truePassword = await redis.hget(
        'user:info:' + userNames[i - 1],
        'pw'
      );
      if (truePassword == password) {
        flag = true;
      }
      break;
    }
  }

  return flag;
};

exports.logIn = async (req, res) => {
  const pwFlag = await correctPW(req.body.username, req.body.password);
  if (pwFlag) {
    const token = jwt.sign({ id: req.body.usename }, JWT_SECRETE, {
      expiresIn: '1d'
    });
    res.status(201).json({
      status: 'success',
      token
    });
  } else {
    res.status(400).json({
      status: 'fail',
      message: 'wrong username or password'
    });
  }
};
