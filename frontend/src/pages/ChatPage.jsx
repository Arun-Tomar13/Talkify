import { useEffect, useState } from "react";
import { useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery,useQueryClient } from "@tanstack/react-query";
import { getStreamToken,getUserFriends } from "../lib/api.js";
import { Link } from "react-router";
import { getLanguageFlag } from "../components/FriendCard.jsx";
import { useLocation } from "react-router";
import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";

import ChatLoader from "../components/ChatLoader";
import CallButton from "../components/CallButton";
import { ArrowRight } from "lucide-react";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatPage = () => {
  const { id: targetUserId } = useParams();

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);

  const { authUser } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser, // this will run only when authUser is available
  });

  const { data: friends = [], isLoading: loadingFriends } = useQuery({
      queryKey: ["friends"],
      queryFn: getUserFriends,
    });

  const location = useLocation();
  const currentPath = location.pathname.slice(6);
  
  

  useEffect(() => {
    const initChat = async () => {
      if (!tokenData?.token || !authUser) return;

      try {
        console.log("Initializing stream chat client...");

        const client = StreamChat.getInstance(STREAM_API_KEY);

        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        );

        //
        const channelId = [authUser._id, targetUserId].sort().join("-");

        // you and me
        // if i start the chat => channelId: [myId, yourId]
        // if you start the chat => channelId: [yourId, myId]  => [myId,yourId]

        const currChannel = client.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        });

        await currChannel.watch();

        setChatClient(client);
        setChannel(currChannel);
      } catch (error) {
        console.error("Error initializing chat:", error);
        toast.error("Could not connect to chat. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, [tokenData, authUser, targetUserId]);

  const handleVideoCall = () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;

      channel.sendMessage({
        text: `I've started a video call. Join me here: ${callUrl}`,
      });

      toast.success("Video call link sent successfully!");
    }
  };

  if (loading || !chatClient || !channel) return <ChatLoader />;

  return (
    <div className="h-[91vh] flex">
      <Chat client={chatClient}>
        <Channel channel={channel}>

          {/* Sidebar for friends */}
          <div className="w-2/6 gap-0.5 bg-transparent/20 overflow-y-auto flex flex-col justify-start align-middle flex-wrap">
            <h1 className="m-3 pl-7 text-xl">Friends</h1>
            {friends.map((friends)=>(
              <Link to={`/chat/${friends._id}`} key={friends._id} className={` flex flex-col gap-1 py-0.5 rounded-xl cursor-pointer  ${currentPath==friends._id ? "bg-gradient-to-br from-primary/40 to-secondary/40" : "bg-gradient-to-br from-primary/70 to-secondary/70"} `}>
                <div className=" flex gap-5 mt-0.5 lg:mx-10 flex-wrap">
                  <img src={friends.profilePic} alt="" className="w-7"/>
                  <p className="font-medium">{friends.fullName}</p>
                </div>
                <div className="flex flex-wrap gap-1.5 pl-7">
                  <span className="badge badge-primary text-xs">
                    {getLanguageFlag(friends.nativeLang)}
                     {friends.nativeLang}
                  </span>
                  <ArrowRight/>
                  <span className="badge badge-secondary text-xs">
                    {getLanguageFlag(friends.learningLang)}
                    {friends.learningLang}
                  </span>
        </div>
                <div>

                </div>
                
              </Link>
            ))}
          </div>

          {/* chats */}
          <div className="w-full relative">
            <CallButton handleVideoCall={handleVideoCall} />
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageInput focus />
            </Window>
          </div>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
};
export default ChatPage;