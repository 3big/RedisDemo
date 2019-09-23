const http = require('http');
const url = require('url');
const fs = require('fs');
var Redis = require("ioredis");

//single redis mode
var redis = new Redis();

const server = http.createServer((req, res) => {
  const { query, pathname} = url.parse(req.url, true);
  const pathnameInfo = req.url;

  if(pathname==='/userSignUp'){
    redis.set(query.userName,query.userPW);
    res.end("true");
  }
  if (pathname === '/userLogIn') {
    redis.get(query.userName).then(function(result){
      if(query.userPW===result){
        let hash="asdfghjkl"
        redis.set("local"+":hash",hash,"EX",60);
        res.end(hash);
      }
      else{
        res.end("false");
      }
    });
  }

  if (pathname==='/Dashboard'){
    redis.get("local"+":hash").then(function(res){
      if(query.hash===res){
        res.end("successful");
      }
    });
  }


});

server.listen(8000, '127.0.0.1', () => {
  console.log('listening to 8000');
});
