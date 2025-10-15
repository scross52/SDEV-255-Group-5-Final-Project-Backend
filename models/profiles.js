const db = require("../db")

const User = db.model("User", {
  //hidden property _id
  username: {type:String, required:true, unique:true},
  password: {type:String, required:true},
  role: {type:String, enum: ['student', 'teacher'], required:true}
})

module.exports = User;