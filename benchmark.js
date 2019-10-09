/*
README:
this api serves to add profile, delete profile, sort profile and search profile
environment:
making sure you have node.js project environment and also ioredis package
run: "node redisAPI.js" to execute.
*/

/*
this section is merely for fake data generation
*/
function makeName(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}
/*
try doing some pipelining to boost up mass data insertion
*/

async function initializeFakeData(redis,size){
  var textArray = [
    'male',
    'female'
  ];
  min=18;
  max=99;
  for(let i=0;i<size;i++){
    var randomNumber = Math.floor(Math.random()*textArray.length);
    addProfile(redis,"ID",i+1,"student_".concat(i+1),["name","age","gender","ID"],
      [makeName(5),Math.floor(Math.random() * (+max - +min) + +min),textArray[randomNumber],i+1]);
  }
}

async function  CMinitializeFakeData(redis,size){
  var textArray = [
    'male',
    'female'
  ];
  min=18;
  max=99;
  for(let i=0;i<size;i++){
    var randomNumber = Math.floor(Math.random()*textArray.length);
    addProfileBM(redis,"student:"+i,["name","age","gender","ID"],
      [makeName(5),Math.floor(Math.random() * (+max - +min) + +min),textArray[randomNumber],i+1]);
  }
}

//help function of creating multi dimension array

function createArray(length) {
    var arr = new Array(length || 0),
        i = length;
    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while(i--) arr[length-1 - i] = createArray.apply(this, args);
    }
    return arr;
}

//initialize benmark data with pipelining function
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

/*
//addProfilePip(redis,primary_key_name,entry_name,entry_fields,entry_elements,num)
//usage: add massive amount of new tuples to Redis DB with pipelining
  primary_key_name: the name of primary key of this entry, normally a super/parent group of entry_name.
  entry_name: list of names of profile entry, also will use as a key for the hash
  entry_fields,entry_elements: list of fields and elements that used to create hash profile
*/
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

/*
//printProfileEntry(redis,entry_name)
  print a single profile based on the entry name
//printAllProfile(redis,primary_key_name,entry_names)
  print all profile alone with their super key
*/

async function printProfileEntry(redis,entry_name){
  redis.hgetall(entry_name).then(function(result){
    console.log(result);
  });
}

async function printAllProfile(redis,primary_key_name,entry_names){
  for(let i=0; i<entry_names.length; i++){
    printProfileEntry(redis,entry_names[i]);
  }
  redis.lrange(primary_key_name,0,-1).then(function(result){
    console.log(result);
  });
}

/*
//addProfile(redis,primary_key_name,entry_name,entry_fields,entry_elements)
//usage: add a new entry to Redis DB
  primary_key_name: the name of primary key of this entry, normally a super/parent group of entry_name.
  entry_name: name of this profile entry, also will use as a key for the hash
  entry_fields,entry_elements: fields and elements that used to create hash profile
//example: to create a student profile of [name:hello,age:18,gender:M]
  call addEntry(redis,"ID","student_1",["name","age","gender"],["hello",18,"M"]);
*/
async function addProfile(redis,primary_key_name,primary_key,entry_name,entry_fields,entry_elements){
  try{
    //list
    redis.rpush(primary_key_name,primary_key);
    //hash
    for(let i=0; i<entry_fields.length; i++){
      redis.hset(entry_name,entry_fields[i],entry_elements[i]).then(function(result){
      });
    }
  }
  catch(err){
    console.log(err.message);
  }
  //console.log("add success");
}

/*
//deleteEntry(redis,primary_key_name,entry_key,entry_name)
//usage: used to delete an entry
  primary_key_name: the name of primary key of this entry, normally a super/parent group of entry_name.
  entry_key: corresponding key of this entry in its super/parent group
  entry_name: name of this profile entry, also will use as a key for the hash
//example: to delete a student profile created from addEntry example:
  call deleteEntry(redis,"ID",1,"student_1")
*/

async function deleteProfile(redis,primary_key_name,entry_index,entry_name){
  try{
    redis.del(entry_name);
    redis.lrem(primary_key_name,1,entry_index);
  }
  catch(err){
    console.log(err.message);
  }
  console.log("delete success\n");
}

/*
//sortEntryBy(redis,primary_key_name,sort_field,entry_pattern,entry_fields)
//usage: used to display all profiles based on the sort attribute.
  primary_key_name: the name of primary key of this entry, normally a super/parent group of entry_name.
  sort_field: the attribute the sort is based on
  entry_pattern: the pattern string for all the entries.(e.g:"student_*")
  entry_fields: all the fields you want to print out at the end.
//example:
  Based on previous example, if I want to sort all students profile based on age
  call sortEntryBy(redis,"ID","age","student_*->",["name","age","gender"])
*/

async function sortEntryBy(redis,primary_key_name,sort_field,entry_pattern,entry_fields){
  try{
    for(let i=0; i<entry_fields.length; i++){
      redis.sort(primary_key_name,"BY",entry_pattern.concat(sort_field),
        "GET",entry_pattern.concat(entry_fields[i])).then(function(result){
          //console.log(result);
        });
    }
  }
  catch(err){
    console.log(err.message);
  }
}


/*
//searchEntryBy(redis,entry_pattern,entry_range_start,entry_range_end,search_field,search_entry)
  usage: linear search a value
//entry_pattern: the key pattern for search range
  entry_range_start: the start range index applied to key pattern
  entry_range_end: the end range index applied to key pattern
  search field: the field name search will operate in
  search_entry: the search value of that field
//example, to search male profiles from student 0 to 5:
  call searchEntryBy(redis,"student_",0,5,"gender","male")

async function searchEntryBy(redis,entry_pattern,entry_range_start,entry_range_end,search_field,search_entry){
  let flag=false;
  for(let i = entry_range_start;i<=entry_range_end;i++){
    redis.hget(entry_pattern.concat(i),search_field).then(function(result){
      if(result==search_entry){
        redis.hgetall(entry_pattern.concat(i)).then(function(result){
          //console.log(result);
          flag=true;
        });
      }
    });
  }
  if(flag){console.log("not found");}
}
*/

async function searchEntryBy(redis,entry_pattern,search_field,search_entry){
  let flag=false;
  redis.scan(0,"MATCH",entry_pattern,"COUNT",100000).then(function(result){
    for(let i=0; i<result[1].length; i++){
      redis.hget(result[1][i],search_field).then(function(res){
        if(res==search_entry){
          flag=true;
          //console.log(result[1][i]+" has match: "+res);
        }
      });
    }
  });
}

/*
fucntion used to create association data and configuration
to associate sensorA and userA with configuration of color=black:
createAssociation(redis,"usn","ssn","sensorA","userA");
createConfig(redis,"sensorA","userA","color","black");
Be noted that config will not disappear if the association does not exist.
It is designed in such way so the config is always saved if association is created in the future.
*/
async function createAssociation(redis,typeA,typeB,nameA,nameB){
  redis.sadd(String(typeA)+"_"+String(typeB)+":mapping:"+String(nameA),nameB);
  redis.sadd(String(typeB)+"_"+String(typeA)+":mapping:"+String(nameB),nameA);
}

async function createConfig(redis,nameA,nameB,configName,configValue){
  redis.hset("config:"+String(nameA)+"_"+String(nameB),configName,configValue);
}
/*
//subscribeStream(redis,stream, listener)
  usage: allow sub to a stream. Block operation will update the listener once new stream is added
  all previous entries from this stream will be printed at the beginning
//stream: stream name you want to subscribe to
  listener: output listener you want the result direct to
//example: subscribe to "fakestream" with all previous entries and coming entries. Pirnt result to console:
  subscribeStream(redis,'fakestream', console.log)
*/
async function subscribeStream(redis,stream, listener) {
  let lastID = '$';
  //read all previous stream
  const reply = await redis.xread('BLOCK', '0', 'STREAMS', stream, 0);
  const results = reply[0][1];
  listener(results);
  while (true) {
    // Implement your own `try/catch` logic,
    // (For example, logging the errors and continue to the next loop)
    const reply = await redis.xread('BLOCK', '0', 'COUNT', 100, 'STREAMS', stream, lastID);
    if (!reply) {
      continue;
    }
    const results = reply[0][1];
    const {length} = results;
    if (!results.length) {
      continue;
    }
    listener(results);
    lastID = results[length - 1][0];
  }
}


//benchmark
async function benchmark(redis,benchmark_size,pipe_flag,lua_flag){
  var time_stamp0;
  var time_stamp1;
  var time_stamp2;
  redis.flushall().then(function(){
    time_stamp0 = performance.now();
    console.log("benchmark size: "+benchmark_size);
    if(pipe_flag==1){
      return initializeFakeDataPip(redis,benchmark_size);
    }
    else{
      return initializeFakeData(redis,benchmark_size);
    }
  }).then(function(){
    time_stamp1 = performance.now();
    console.log("time for initialize data: "+benchmark_size);
    console.log(time_stamp1-time_stamp0);
    if(lua_flag==0){
      return searchEntryBy(redis,"student_*","gender","male");
    }
    else{
      return redis.luasearch("student_*","gender","male");
    }
  }).then(function(){
    time_stamp2 = performance.now();
    console.log("time for search operation: ");
    console.log(time_stamp2-time_stamp1);
    return redis.memory("stats").then(function(result){
      console.log(result[0]+": "+result[1]/1000000+"MB");
      console.log(result[2]+": "+result[3]/1000000+"MB");
    });
  });
}

async function benchmark2(redis,benchmark_size,pipe_flag,lua_flag){
  redis.flushall().then(function(){
    let time_stamp0 = performance.now();
    console.log("benchmark size: "+benchmark_size);
    console.log("time for initialize data: "+benchmark_size);
    if(pipe_flag==1){
      return initializeFakeDataPip(redis,benchmark_size).then(()=>{
        console.log(performance.now()-time_stamp0);
      });
    }
    else{
      return initializeFakeData(redis,benchmark_size).then(()=>{
        console.log(performance.now()-time_stamp0);
      });
    }
  }).then(function(){
    time_stamp1 = performance.now();
    console.log("time for search operation: ");
    if(lua_flag==0){
      return searchEntryBy(redis,"student_*","gender","male").then(()=>{
        console.log(performance.now()-time_stamp1);
      });
    }
    else{
      return redis.luasearch("student_*","gender","male").then(()=>{
        console.log(performance.now()-time_stamp1);
      });
    }
  }).then(function(){
    return redis.memory("stats").then(function(result){
      console.log(result[0]+": "+result[1]/1000000+"MB");
      console.log(result[2]+": "+result[3]/1000000+"MB");
    });
  });
}

//compare benchmark_size
async function CMbenchmark(redis,size,flag){
  var time_stamp0;
  var time_stamp1;
  var time_stamp2;
  redis.flushall().then(()=>{
    //initialize data
  time_stamp0 = performance.now();
    console.log("benchmark size: "+size);
    return CMinitializeFakeData(redis,size);
  }).then(()=>{
    time_stamp1 = performance.now();
    console.log("time for initialize data: "+size);
    console.log(time_stamp1-time_stamp0);
    return searchEntryByBM(redis,"gender","male");
  }).then(()=>{
    time_stamp2 = performance.now();
    console.log("time for search operation: ");
    console.log(time_stamp2-time_stamp1);
    return redis.memory("stats").then(function(result){
      console.log(result[0]+": "+result[1]/1000000+"MB");
      console.log(result[2]+": "+result[3]/1000000+"MB");
    });
  });
}
//this section implement the string method
async function addProfileBM(redis,entry_name,entry_fields,entry_elements){
  try{
    for(let i=0; i<entry_fields.length; i++){
      redis.set(entry_name+":"+entry_fields[i],entry_elements[i]);
    }
  }
  catch(err){
    console.log(err.message);
  }
  //console.log("add success");
}

async function deleteProfileBM(redis,entry_name){
  try{
    redis.scan(0,"MATCH",entry_name+":*","COUNT",100000).then(function(result){
      redis.del(result[1]);
    });
  }
  catch(err){
    console.log(err.message);
  }
  console.log("delete success\n");
}

async function searchEntryByBM(redis,search_field,search_entry){
  let flag=false;
  redis.scan(0,"MATCH","*:"+search_field,"COUNT",100000).then(function(result){
    for(let i=0; i<result[1].length; i++){
      redis.get(result[1][i]).then(function(res){
        if(res==search_entry){
          flag=true;
          //console.log(result[1][i]+" has match: "+res);
        }
      });
    }
  });
  if(flag){console.log("not found");}
}


/*
the demo includes:
1, generate 6 new profiles and print
2, remove last profile and print
3, sort by age and print all fields saperately
4, search all profile that has gender of male and print
5, stream data from "fakestream" with current time as dummy data
*/
async function API_test(redis){
  //generate fake data with 6 fake profiles
  redis.flushall();
  var benchmark_size=6;
  initializeFakeData(redis,benchmark_size);
  //print all profiles
  printAllProfile(redis,"ID",["student_1","student_2","student_3","student_4","student_5","student_6"]);
  //delete last one from redis
  deleteProfile(redis,"ID",6,"student_6");
  //print again to show deletion
  printAllProfile(redis,"ID",["student_1","student_2","student_3","student_4","student_5"]);
  //sort all profile by age
  sortEntryBy(redis,"ID","age","student_*->",["name","age","gender"]);
  //search all male profile
  searchEntryBy(redis,"student_*","gender","male");
  //initialize stream
  var today = new Date();
  var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  redis.xadd("fakestream",'*',"time",String(time));
  var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  redis.xadd("fakestream",'*',"time",String(time));
  var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  redis.xadd("fakestream",'*',"time",String(time));
  //listen to stream
  subscribeStream(redis,'fakestream', console.log);
}

async function benchAll(){
  Promise.resolve(benchmark(redis,size,0)).then(function(){
    return Promise.resolve(benchmark2(redis,size,0));
}).then(function(){
    return Promise.resolve(CMbenchmark(redis,size,0));
});
}

async function benchAll2(){
  const result1 = await benchmark(redis,size,0);
  const result2 = await benchmark2(redis,size,0);
  const result3 = await CMbenchmark(redis,size,0);
}

const {performance} = require('perf_hooks');
var Redis = require("ioredis");
const R = require('ramda');

//single redis mode
var redis = new Redis();
size=100000;
//lua script
const LuaScript = `local result = {}
local entryList = redis.call("scan",0,"MATCH",KEYS[1],"COUNT",100000)
entryList = entryList[2]
for i = 1, table.getn(entryList), 1
do
  local hashRes = redis.call("hget",entryList[i],KEYS[2])
  if hashRes == KEYS[3] then
    table.insert(result,entryList[i])
    table.insert(result,hashRes)
  end
end
return result`;

redis.defineCommand("luasearch",{
  numberOfKeys: 3,
  lua: LuaScript
});
//use below line to benchmark the hash-list method
//DO NOT benchmark both at same time, comment this line when benchmarking list method.
benchmark(redis,size,0,1);
//uncomment below line to benchmark the string method
//CMbenchmark(redis,size,0);
//API_test(redis);
