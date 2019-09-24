/*
supported datatype: string, set, list, zset, hash
store buffer=3
there will be 3 copies of data stored based on the time stamp
*/
async function saveMultiCopy(keyNames,dbMain,db2ns,copy_size){
  keyNames.forEach(keyName=>saveCopy(keyName,dbMain,db2ns,copy_size));
}

async function saveCopy(keyName,dbMain,db2ns,copy_size){
  var datatype;
  var datacontent;
  dbMain.type(keyName).then(function(result){
    datatype = result;
  }).then(function(){
    var timehash = (+new Date);
    //check buffer
    db2nd.llen(keyName+":stamp").then(function(result){
      if(result==copy_size){
        db2nd.lpop(keyName+":stamp").then(function(result){
          db2nd.del(keyName+":"+result);
        });
      }
      db2nd.rpush(keyName+":stamp",timehash);
    });
    //
    if(datatype=="string"){
        dbMain.get(keyName).then(function(result){
        datacontent=result;
      }).then(function(){
        db2nd.set(keyName+":"+timehash,datacontent).then(function(){
          console.log("data copied");
        });
      });
    }
    else if(datatype=="set"){
        dbMain.smembers(keyName).then(function(result){
        datacontent=result;
      }).then(function(){
        db2nd.sadd(keyName+":"+timehash,datacontent).then(function(){
          console.log("data copied");
        });
      });
    }
    else if(datatype=="zset"){
        dbMain.zrange(keyName,0,-1,"WITHSCORE").then(function(result){
        datacontent=result;
      }).then(function(){
        db2nd.zadd(keyName+":"+timehash,datacontent).then(function(){
          console.log("data copied");
        });
      });
    }
    else if(datatype=="hash"){
        dbMain.hgetall(keyName).then(function(result){
        datacontent=result;
      }).then(function(){
        db2nd.hset(keyName+":"+timehash,datacontent).then(function(){
          console.log("data copied");
        });
      });
    }
    else if(datatype=="list"){
        dbMain.lrange(keyName,0,-1).then(function(result){
        datacontent=result;
      }).then(function(){
        db2nd.rpush(keyName+":"+timehash,datacontent).then(function(){
          console.log("data copied");
        });
      });
    }
  });
}

async function restoreRecentCopy(keyName,dbMain,db2ns){
  var recentstamp;
  db2nd.lrange(keyName+":stamp",-1,-1).then(function(result){
    recentstamp=result;
    db2nd.type(keyName+":"+result).then(function(result){
      switch(result){
        case "string":
          db2nd.get(keyName+":"+recentstamp).then(function(result){
            dbMain.set(keyName,result).then(function(){
              console.log("resotred successful");
            });
          });
          break;
        case "set":
          db2nd.smembers(keyName+":"+recentstamp).then(function(result){
            dbMain.sadd(keyName,result).then(function(){
              console.log("resotred successful");
            });
          });
          break;
        case "zset":
          db2nd.zrange(keyName+":"+recentstamp,0,-1,"WITHSCORE").then(function(result){
            dbMain.zadd(keyName,result).then(function(){
              console.log("resotred successful");
            });
          });
          break;
        case "hash":
          db2nd.hgetall(keyName+":"+recentstamp).then(function(result){
            dbMain.hset(keyName,result).then(function(){
              console.log("resotred successful");
            });
          });
          break;
        case "list":
          db2nd.lrange(keyName+":"+recentstamp,0,-1).then(function(result){
            dbMain.rpush(keyName,result).then(function(){
              console.log("resotred successful");
            });
          });
          break;
      }
    });
  });
}


const fs = require('fs');
const Redis = require("ioredis");

//configuration
const copy_size = 1;
const dbMain = new Redis(6379);
const db2nd = new Redis(6380);
//edit your key list to declair the keys you want to backup to backup.rdp file
const keyList = ["test"];

//main
saveMultiCopy(keyList,dbMain,db2nd,1).then(async ()=>{
  const res = await db2nd.save();
  console.log(res);
}).then(async ()=>{
  const location = await db2nd.config("get","dir");
  fs.copyFile(location[1]+'/dump.rdb', './backup.rdb', (err) => {
    if (err) throw err;
    console.log('backup.rdb generated in current directory');
  });
});


/*
let requests = keyList.map((item)=>{
  return new Promise((resolve)=>{
    saveCopy(item,dbMain,db2nd,1);
  });
});

Promise.all(requests).then(() => console.log('done'));
*/
/*
Promise.all(requests).then(() => {
  db2nd.save().then((res)=>{console.log(res)});
});
*/
