const MongoClient = require("mongodb").MongoClient;
const mongoClient = new MongoClient("mongodb://localhost:27017/", { useUnifiedTopology: true });
const express = require("express");
const objectId = require("mongodb").ObjectID;
const app = express();
const jsonParser = express.json();
let dbClient;
app.use(express.static(__dirname + "/public"));
// fisrt open db
mongoClient.connect(function (err, client) {
   if (err) return console.log("Err: " + err);
   dbClient = client;
   app.locals.collection = client.db("usersdb").collection("users");
   app.listen(8800, function(){
      console.log("Server waiting...");
   });
});
// method GET for find (look) users
app.get("/api/users", function (req, res) {
   const collections = req.app.locals.collection;
   collections.find({}).toArray(function (err, users) {
      if (err) return console.log("Err : " + err);
      res.send(users);
   });
});
app.post("/api/users", jsonParser, function (req, res) {
   if (!req.body) return console.log("Err" + res.sendStatus(400));
   const useName = req.body.name;
   const userAge = req.body.age;
   const user = {name: useName, age : userAge};
   let collection = req.app.locals.collection;
   collection.insertOne(user, function (err, client) {
      if (err) return console.log("Err : " + err);
      res.send(user);
   });

});
app.get("/api/users/:id", function(req, res){

   const id = new objectId(req.params.id);
   const collection = req.app.locals.collection;
   collection.findOne({_id: id}, function(err, user){

      if(err) return console.log(err);
      res.send(user);
   });
});
app.put ("/api/users/", jsonParser, function (req, res) {
   const id = new objectId(req.body.id);
   console.log(id);
   const collection = req.app.locals.collection;
   collection.findOneAndDelete({_id: id}, function (err, client) {
      if (err) return  console.log("Err : " + err);
      let user = client.value;
      res.send(user);
   });
});
app.put("/api/users", jsonParser, function (req, res) {
   if(!req.body) return res.sendStatus(400);
   const id = new objectId(req.body.id);
   console.log(id);
   const userName = req.body.name;
   const userAge = req.body.age;
   const collection = req.app.locals.collection;
   collection.findOneAndUpdate({_id: id }, {$set : {name : userName , age : userAge}}, {returnOriginal : false}, function (err, client) {
      if (err) return console.log("Err : " + err);
      const user = client.value;
      res.send(user);
   });
});
process.on("SIGINT", () => {
   dbClient.close();
   process.exit();
});