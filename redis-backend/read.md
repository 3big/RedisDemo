<!-- prettier-ignore -->
Basic running instruction: 
    - 1, install redis and run redis server on default port 6379 
    - 2, run "node initializeData.js" to intialize the fake data 
    - 3, run "nodemon app.js" to start backend on port 8000

<!-- prettier-ignore -->
Routings: 
    - GET http://127.0.0.1:8000/redisApi/v0.3/users : this displays all users info 
    - GET http://127.0.0.1:8000/redisApi/v0.3/sensors : this displays all sensors info 
    - GET http://127.0.0.1:8000/redisApi/v0.3/adminusers : this is the protected routing for users 
    - POST http://127.0.0.1:8000/redisApi/v0.3/login : this is the log in routing, which returns the token

<!-- prettier-ignore -->
Fun with login and protected routing: 
    - use postman to play with all different kinds of requests, since there is no front end. You can do POST on browser only. 
    - use POST http://127.0.0.1:8000/redisApi/v0.3/login with request:
    {
        "username":"root",
        "password":"root"
    }   
    you will get response with element token. 
    - go GET http://127.0.0.1:8000/redisApi/v0.3/adminusers with header of : key: authorization, value: [the token you receied from last step] 
    - congrats, you got into the protected routing as admin
