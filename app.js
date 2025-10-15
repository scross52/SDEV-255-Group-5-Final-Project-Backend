// setup.. this is similar to when we use our default tags in html
const express = require('express')
//we have to use cors in order to host a front end and backend on the same device
var cors = require('cors')
// activate or tell this app variable to be an express server
const bodyParser = require('body-parser')
const jwt = require('jwt-simple')
const Course = require("./models/courses")
const User = require("./models/profiles")
const app = express()
app.use(cors())

app.use(express.json())
const router = express.Router()
const secret = "supersecret"

//creating a new Student Account
router.post("/user", async(req,res) => {
  if(!req.body.username || !req.body.password || !req.body.role ){
    res.status(400).json({error: "Mssing username, password or role"})
    return
  }
  const existingUser = await User.findOne({ username: req.body.username })
  if (existingUser) {
    return res.status(400).json({error: "Username already exists"})
  }

  const newUser = new User({
    username: req.body.username,
    password: req.body.password,
    role: req.body.role
  })

  try {
    newUser.save()
    res.sendStatus(201) //created
    console.log(newUser)
  } catch (err) {
    res.status(400).send(err)
  }
})

router.post("/auth", async(req,res) => {
  if(!req.body.username || !req.body.password) {
    res.status(400).json({error: "Mssing username or password"})
    return
  }
  let user = await User.findOne({username : req.body.username})
    if(!user) {
      res.status(401).json({error: "Bad Username"})
    } else{
      if (user.password != req.body.password){
        res.status(400).json({error: "Bad Password"})
      } else {
        //create a token that is encoded with the jwt library, and send back the username... this will be important
        //we also will send back as part of the token that you are current authorized
        //we could do this with a boolean or a number value i.e if auth - 0 you are not authorized, if auth
        //equals 1 you are authorized
        username2 = user.username
        const token = jwt.encode({username: user.username},secret)

        //Check if user is a teacher or a student
        console.log(user.role)
        let role = 1
        if (user.role == 'teacher') {
          role = 2
        }
        const auth = role
        
        //respond with the token
        res.json({
          username2,
          token:token,
          auth:auth
        })
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


// Get list of all courses in the database... GET Request to https://group-5-final-project-backend.onrender.com/api/courses/
router.get("/courses", async(req,res) => {
  try{
    const course = await Course.find({})
    res.json(course)
  } catch (err) {
    res.status(400).send(err)
  }
})

//Grab a single course in the database... GET Request to https://group-5-final-project-backend.onrender.com/api/courses/:id
router.get("/courses/:id", async(req,res) => {
  try {
    const course = await Course.findById(req.params.id)
    res.json(course)
  } catch (err) {
    res.status(400).send(err)

  }
})

//Add a course to the database... POST Request to https://group-5-final-project-backend.onrender.com/api/courses
router.post("/courses", async(req,res) => {
  try {
    const course = await new Course(req.body)
    await course.save()
    res.status(201).json(course)
  } catch (err) {
    res.status(400).send(err)
  }
})

//update a course in the database.. PUT Request to https://group-5-final-project-backend.onrender.com/api/courses/:id
router.put("/courses/:id", async(req,res) => {
  try{
    const course = req.body
    await Course.updateOne({_id: req.params.id}, course)
    res.sendStatus(204)
  }catch (err) {
    res.status(400).send(err)
  }
})

//delete a course in the database... DELETE Request to https://group-5-final-project-backend.onrender.com/api/courses/:id
router.delete("/courses/:id", async(req,res) => {
  try{
    await Course.deleteOne({_id: req.params.id})
    res.sendStatus(204)
  }catch (err) {
    res.status(400).send(err)
  }
})

//all requests that usually use an api atart with /api.. so the url would be https://group-5-final-project-backend.onrender.com/api/courses
app.use("/api", router)
app.listen(3000)
