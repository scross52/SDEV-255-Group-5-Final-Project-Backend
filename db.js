const mongoose = require('mongoose')
mongoose.connect("mongodb+srv://sdev255:Sd3v255@songdb.aexoxhc.mongodb.net/final?retryWrites=true&w=majority&appName=SongDB", {useNewUrlParser: true})

module.exports = mongoose