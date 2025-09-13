import React from 'react'

import { useQuery } from "@tanstack/react-query";
import {getUserFriends } from "../lib/api.js";
import { Link } from 'react-router';
import { getLanguageFlag } from '../components/FriendCard.jsx';
import {ArrowRight} from "lucide-react"

function Friends() {

    const { data: friends = [], isLoading: loadingFriends } = useQuery({
      queryKey: ["friends"],
      queryFn: getUserFriends,
    });

  return (
          <div className="w-2/6 bg-primary overflow-y-auto flex flex-col justify-start align-middle">
            <h1 className="m-3 pl-7 text-xl">Friends</h1>
            {friends.map((friends)=>(
              <Link to={`/chat/${friends._id}`} key={friends._id} className=" flex flex-col gap-1 p-2 border-b cursor-pointer bg-secondary">
                <div className=" flex gap-5">
                  <img src={friends.profilePic} alt="" className="w-7"/>
                  <p className="font-medium">{friends.fullName}</p>
                </div>
                <div className=" flex justify-start align-middle">
                  <span className="badge badge-secondary text-xs">
                      {getLanguageFlag(friends.nativeLang)}
                      {friends.nativeLang}
                  </span>
                  <ArrowRight className="text-xs" />
                  <span className="badge badge-secondary text-xs">
                      {getLanguageFlag(friends.learningLang)}
                      {friends.learningLang}
                  </span>
                </div>
              </Link>
            ))}
          </div>

  )
}

export default Friends