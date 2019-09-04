//used to create fake data for clusters

function makeName(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

function createArray(length) {
    var arr = new Array(length || 0),
        i = length;
    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while(i--) arr[length-1 - i] = createArray.apply(this, args);
    }
    return arr;
}

async function initializeFakeDataPip(redis,size){
  var textArray = [
    'male',
    'female'
  ];
  min=18;
  max=99;
  primary_key_name="ID"
  primary_key=createArray(size);
  entry_name=createArray(size);
  entry_fields=["name","age","gender","ID"];
  entry_elements=createArray(size,4);
  num=size;
  for(let i=0; i<size; i++){
    var randomNumber = Math.floor(Math.random()*textArray.length);
    primary_key[i]=i+1;
    entry_name[i]="student_".concat(i+1);
    entry_elements[i]=[makeName(5),Math.floor(Math.random() * (+max - +min) + +min),textArray[randomNumber],i+1];
  }
  addProfilePip(redis,primary_key_name,primary_key,entry_name,entry_fields,entry_elements,num);
}

async function addProfilePip(redis,primary_key_name,primary_key,entry_name,entry_fields,entry_elements,num){
  var pipeline = redis.pipeline();
  for(let i=0; i<num; i++){
    pipeline.rpush(primary_key_name,primary_key[i]);
    for(let j=0; j<entry_fields.length; j++){
      pipeline.hset(entry_name[i],entry_fields[j],entry_elements[i][j]);
    }
  }
  pipeline.exec(function (err, results) {
    console.log("insertion with pipeline: "+num+" tuples");
  });
}

var Redis = require("ioredis");

var cluster = new Redis.Cluster([
  {
    port: 30001,
    host: "127.0.0.1"
  },
  {
    port: 30002,
    host: "127.0.0.1"
  },
  {
    port: 30003,
    host: "127.0.0.1"
  }
]);

initializeFakeDataPip(cluster,1000);
