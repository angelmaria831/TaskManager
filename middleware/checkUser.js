const db = require('../config/mongo')

const express = require('express'),
router = express.Router();


// router.use((req,res,next)=>{
//     console.log("Inside middleware req")

//     let user  = req.session.user;
//     if(user!=undefined){

//     }
//     db.get().collection('users')

// })


// console.log("Inside middleware")
// module.exports = router;