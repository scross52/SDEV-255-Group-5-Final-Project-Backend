const db = require("../db")

const Course = db.model("Course", {
  //hidden property _id
  prefix: {type:String, required:true},
  name: {type:String, required:true},
  teacher: {type:String, required:true},
  classroom: {type:String, required:true},
  description: String,
  startDate: {type:Date, default:Date.now},
})

module.exports = Course