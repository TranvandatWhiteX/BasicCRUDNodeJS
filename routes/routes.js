const express = require('express')
const router = express.Router()
const multer = require('multer')
const User = require('../models/users')
//Image Upload
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "./uploads")
    },
    filename: function(req, file,cb) {
        cb(null, file.fieldname+"_"+Date.now()+"_"+file.originalname)
    }
})
var upload = multer({
    storage: storage
}).single("image")

//Add user
router.post('/add-user', upload, (req, res) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: req.file.filename
    })
    user.save().then(() => {
        req.session.message = {
            type: 'success',
            message: 'User added successfully!'
        }
        res.redirect('/')
    }).catch((err) => {res.json({message: err.message, type: 'danger'})})
}) 

router.get('/', (req, res) => {
    User.find().exec().then(
        (users) => {
            res.render('index', {
                title: "Home Page",
                users: users
            })
        }
    ).catch((err) => {
        res.json({message: err.message})
    })
})

router.get('/add-user', (req, res) => {
    res.render("./layout/add_users", {title: "Add Users"})
})

module.exports = router