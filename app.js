// setup.. this is similar to when we use our default tags in html
const express = require('express')
//we have to use cors in order to host a front end and backend on the same device
var cors = require('cors')
// activate or tell this app variable to be an express server
const bodyParser = require('body-parser')
const Course = require("./models/courses")
const app = express()
app.use(cors())

app.use(express.json())
const router = express.Router()

// Get list of all courses in the database... GET Request to https://group-5-final-project-backend.onrender.com/api/coursescourses/
router.get("/courses", async(req,res) => {
  try{
    const course = await Course.find({})
    res.send(course)
  } catch (err) {
    res.status(400).send(err)
  }
})

//Grab a single course in the database... GET Request to https://group-5-final-project-backend.onrender.com/api/courses:id
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

//update a course in the database.. PUT Request to https://group-5-final-project-backend.onrender.com/api/courses:id
router.put("/courses/:id", async(req,res) => {
  try{
    const course = req.body
    await Course.updateOne({_id: req.params.id}, course)
    res.sendStatus(204)
  }catch (err) {
    res.status(400).send(err)
  }
})

//delete a course in the database... DELETE Request to https://group-5-final-project-backend.onrender.com/api/courses:id
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