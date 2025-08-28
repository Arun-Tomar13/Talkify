import FriendRequest from "../models/friendRequest.model.js";
import User from "../models/user.model.js";

const getRecomendedUsers = async (req,res) =>{
    try {
        const currentUserid = req.user.id;
        const currentUser = req.user;
    
        const recommendedUsers = await User.find({
            $and:[
                {_id:{ $ne: currentUserid}},
                {_id: {$nin:currentUser.friends}},
                {isOnborded:true}
            ]
        })
        res.status(200).json(recommendedUsers);
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Internal server error"});
    }
}

const getMyFriends = async (req,res) =>{

    try {
        const currentUserId = req.user.id;

        const user = await User.findById(currentUserId).select("friends").populate("friends","fullName profilePic nativeLang learningLang");

        res.status(200).json(user.friends);
    } catch (error) {
        console.error("Error in getMyFriends controller",error.message);
        res.status(500).json({message:"Internal server error"});
    }
}

const sendFriendRequest = async (req,res)=>{
    try {
        const myId = req.user.id;
        const {id:recipientId} = req.params;

        if(myId === recipientId){
            throw new Error(400,"You cannot send friend request to yourself");
        }

        const recipient = await User.findById(recipientId);
        if(!recipient){
            throw new Error(404,"No user found");
        }

        // check if user already friends
        if(recipient.friends.includes(myId)){
            throw new Error(400,"You are already friends with this user");
        }
        // check if user already friends request is sent

        const existingRequest = await FriendRequest.findOne({
            $or:[
                {sender:myId,recipient:recipientId},
                {sender:recipientId,recipient:myId}
            ]
        });

        if(existingRequest){
            throw new Error(400,"A friend request already exists between you and this user");
        }

        const friendRequest = await FriendRequest.create({
            sender:myId,
            recipient:recipientId
        });

        res.status(201).json(friendRequest);

    } catch (error) {
        console.error("Error in sendFriendRequest controller",error.message);
        throw new Error(500,"Internal server error");
    }
}

const acceptFriendRequest = async (req,res) =>{
    try {
        const {id:requestId} = req.params;

        const friendRequest = await FriendRequest.findById(requestId);

        if(friendRequest.recipient.toString() !== req.user.id){
            throw new Error(403,"You are not authorized to accept this friend request");
        }

        friendRequest.status = "accepted";
        await friendRequest.save();

        //add each other to friends list
        await User.findByIdAndUpdate(
            friendRequest.sender,
            {$addToSet:{friends:friendRequest.recipient}}
        );

        await User.findByIdAndUpdate(
            friendRequest.recipient,
            {$addToSet:{friends:friendRequest.sender}}
        );

        res.status(200).json({message:"Friend request accepted"});

    } catch (error) {
        console.error("Error in acceptFriendRequest controller",error.message);
        throw new Error(500,"Internal server error");
    }
}

const getFriendRequests = async (req,res)=>{
    try {
        const incomingReqs = await FriendRequest.find({
            recipient:req.user.id,
            status:"pending"
        }).populate("sender","fullName profilePic nativeLang learningLang");

        const acceptedReqs = await FriendRequest.find({
            sender:req.user.id,
            status:"accepted"
        }).populate("recipient","fullName profilePic");

        res.status(200).json({incomingReqs,acceptedReqs});
    } catch (error) {
        console.error("Error in getFriendRequests controller",error.message);
        throw new Error(500,"Internal server error");
    }
}

const getOutingFriendReqs = async(req,res)=>{
    try {
        const outgoingRequests = await FriendRequest.find({
            sender:req.user.id,
            status:"pending"
        }).populate("recipient","fullName profilePic nativeLang learningLang");

        res.status(200).json(outgoingRequests);
    } catch (error) {
        console.error("Error in getOutgoingFriendReqs controller",error.message);
        throw new Error(500,"Internal server error");
    }
}

export {
    getRecomendedUsers,
    getMyFriends,
    sendFriendRequest,
    acceptFriendRequest,
    getFriendRequests,
    getOutingFriendReqs
}