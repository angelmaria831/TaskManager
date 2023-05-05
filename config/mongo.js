const {MongoClient} = require('mongodb')
const state = {
    db:null
}

module.exports.connect = async()=>{

    const url = 'mongodb://localhost:27017';
    const dbname = 'TaskManager'
 
    const client = new MongoClient(url);

    await client.connect()
    console.log("connected successfully");

    state.db = client.db(dbname)

    return 'done'
  
}

module.exports.get = ()=>{
    return state.db
}