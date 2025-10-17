const db = require("../config/db")

const User = db.model("User", {
  //hidden property _id
  username: {type:String, required:true, unique:true},
  password: {type:String, required:true},
  role: {type:String, enum: ['student', 'teacher'], required:true},
  //create a relation between users and courses as an array. Only students use this property
  enrolledCourses: [{type:db.Schema.Types.ObjectId, ref: 'Course'}]
})

module.exports = User;