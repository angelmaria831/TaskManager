const db = require('../config/mongo')

module.exports ={

    doSignUp:(reqDTO)=>{
        return new Promise(async(resolve,reject)=>{

            let employeeData = {
               
                "empId":reqDTO.empId,
                "name":reqDTO.name,
                "role":reqDTO.inlineRadioOptions,
                "password":reqDTO.password
            }
          
            let sql = "INSERT INTO employeeDetails SET?";
            let success =false
             db.get().query(sql,employeeData,(err,result)=>{
                if(err)throw err;
                else success =true;

                console.log({result})
                resolve(success)
            })

           
        })
    },

    // doLogin:(reqDTO)=>{

    //     return new Promise((resolve,reject)=>{

    //         let sql = 'select * from employeedetails where empId=? and password=?'
    //         let values =[reqDTO.empId,reqDTO.password]
    //         db.get().query(sql,values,(err,results,fields)=>{
    //             if(err)throw err;
    //             console.log({results})
    //             if(results.length>0){
    //                 console.log("Login successful")
    //                 delete results[0].password;
    //                 if(results[0].role=="manager")results[0].admin=true
    //                 else results[0].admin=false
    //                 resolve({user:results[0],status:true})
    //             }else{
    //                 console.log("Invalid empId or password");
    //                 resolve({status:false})
    //             }
               
    //         })
    //     })

    // },

     doLogin:(reqDTO)=>{

       return new Promise(async(resolve,reject)=>{
           
            let user = await db.get().collection('users').findOne({userId:reqDTO.empId})
            console.log({user});
            if(user){//found user               
               
                delete user._id;
                                
                resolve({user:user,status:true})
                //match user password
                // bcrypt.compare(reqDTO.password,user.password).then((status)=>{
                //     if(status){
                //         console.log("Login successful");
                //         resolve({user:user,status:true})
                //     }else{
                //         console.log("Password Mismatch");
                //         resolve({status:false})
                //     }

                // })

            }else{
                //user not found
                console.log("No user Found");
                resolve({status:false})
            }
       })
    },

    getUsersList:(user)=>{

        if(user.isSuperAdmin){
            db.get().collection('users').find({},{"userId":1,"userName":1,"_id":0}).toArray()
                .then((list)=>{
                    resolve(list);
                })
        }else if(user.isAdmin){//DGM
            db.get().collection('users').find({"reportsTo.userId":user.userId}).toArray()
            .then((list)=>{
                resolve(list);
            })
        }
    },

    addUser:(reqDTO,user)=>{
        return new Promise(async(resolve,reject)=>{

            let isAdmin=false;
            let isSuperAdmin =false;
            if(reqDTO.role == "GM")isAdmin = isSuperAdmin = true;
            else if(reqDTO.role == 'DGM')isAdmin =true;
            let query ={
                "userName":reqDTO.userName,
                "userId":reqDTO.userId,
                "role":reqDTO.role,
                "isAdmin":isAdmin,
                "isSuperAdmin":isSuperAdmin,
                "reportsTo":reqDTO.reportsTo
            }
            let success = false;
            if(user.isSuperAdmin){

             db.get().collection('users').insertOne(query,(err,result)=>{
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

    editUser:(reqDTO,user)=>{
        return new Promise(async(resolve,reject)=>{
            let query = {
                "userId":reqDTO.userId
            }
            let updateQuery={
                $set:{
                    "reportsTo":reqDTO.reportsTo
                }
            }

            let success = false;
            if(user.isSuperAdmin){

             db.get().collection('users').updateOne(query,updateQuery,(err,result)=>{
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

    deleteUser:(reqDTO,user)=>{
        return new Promise(async(resolve,reject)=>{

            let query = {
                "userId":reqDTO.userId
            }
            
            let success = false;
            if(user.isSuperAdmin){

             db.get().collection('users').deleteOne(query,(err,result)=>{
                    if(err) throw err;
                    else success = true;
                    console.log({ result });
                    resolve(success)
                })
            }else{
                resolve(success)
            }
        })
    }

}