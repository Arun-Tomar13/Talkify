import { useQuery } from "@tanstack/react-query";
import {getUserFriends } from "../lib/api.js";

export const capitialize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

export const friendId = ()=>{
    const { data: friends = [], isLoading: loadingFriends } = useQuery({
      queryKey: ["friends"],
      queryFn: getUserFriends,
    });
    console.log(friends[0]._id)
    
    return friends[0]._id;
}