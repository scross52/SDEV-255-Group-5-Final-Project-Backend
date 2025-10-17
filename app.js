// setup.. this is similar to when we use our default tags in html
const express = require('express')
//we have to use cors in order to host a front end and backend on the same device
var cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

const auth = require("./routes/auth")
const courses = require("./routes/courses")
const student = require("./routes/student")

app.use("/api", auth)
app.use("/api/courses", courses)
app.use("/api", student)

app.listen(3000)
