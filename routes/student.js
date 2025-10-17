const express = require('express')
const router = express.Router()
const jwt = require('jwt-simple')

const Course = require("../models/courses")
const User = require("../models/profiles")
const { secret } = require("../config/secrets")

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


//ALLOW only students to ADD courses to schedule
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


//ALLOW students to remove a course from their schedule
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

module.exports = router;