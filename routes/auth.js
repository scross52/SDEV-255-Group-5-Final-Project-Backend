const express = require('express')
const router = express.Router()
const jwt = require('jwt-simple')

const User = require("../models/profiles")
const { secret } = require("../config/secrets")

function createToken(user){
   //create a token that is encoded with the jwt library, and send back the username... this will be important
        //Send back as part of the token that you are current authorized
        username2 = user.username
        const token = jwt.encode({username: user.username},secret)


        //Check if user is a teacher or a student
        // if role = 1 then a student is signed in
        let role = 1

        if (user.role == 'teacher') {
         //role = 2 a teacher is signed in
          role = 2
        }

        //assign a constant "auth" with the value of role
        const auth = role
        
        //respond with the token, usename, and authentication
        authData = {
          username2,
          token:token,
          auth:auth
        }
        return authData
}
//creating a new User Account
router.post("/user", async(req,res) => {
  if(!req.body.username || !req.body.password || !req.body.role ){
    return res.status(400).json({error: "Mssing username, password or role"})
  }
  //attempt to find username in database
  const existingUser = await User.findOne({ username: req.body.username })
  //if username exists in database, return an error
  if (existingUser) {
    return res.status(400).json({error: "Username already exists"})
  }

  //map properties to create a new user
  const newUser = new User({
    username: req.body.username,
    password: req.body.password,
    role: req.body.role
  })
  
  try {
    //create new user inside database
    newUser.save()
    const authData = createToken(newUser)
    console.log(authData)
    res.status(201).send(authData) //created
    console.log(newUser)
  } catch (err) {
    res.status(400).send(err)
  }
})


//Route to authenticate a user when signing in
router.post("/auth", async(req,res) => {
  if(!req.body.username || !req.body.password) {
    res.status(400).json({error: "Mssing username or password"})
    return
  }
  let user = await User.findOne({username : req.body.username})
    if(!user) {
      //check if username exists
      res.status(401).json({error: "Bad Username"})
    } else{
      //check if password is correct
      if (user.password != req.body.password){
        res.status(400).json({error: "Bad Password"})
      } else {
        const authData = createToken(user)
        res.json(authData)
      }
    }

})


//check status of user with a valid token, see if it matches the front end token
router.get("/status", async(req,res) => {
  if(!req/headers["x-auth"]){
    return res.status(401).json({error: "Missing X-Auth"})
  }
    //if x-auth contains the token (it should)
    const token = req.headers["x-auth"]
    try{
      const decoded = jwt.decode(token,secret)

      //send back all username and status fields to the user or front end
      let users = User.find({}, "username status")
      res.json(users)
    } catch (ex){
      res.status(401).json({error: "invalid jwt"})
    }
})

module.exports = router;