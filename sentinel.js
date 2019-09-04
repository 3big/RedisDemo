//used to add stream when testing sentinels
const {performance} = require('perf_hooks');
var Redis = require("ioredis");
//sentinel mode

var redis = new Redis({
  sentinels: [
    { host: "localhost", port: 5000 },
    { host: "localhost", port: 5001 },
    { host: "localhost", port: 5002 }
  ],
  name: "mymaster"
});

var today = new Date();
var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
redis.xadd("fakestream",'*',"time",String(time)).then(function(result){
  console.log(result);
});
