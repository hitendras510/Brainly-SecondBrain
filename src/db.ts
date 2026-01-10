const mongoose = require("mongoose");
mongoose.connect(
    process.env.MONGODB_URI
);
mongoose.connection.on("error",(err: any)=>{
    console.log(err);
});
mongoose.connection.on("open",()=>{
    console.log("Connected to MONGODB");
});

const Schema = mongoose.Schema;
const objectId = mongoose.Schema.Types.objectId;

