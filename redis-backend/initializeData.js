var Redis = require('ioredis');
var redis = new Redis();

function makeName(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function makeNum(length) {
  var result = '';
  var characters = '0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

async function initializeUsers(redis, size) {
  for (let i = 0; i < size; i++) {
    redis.hset(
      'user:info:' + i,
      'id',
      i,
      'usn',
      makeName(5) + '@gmail.com',
      'pw',
      '12345',
      'regf',
      '0',
      'signed-in',
      0,
      'first_name',
      makeName(5),
      'last_name',
      makeName(5),
      'Birthdate',
      '1996' + makeNum(4),
      'Gender',
      'M',
      'ml',
      0
    );
    redis.sadd('user:idList', i);
  }
}

async function initializeSensors(redis, size) {
  for (let i = 0; i < size; i++) {
    redis.hset(
      'sensor:info:' + i,
      'ssn',
      i,
      'wmac',
      makeName(2) + ':' + makeName(2) + ':' + makeName(2),
      'cmac',
      makeName(2) + ':' + makeName(2) + ':' + makeName(2),
      'actf',
      '00',
      'mobf',
      0,
      'stat',
      0,
      'rdt',
      '2019' + makeNum(4),
      'sdt',
      '2020' + makeNum(4),
      'edt',
      '2021' + makeNum(4),
      'drgcd',
      0
    );
    redis.sadd('sensor:idList', i);
  }
}

async function addAdmin(redis, usn, pw) {
  redis.hset('user:info:0', 'usn', usn, 'pw', pw);
}

redis
  .flushall()
  .then(() => {
    initializeUsers(redis, 100);
    initializeSensors(redis, 100);
  })
  .then(() => {
    addAdmin(redis, 'root', 'root');
  })
  .then(console.log('complete'));
