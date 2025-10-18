const express = require('express')
const router = express.Router()
const jwt = require('jwt-simple')

const Course = require("../models/courses")
const User = require("../models/profiles")
const { secret } = require("../config/secrets")

//Get list of all courses in the database... 
//GET Request to https://group-5-final-project-backend.onrender.com/api/courses/
router.get("/", async(req,res) => {
  try{
    const course = await Course.find({})
    res.json(course)
  } catch (err) {
    res.status(400).send(err)
  }
})


//Grab a single course in the database... 
//GET Request to https://group-5-final-project-backend.onrender.com/api/courses/:id
router.get("/:id", async(req,res) => {
  try {
    const course = await Course.findById(req.params.id)
    res.json(course)
  } catch (err) {
    res.status(400).send(err)

  }
})


//ADD a course to the database... 
//POST Request to https://group-5-final-project-backend.onrender.com/api/courses
router.post("/", async(req,res) => {
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


//UPDATE a course in the database.. 
//PUT Request to https://group-5-final-project-backend.onrender.com/api/courses/:id
router.put("/:id", async(req,res) => {
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


//DELETE a course in the database
//DELETE Request to https://group-5-final-project-backend.onrender.com/api/courses/:id
router.delete("/:id", async(req,res) => {
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
      return res.status(403).json({error: "Only teachers can delete a course"})
    }

    await Course.deleteOne({_id: req.params.id})
    res.sendStatus(204)
  }catch (err) {
    res.status(400).send(err)
  }
})

module.exports = router;