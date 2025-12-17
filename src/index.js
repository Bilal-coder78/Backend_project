// this is second and best approach to connect mongodb

import connectDb from "./db/index.js";
import dotenv from "dotenv";

dotenv.config({
    path: "./env"
});


connectDb()
.then(()=>{
    app.on("error",(error)=>{
        console.error("Error in express app",error)
    })
    
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running at port : ${process.env.PORT}`)
    })
})
.catch((error)=>{
    console.log("MONGO DB connection failed !!!",error)
})



// first approach to connect mongodb

// import mongoose from "mongoose";
// import { DB_NAME } from "./constants.js";
// import express from "express";
// const app = express();

// (async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URL}/${process.env.DB_NAME}`) 
//     console.log("Connected to MongoDB");
//     app.on("error", (error) => {
//       console.error("Error in Express app:", error);
//     });
//     app.listen(process.env.PORT, () => {
//       console.log(`Server is running on port ${process.env.PORT}`);
//     });
//   } catch (error) {
//     console.error("Error connecting to MongoDB:", error);
//   }
// })();