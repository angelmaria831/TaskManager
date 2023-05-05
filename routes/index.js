var express = require('express');
const employeeServices = require('../services/employeeServices');
var router = express.Router();
const empServices = require('../services/employeeServices');
const taskServices = require('../services/taskServices')

/* GET home page. */
router.get('/', function(req, res, next) {
  const index = true
  
  res.render('index', { index:true});
});



router.get('/signUp',(req,res,next)=>{
  
  res.render('sign-up', { index:true})
})

router.post('/signUp',(req,res,next)=>{
  console.log("Inside signup api")
  console.log(req.body)
  empServices.doSignUp(req.body).then((data)=>{
    console.log("Completed")
    if(data){
      console.log("Completed login")
      res.redirect('/')
    }else{
      console.log("Completed signup")
      res.redirect('/signUp')
    }
  })
})

router.post('/login',(req,res,next)=>{
  console.log(req.body)
  employeeServices.doLogin(req.body).then((data)=>{
    if(data.status){
      req.session.loggedIn = true;
      req.session.user = data.user;
      res.redirect('/home')
    }else{
      res.redirect('/')
    }
  })
})

router.get('/home',async(req,res,next)=>{

  //admin - all tasks, dgm - children, engg - assigned
  let user = req.session.user
  let isLoggedIn = false;
  let tasks =[]
  let isAdmin = false;
  let isSuperAdmin = false;
  if(user!=undefined){
    isLoggedIn =true;
    isSuperAdmin = user.isSuperAdmin;
    isAdmin = user.isAdmin;
    
    console.log("Inside Home",user)
  await taskServices.getTasks(user).then((tasksDetails)=>{
    console.log("tasks",tasksDetails)
    tasks=tasksDetails;
    
  })
  }
  
  
  res.render('view-tasks',{isLoggedIn,isAdmin,isSuperAdmin,user,tasks})
})


module.exports = router;
