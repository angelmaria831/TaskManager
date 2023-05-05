const { resolve } = require('bluebird');
const db = require('../config/mongo');
const { ObjectId } = require('mongodb');
const {uuidEmit}=require('uuid-timestamp');
module.exports = {

    addNewTask: (reqDTO, user) => {
        return new Promise(async(resolve, reject) => {
            let taskDetails = {
                
                "header": reqDTO.Name,
                "description": reqDTO.Description,
                "createdOn": new Date(),
                "creator" : {
                    "userName" : user.userName,
                    "userId" : user.userId,
                    "role" : user.role
                },
                "EDC":reqDTO.EDC,
                "assignedTo": reqDTO.assignedTo,
                "status": "Open",
                "comments": [],
                "progress":[]
            }

            // "assignedTo": {
            //     "userId" : "aneesh@gmail.com",
            //     "userName" : "Aneesh MP"
            // },

          
            let success = false;

            await db.get().collection('tasks').insertOne(taskDetails,(err,result)=>{
                if(err) throw err;
                else success = true;
                console.log({ result });
                resolve(success)
            })

           
            console.log(taskDetails)
        })

    },

    editTask:(reqDTO,user)=>{
        return new Promise(async(resolve, reject) => {

            let query = {
                "_id":ObjectId(reqDTO._id)
            };
            let updateVal ={}
            let success = false;

            if(user.isSuperAdmin || user.isAdmin){
                updateVal = {
                    $set:{
                        "header":reqDTO.header,
                        "description":reqDTO.description,
                        "EDC":reqDTO.EDC,
                        "assignedTo":reqDTO.assignedTo,
                        "status":reqDTO.status,
                        
                    }
                }
            }else{//Engg
                updateVal = {
                    $set:{
                       
                        "status":reqDTO.status
                        
                    }
                }

            }

            db.get().collection('tasks').updateOne(query,updateVal,(err,result)=>{
                if(err) throw err;
                else success = true;
                console.log({ result });
                resolve(success)
            })
            
        })
    },
    deleteTask:(reqDTO,user)=>{
        return new Promise((resolve,reject)=>{
            let query = {
                "_id":ObjectId(reqDTO._id)
            }
            let success = false;
            if(user.isSuperAdmin || user.isAdmin){
    
                db.get().collection('tasks').deleteOne(query,(err,result)=>{
                    if(err) throw err;
                    else success = true;
                    console.log({ result });
                    resolve(success)
                })
            }else{
                resolve(success)
            }
        })
       
    },

    addProgress:(reqDTO,user)=>{
        return new Promise((resolve,reject)=>{
            let query = {
                "_id":ObjectId(reqDTO._id)
            }

            let updateQuery ={
                $addToSet:{
                    "progress":{
                        "action":reqDTO.action,
                        "actionId":uuidEmit(),
                        "timeStamp":new Date(),
                       
                            "userId":user.userId,
                            "userName":user.userName,
                            "status":reqDTO.status,
                            "comments":[]
                       
                    }
                }
            }

            let success = false;
              
                db.get().collection('tasks').updateOne(query,updateQuery,(err,result)=>{
                    if(err) throw err;
                    else success = true;
                    console.log({ result });
                    resolve(success)
                })
           


        })
    },

    editProgress:(reqDTO,user)=>{
        return new Promise((resolve,reject)=>{
            let query = {
                "_id":ObjectId(reqDTO._id)
            };
        })
    },
    addComment:(reqDTO,user)=>{
        return new Promise((resolve,reject)=>{
            let query = {
                "_id":ObjectId(reqDTO._id)
            }

            let updateQuery ={
                $addToSet:{
                    "comments":{
                        "comment":reqDTO.comment,
                        "commentId":uuidEmit(),
                        "timeStamp":new Date(),
                       
                            "userId":user.userId,
                            "userName":user.userName
                       
                    }
                }
            }

            
            //comment :{
            //     "comment":"test comment",
            //      "commentId":"",
            //     "timeStamp":"",
            //     "commentedBy":{
            //         "userId":"@gmail.com",
            //         "userName":""
            //     }
            // }
            let success = false;
            if(user.isSuperAdmin || user.isAdmin){
    
                db.get().collection('tasks').updateOne(query,updateQuery,(err,result)=>{
                    if(err) throw err;
                    else success = true;
                    console.log({ result });
                    resolve(success)
                })
            }else{
                resolve(success)
            }
        })
    },

    editComment:(reqDTO,user)=>{
        return new Promise((resolve,reject)=>{
            let query = {
                "_id":ObjectId(reqDTO._id),
                "comments.commenId":reqDTO.commentId

            }
            let updateQuery={
                $set:{
                    "comments.$.comment":reqDTO.comment
                }
            }
            let success = false;
            if(user.isSuperAdmin || user.isAdmin){
    
                db.get().collection('tasks').updateOne(query,updateQuery,(err,result)=>{
                    if(err) throw err;
                    else success = true;
                    console.log({ result });
                    resolve(success)
                })
            }else{
                resolve(success)
            }
        })
    },
    deleteComment:(reqDTO,user)=>{
        return new Promise((resolve,reject)=>{
            let query = {
                "_id":ObjectId(reqDTO._id)
              

            }
            let updateQuery={
                $pull:{
                    "comments":{
                        "userId":user.userId,
                        "commentId":reqDTO.commentId
                    }
                }
            }
            let success = false;
            if(user.isSuperAdmin || user.isAdmin){
    
                db.get().collection('tasks').updateOne(query,updateQuery,(err,result)=>{
                    if(err) throw err;
                    else success = true;
                    console.log({ result });
                    resolve(success)
                })
            }else{
                resolve(success)
            }
        })
    },
    getTaskByEmpId: (user) => {

        return new Promise((resolve, reject) => {
            let sql = "Select * from tasks  where createdBy=?";
            let values = [user.empId]
            db.get().query(sql, values, (err, result, fields) => {
                if (err) throw err;

                console.log(result)
                resolve(result)
            })
        })

    },

    getTasks: (user) => {
        return new Promise(async (resolve, reject) => {
            //check user role - admin/
            let users = [];

            if (user.isSuperAdmin) {
                db.get().collection('tasks').find({}).toArray()
                .then((list)=>{
                    resolve(list);
                })
            } else {
                if (user.isAdmin) {
                    users = await db.get().collection("users").distinct("userId", { "reportsTo.userId": user.userId })
                }
                users.push(user.userId);

                db.get().collection('tasks').aggregate([

                    { $match: { "assignedTo.userId": { $in: users } } }

                ]).toArray().then((list) => {
                    resolve(list)
                })
            }
        })

    },

    getTasksOfUser:(reqDTO,user)=>{
        return new Promise(async (resolve, reject) => {

        })
    }

}