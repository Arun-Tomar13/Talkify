import React, { useState, useEffect } from "react";
import {
  MapPinIcon,
  Search,
  CheckCircleIcon,
  UserPlusIcon,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  searchUser,
  getOutgoingFriendReqs,
  sendFriendRequest,
  getAuthUser, // ✅ make sure you have this API in your backend
} from "../lib/api.js";
import { getLanguageFlag } from "../components/FriendCard.jsx";
import { capitialize } from "../lib/utils.js";

function SearchUser() {
  const [email, setEmail] = useState("");
  const [friend, setFriend] = useState(null);
  const [requestStatus, setRequestStatus] = useState(null); // "sent" | "exists" | "friends" | null

  const queryClient = useQueryClient();

  // ✅ get logged-in user
  const { data: authUser } = useQuery({
    queryKey: ["authUser"],
    queryFn: getAuthUser,
  });

  // fetch outgoing friend requests
  const { data: outgoingFriendReqs = [] } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
  });

  // mutation for sending friend request
  const { mutate: sendRequestMutation, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] });
      setRequestStatus("sent");
    },
    onError: (error) => {
      const msg = error.response?.data?.message || "";
      if (msg.includes("already friends")) {
        setRequestStatus("friends");
      } else if (msg.includes("already exists")) {
        setRequestStatus("exists");
      } else {
        setRequestStatus(null);
      }
    },
  });

  // mutation for searching user
  const {
    mutate: searchMutation,
    isLoading,
    isError,
    error,
  } = useMutation({
    mutationFn: searchUser,
    onSuccess: (data) => {
      setFriend(data);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setRequestStatus(null); // reset status on new search
      searchMutation(email);
      console.log(authUser);
      console.log(friend);
    }
  };

  // keep requestStatus in sync with outgoing requests
  useEffect(() => {
    if (friend && outgoingFriendReqs.length > 0) {
      const alreadyRequested = outgoingFriendReqs.some(
        (req) => req.recipient._id === friend._id
      );
      if (alreadyRequested) {
        setRequestStatus("exists");
      }
    }
  }, [friend, outgoingFriendReqs]);

  return (
    <div className="w-full flex flex-col gap-5 justify-center items-center">
      <div className="text-center mt-[2%]">
        <h1 className="text-3xl font-extrabold text-secondary">Add Friend</h1>
        <h1 className="text-lg font-extrabold text-secondary/70">
          by Simply Searching the User
        </h1>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-3 flex-wrap m-auto p-4 mt-10 rounded-xl"
      >
        <label className="label w-fit">
          <span className="label-text text-primary font-bold">Email : </span>
        </label>

        <input
          type="email"
          placeholder="arun@example.com"
          className="input input-bordered border-primary w-72"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button
          type="submit"
          className="btn btn-primary font-bold"
          disabled={isLoading}
        >
          <Search className="mr-1" />
          {isLoading ? "Searching..." : "Search"}
        </button>
      </form>

      {/* Search Results */}
      <div className="mt-4">
        {isError && (
          <p className="text-red-500">
            {error.response?.data?.message || error.message}
          </p>
        )}

        {friend && (
          <div className="card bg-base-200 hover:shadow-lg transition-all duration-300">
            <div className="card-body p-5 space-y-2">
              <div className="flex items-center gap-3">
                <div className="avatar size-16 rounded-full">
                  <img src={friend.profilePic} alt={friend.fullName} />
                </div>

                <div>
                  <h3 className="font-semibold text-lg">{friend.fullName}</h3>
                  {friend.location && (
                    <div className="flex items-center text-xs opacity-70 mt-1">
                      <MapPinIcon className="size-3 mr-1" />
                      {friend.location}
                    </div>
                  )}
                </div>
              </div>

              {/* Languages with flags */}
              <div className="flex flex-wrap gap-1.5">
                <span className="badge badge-secondary">
                  {getLanguageFlag(friend.nativeLanguage)}
                  Native: {capitialize(friend.nativeLang)}
                </span>
                <span className="badge badge-outline">
                  {getLanguageFlag(friend.learningLanguage)}
                  Learning: {capitialize(friend.learningLang)}
                </span>
              </div>

              {friend.bio && <p className="text-sm opacity-70">{friend.bio}</p>}

              {/* ✅ Action button */}
              {authUser?._id == friend._id ? (
                <button className="btn w-full mt-2 btn-disabled">
                  This is your ID
                </button>
              ) : (
                <button
                  className={`btn w-full mt-2 ${
                    requestStatus ? "btn-disabled" : "btn-primary"
                  }`}
                  onClick={() => sendRequestMutation(friend._id)}
                  disabled={isPending || requestStatus !== null}
                >
                  {requestStatus === "sent" && (
                    <>
                      <CheckCircleIcon className="size-4 mr-2" />
                      Request Sent
                    </>
                  )}
                  {requestStatus === "exists" && (
                    <>
                      <CheckCircleIcon className="size-4 mr-2" />
                      Already Requested
                    </>
                  )}
                  {requestStatus === "friends" && (
                    <>
                      <CheckCircleIcon className="size-4 mr-2" />
                      Already Friends
                    </>
                  )}
                  {requestStatus === null && (
                    <>
                      <UserPlusIcon className="size-4 mr-2" />
                      Send Friend Request
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchUser;
