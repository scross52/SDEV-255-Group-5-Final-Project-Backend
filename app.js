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

//creating a new User Account
router.post("/user", async(req,res) => {
  if(!req.body.username || !req.body.password || !req.body.role ){
    res.status(400).json({error: "Mssing username, password or role"})
    return
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
    res.sendStatus(201) //created
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


//allow only students to add courses to schedule
router.post('/add-course/:id', async(req,res) => {
  const token = req.headers["x-auth"];
  const courseId = req.params.id;

  if (!token) {
    return res.status(401).json({error: "Missing Token"})
  }

  try {
    const decoded = jwt.decode(token, secret);
    const user = await User.findOne({ username: decoded.username});

    if (!user) {
      return res.status(404).json({error: "User not found"})
    } else if (user.role != "student") {
      return res.status(403).json({error: "Only students can add courses to schedule"})
    }

    //check if course exists
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({error: "Course not found"})
    }

    //check if already enrolled
    if (user.enrolledCourses.includes(courseId)) {
      return res.status(400).json({error: "Already enrolled in this course"})
    }

    // Add course to enrolled list
    user.enrolledCourses.push(courseId);
    await user.save();
    res.json(user.enrolledCourses);
  } catch (err) {
    res.status(401).json({ error: "Invalid token", detail: err.message });
  }
})

//allow students to remove a course from their schedule
router.post('/delete-course/:id', async(req,res) => {
  const token = req.headers["x-auth"];
  const courseId = req.params.id;

  if (!token) {
    return res.status(401).json({error: "Missing Token"})
  }

  try {
    const decoded = jwt.decode(token, secret);
    const user = await User.findOne({ username: decoded.username});

    //check if user exists
    if (!user) {
      return res.status(404).json({error: "User not found"})
      //check if user is a student, if not return 403 forbidden
    } else if (user.role != "student") {
      return res.status(403).json({error: "Only students have a course schedule"})
    }

    
    // Update students enrolled courses
    const updatedUser = await User.findOneAndUpdate(
      { username: decoded.username },
      { $pull: { enrolledCourses: courseId } },
      //get the newly updated docuemnt
      { new: true }
    ).populate('enrolledCourses');

    res.json(updatedUser.enrolledCourses);
  } catch (err) {
    res.status(401).json({ error: "Invalid token", detail: err.message });
  }
})

// display all courses for a student, MUST BE SIGNED IN
router.get('/schedule', async(req,res) => {
  const token = req.headers["x-auth"];

  if (!token) {
    return res.status(401).json({error: "Missing Token"})
  }

  try {
    const decoded = jwt.decode(token, secret);
    //locate the user in the database and populate the enrolledCourses property with the full course object
    const user = await User.findOne({ username: decoded.username}).populate("enrolledCourses");

    //check if user exists
    if (!user) {
      return res.status(404).json({error: "User not found"})
      //check if user is a teacher
    } else if (user.role != "student") {
      return res.status(403).json({error: "Only students have a course schedule"})
    }
    
    //send frontend json data of all enrolled courses and their properties
    res.json(user.enrolledCourses);
  } catch (err) {
    res.status(401).json({ error: "Invalid token", detail: err.message });
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
  const token = req.headers["x-auth"];

  if (!token) {
    return res.status(401).json({error: "Missing Token"})
  }

  try {
    const decoded = jwt.decode(token, secret);
    //locate the user in the database and populate the enrolledCourses property with the full course object
    const user = await User.findOne({ username: decoded.username});
    
    //check if user exists
    if (!user) {
      return res.status(404).json({error: "User not found"})
      //check if user is teacher, if not then return 403 forbidden
    } else if (user.role != "teacher") {
      return res.status(403).json({error: "Only teachers can create a course"})
    }


    const course = await new Course(req.body)
    await course.save()
    res.status(201).json(course)
  } catch (err) {
    res.status(400).send(err)
  }
})

//update a course in the database.. PUT Request to https://group-5-final-project-backend.onrender.com/api/courses/:id
router.put("/courses/:id", async(req,res) => {
  const token = req.headers["x-auth"];

  if (!token) {
    return res.status(401).json({error: "Missing Token"})
  }

  

  try {
    const decoded = jwt.decode(token, secret);
    //locate the user in the database and populate the enrolledCourses property with the full course object
    const user = await User.findOne({ username: decoded.username});
    
    //check if user exists
    if (!user) {
      return res.status(404).json({error: "User not found"})
      //check if user is teacher, if not then return 403 forbidden
    } else if (user.role != "teacher") {
      return res.status(403).json({error: "Only teachers can create a course"})
    }

    const course = req.body
    await Course.updateOne({_id: req.params.id}, course)
    res.sendStatus(204)
  }catch (err) {
    res.status(400).send(err)
  }
})

//delete a course in the database... DELETE Request to https://group-5-final-project-backend.onrender.com/api/courses/:id
router.delete("/courses/:id", async(req,res) => {
  const token = req.headers["x-auth"];

  if (!token) {
    return res.status(401).json({error: "Missing Token"})
  }

  try {
    const decoded = jwt.decode(token, secret);
    //locate the user in the database and populate the enrolledCourses property with the full course object
    const user = await User.findOne({ username: decoded.username});
    
    //check if user exists
    if (!user) {
      return res.status(404).json({error: "User not found"})
      //check if user is teacher, if not then return 403 forbidden
    } else if (user.role != "teacher") {
      return res.status(403).json({error: "Only teachers can create a course"})
    }

    await Course.deleteOne({_id: req.params.id})
    res.sendStatus(204)
  }catch (err) {
    res.status(400).send(err)
  }
})

//all requests that usually use an api atart with /api.. so the url would be https://group-5-final-project-backend.onrender.com/api/courses
app.use("/api", router)
app.listen(3000)
