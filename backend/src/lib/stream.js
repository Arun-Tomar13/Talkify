import {StreamChat} from "stream-chat";
import "dotenv/config";

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if(!apiKey || !apiSecret){
    console.error("Stream API key and secret are required");
}

const streamClient = StreamChat.getInstance(apiKey,apiSecret);

export const upsertUser = async(userdata)=>{
    try {
        await streamClient.upsertUsers([userdata]);
        return userdata;
    } catch (error) {
        console.error("Error in upserting user to stream",error);
    }
}

export const generateStreamToken = (userId)=>{
    try {
        const userIdstr = userId.toString();
        return streamClient.createToken(userIdstr);
    } catch (error) {
        console.error("Error in generating stream token",error);
        res.status(500).json({message:"could not generate stream token"});
    }
}