const express = require('express')
const router = express.Router()
const multer = require('multer')
const User = require('../models/users')
const fs = require('fs')
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
// Edit user route
router.get('/edit-user/:id', (req, res)=> {
    let id = req.params.id
    User.findById(id).exec().then((user)=> {
        res.render("./layout/edit_users", {
            title: "Edit User",
            user: user
        })
    }).catch((err) => {
        res.redirect("/")
    })
})
// Update user route
router.post("/update-user/:id", upload, (req, res) => {
    let id = req.params.id 
    let new_image = ""
    if (req.file) {
        new_image = req.file.fieldname
        try {
            fs.unlinkSync('./uploads/'+req.body.old_image)
        } catch (error) {
            console.log(error)
        }
    } else {
        new_image = req.body.old_image
    }
    User.findByIdAndUpdate(id, {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: new_image
    }).exec().then(() => {
        req.session.message = {
            type: "success",
            message: "User updated successfully!"
        }
        res.redirect('/')
    }).catch((err)=> {res.json({
        type: "danger",
        message: err.message
    })})
})
//Delete user route
router.get('/delete-user/:id', (req,res) => {
    let id = req.params.id
    User.findOneAndDelete(id).exec().then(
        (result) => {
            if (result.image != "") {
                try {
                    fs.unlinkSync('./uploads/'+ result.image)
                } catch (error) {
                    console.log(error)
                }
            }
            req.session.message = {
                type: "info",
                message: "User deleted successfully!" 
            }
            res.redirect('/')
        }
    ).catch((err)=> {res.json({
        type: "danger",
        message: err.message
    })})
})
module.exports = router