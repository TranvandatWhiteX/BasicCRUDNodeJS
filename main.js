require('dotenv').config
const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session')

const app = express()
const PORT = process.env.PORT ?? 8088


//Middleware
app.use(express.urlencoded({extended:false}))
app.use(express.json())
app.use(session({
    secret: 'My secret key',
    saveUninitialized: true,
    resave: false
}))
app.use((req, res, next) => {
    res.locals.message = req.session.message
    delete req.session.message
    next()
})
app.use(express.static('uploads'))
//Route prefix
app.use("", require('./routes/routes'))
// Set template engine
app.set('view engine', 'ejs')
//database connection
const mongoDBUrl = 'mongodb://localhost:27017/basic_crud_nodejs';
mongoose.connect(mongoDBUrl);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function() {
  console.log('Connected to MongoDB');
});


//Server
app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`)
})