const mongoclient=require("mongodb").MongoClient;
const db_state={
    db:null
};

module.exports.connect=(done)=>{
    const url="mongodb://localhost:27017";
    const dataB="Books";

    mongoclient.connect(url,{ useUnifiedTopology: true}, (err,data)=>{
        if(err) return done(err);
        db_state.db=data.db(dataB);
        done();
    })
};
module.exports.get = () => {
    return db_state.db;
  };
