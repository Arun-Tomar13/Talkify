import ApiError from "../lib/apiError.js";
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

const sendFriendRequest = async (req, res) => {
  try {
    const myId = req.user.id;
    const { id: recipientId } = req.params;

    if (myId === recipientId) {
      return res.status(400).json({ message: "You cannot send friend request to yourself" });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "No user found" });
    }

    if (recipient.friends.includes(myId)) {
      return res.status(400).json({ message: "You are already friends with this user" });
    }

    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: myId, recipient: recipientId },
        { sender: recipientId, recipient: myId },
      ],
    });

    if (existingRequest) {
      return res.status(400).json({ message: "A friend request already exists between you and this user" });
    }

    const friendRequest = await FriendRequest.create({
      sender: myId,
      recipient: recipientId,
    });

    return res.status(201).json(friendRequest);
  } catch (error) {
    console.error("Error in sendFriendRequest controller", error);
    // preserve proper status if ApiError was thrown
    return res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Internal server error" });
  }
};


const acceptFriendRequest = async (req,res) =>{
    try {
        const {id:requestId} = req.params;

        const friendRequest = await FriendRequest.findById(requestId);

         if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

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
        return res.status(500).json({ message: "internal Server error" });
    }
}

const searchFriend = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(404).json({ message: "email not found" });
    }
    const user = await User.findOne({ email }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};


export {
    getRecomendedUsers,
    getMyFriends,
    sendFriendRequest,
    acceptFriendRequest,
    getFriendRequests,
    getOutingFriendReqs,
    searchFriend
}