import { Router } from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { getRecomendedUsers, getMyFriends,sendFriendRequest, acceptFriendRequest, 
         getFriendRequests, getOutingFriendReqs,searchFriend } from "../controllers/user.controller.js";

const router = Router();

// apply route middleware to all routes
router.use(protectRoute)    

router.get("/",getRecomendedUsers);
router.get("/friends",getMyFriends);

router.post("/friend-request/:id",sendFriendRequest);
router.put("/friend-request/:id/accept",acceptFriendRequest);

router.get("/friend-requests", getFriendRequests);
router.get("/outgoing-friend-requests",getOutingFriendReqs)
router.post("/search-user",searchFriend)

export default router;