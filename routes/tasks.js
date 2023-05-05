var express = require('express');
var router = express.Router();
const taskServices = require('../services/taskServices')
const employeeServices = require('../services/employeeServices')

/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.render('respond with a resource');
// });

router.get('/add-task',async(req,res,next)=>{
  let user = req.session.user
  let isLoggedIn = false;

  let isAdmin = false;
  let isSuperAdmin = false;

  let users =[]
  if(user!=undefined){
    isLoggedIn =true
    isSuperAdmin = user.isSuperAdmin;
    isAdmin = user.isAdmin;
  }
  await employeeServices.getUsersList(user).then((userList)=>{
    users = userList
  })
  console.log("Inside Home",user)
  console.log("Inside add task")
  res.render('admin/add-tasks',{isLoggedIn,isAdmin,isSuperAdmin,user,users})
})

router.post('/add-task',(req,res,next)=>{
  console.log(req.body)
  let user = req.session.user

  taskServices.addNewTask(req.body,user).then((data)=>{
    if(data){
      console.log("Added New Task")
      res.redirect('/home')
    }else{
      res.redirect('/add-task')
    }
  })

})

module.exports = router;
