import mongoose from "mongoose";

export const mongoDB = async () =>{
  try {
     const mongodbInstance =  await mongoose.connect(process.env.MONGO_URI);
     console.log("mongoDB connected : ",mongodbInstance.connection.host);
  } catch (error) {
        console.log("Error while connecting MongoDB: ",error);
        process.exit(1);
  }
   
}