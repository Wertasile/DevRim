import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import {
  CircleQuestionMark,
  FileIcon,
  Image,
  LayoutGrid,
  MessageSquare,
  Mic,
  MicOff,
  Paperclip,
  SendHorizonal,
  UserIcon,
  Users,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import ChatMenu from "~/components/ChatMenu";
import { useChat, useNotification, useUser } from "~/context/userContext";
import type { Chat, Message, User } from "~/types/types";
import io from "socket.io-client" // io is a function to call an individual socket
import { socket } from "../components/socket";
import GroupModal from "~/components/groupModal";

const API_URL = import.meta.env.VITE_API_URL;

var selectedChatCompare: any;

const ChatPage = () => {
  const { user, setUser } = useUser();
  const { chat, setChat } = useChat();
  const { notification, setNotification } = useNotification()

  const [attachment, setAttachment] = useState(false);
  const [menu, setMenu] = useState(false);
  const [chats, setChats] = useState<Chat[]>();
  const [messages, setMessages] = useState<Message[]>();
  const [newMessage, setNewMessage] = useState<string>("");

  const [audio, setAudio] = useState<File | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [mediaUrls, setMediaUrls] = useState<{ [key: string]: string }>({});
  const [file, setFile] = useState<File | null>(null);
  const [image, setImage] = useState<File | null>(null);

  const [socketConnected, setSocketConnected] = useState(false)

  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const [convoModal, setConvoModal] = useState(false)
  const [convoUser, setConvoUser] = useState("")

  const [groupModal, setGroupModal] = useState(false)
  const [groupName, setGroupName] = useState("")
  const [searchUser, setSearchUser] = useState<User[]>([]) // search results
  const [groupUsers, setGroupUsers] = useState<User[]>([]) // users selected by user

  // ---------- LOGIN / LOGOUT ----------

  const login = useGoogleLogin({
    onSuccess: async (code) => {
      await fetch(`${API_URL}/auth/google`, {
        method: "post",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code }),
      });
      await fetchUser();
    },
    onError: () => console.error("Connecting to Google Failed"),
    flow: "auth-code",
  });

  async function handleLogout() {
    try {
      await fetch(`${API_URL}/logout`, {
        method: "post",
        credentials: "include",
      });
    } catch (error) {
      console.warn("LOGOUT ERROR", error);
    }

    googleLogout();
    setUser(null);
    setMenu(!menu);
    alert("You've been logged out");
  }

  // ---------- USER / CHAT FETCH ----------

  const fetchUser = async () => {
    const res = await fetch(`${API_URL}/me`, {
      method: "get",
      credentials: "include",
    });
    if (!res.ok) return;

    const userData = await res.json();
    setUser(userData);
    fetchChats();
  };

  const fetchChats = async () => {
    const res = await fetch(`${API_URL}/chats/`, {
      method: "get",
      credentials: "include",
    });
    const chatData = await res.json();
    setChats(chatData);
    if (chatData) setChat(chatData[0]);
  };

  const fetchMessages = async (chatId: string) => {
    const res = await fetch(`${API_URL}/messages/${chatId}`, {
      method: "get",
      credentials: "include",
    });
    if (!res.ok) return;

    const messageData = await res.json();
    setMessages(messageData);
    socket.emit("join chat", chat?._id)
  };

  const sendMessage = async () => {
    socket.emit("stop typing", chat?._id)
    const res = await fetch(`${API_URL}/messages/`, {
      method: "post",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: newMessage,
        chatId: chat?._id,
        messageType: "text",
        url: "None"
      }),
    });

    if (!res.ok) return;
    const sentMessage = await res.json();
    socket.emit("new message", sentMessage)
    console.log("new message", sentMessage)
    setMessages((prev) => [...(prev ?? []), sentMessage]);
    setNewMessage("");
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (chat?._id) fetchMessages(chat._id);
    selectedChatCompare = chat
  }, [chat]);

  // ---------- AUDIO RECORDING ----------

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        mediaRecorderRef.current = new MediaRecorder(stream, {
          mimeType: "audio/webm",
        });
        setIsBlocked(false);
      })
      .catch(() => {
        console.log("PERMISSION DENIED FOR AUDIO");
        setIsBlocked(true);
      });
  }, []);

  const startRecording = () => {
    if (!mediaRecorderRef.current) return;
    chunksRef.current = [];
    mediaRecorderRef.current.start();
    setIsRecording(true);

    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;
    mediaRecorderRef.current.stop();
    setIsRecording(false);

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const file = new File([blob], `${Date.now()}.webm`, {
        type: "audio/webm",
      });
      setAudio(file);
      setAttachment(false);
    };
  };

  useEffect(() => {
    if (audio) uploadFile(audio, "audio");
  }, [audio]);

  // ---------- FILE UPLOADS ----------

  const uploadFile = async (file: File, type: "audio" | "image" | "file") => {
    try {
      // ask backend for presigned URL
      const res = await fetch(
        `${API_URL}/s3/presign-upload?filename=${encodeURIComponent(file.name)}&contentType=${encodeURIComponent(file.type)}`,{
                method: "get",
                credentials: "include" 
            }
      );
      const { uploadUrl, key } = await res.json();

      // upload directly to S3
      await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      // save in DB
      const message = await fetch(`${API_URL}/messages`, {
        method: "post",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: key,
          messageType: type,
          chatId: chat?._id,
          url: uploadUrl
        }),
      }).then((r) => r.json());

      socket.emit("new message", message)
      console.log("new message", message)

      setMessages((prev) => [...(prev ?? []), message]);
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    setImage(file);
    uploadFile(file, "image");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    setFile(file);
    uploadFile(file, "file");
  };

  // ---------- AUDIO FETCH ----------

  const fetchMediaUrls = async () => {
  if (!messages) return;

  const newUrls: { [key: string]: string } = {};

  for (const message of messages) {
    if (
      (message.messageType === "audio" ||
       message.messageType === "image" ||
       message.messageType === "file") &&
      !mediaUrls[message._id]
    ) {
      try {
        const res = await fetch(
          `${API_URL}/s3/presign-download?filename=${encodeURIComponent(
            message.content
          )}&type=${message.messageType}`,
          { method: "GET", credentials: "include" }
        );

        if (!res.ok) continue;
        const { downloadUrl } = await res.json();
        if (downloadUrl) newUrls[message._id] = downloadUrl;
      } catch (err) {
        console.error("Failed to fetch media URL", err);
      }
    }
  }

  if (Object.keys(newUrls).length > 0) {
    setMediaUrls((prev) => ({ ...prev, ...newUrls }));
  }
};

  useEffect(() => {
    fetchMediaUrls();
  }, [messages]);

  // ---------- RENDER MESSAGE ----------

  const renderMessageContent = (message: Message) => {
    const url = mediaUrls[message._id] || message.url; // presigned URL if available

    switch (message.messageType) {
      case "image":
        return <img src={url} width="200" alt="Message content" />;
      case "audio":
        return <audio controls src={url} style={{ maxWidth: "250px" }} />;
      case "file":
        return (
          <div className="file-download">
            <a href={url} download>
              {message.content}
            </a>
          </div>
        );
      default:
        return <div>{message.content}</div>;
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    };

    // Scroll immediately for text messages
    scrollToBottom();

    // After images/files load, scroll again
    const container = document.querySelector('.feed-container') as HTMLElement;
    if (!container) return;

    const imgs = container.querySelectorAll('img');
    let loadedCount = 0;

    if (imgs.length === 0) return;

    imgs.forEach((img) => {
      if (img.complete) loadedCount++;
      else
        img.addEventListener('load', () => {
          loadedCount++;
          if (loadedCount === imgs.length) scrollToBottom();
        });
    });

    if (loadedCount === imgs.length) scrollToBottom();
  }, [messages, mediaUrls]);

  // =========== ESTABLISHING SOCKET CONNECTION ==============================================================================================================================

  useEffect(() => {
    if (user){
      socket.emit("setup", user)  // send setup event to server, we also emit user data

      //socket listens to connected event declared in server.js, even runs everytime we connect to server
      socket.on("connected", () => {
        setSocketConnected(true)
      })

      // for typing checking
      socket.on("typing", () => setIsTyping(true))
      socket.on("stop typing", () => setIsTyping(false))

      // Cleanup to prevent duplicate listeners on re-render
      return () => {
        socket.off("connected");
        socket.off("typing");
        socket.off("stop typing");
      };
    }
  }, [])


  // 
  useEffect(() => {
    socket.on("message received", (newMessageReceived: any) => {
      if (!selectedChatCompare || selectedChatCompare._id !== newMessageReceived.chat._id){ // checking if a chat is selected (or) selected chat is the chat we got a new message for
        // GIVE NOTIFICATION
        if (!notification?.includes(newMessageReceived)){  // if notification array doesnt include the new messafe received
          // then we add the new message received to the notification array
          setNotification([newMessageReceived, ...notification])
          // setFetchAgain(!fetchAgain)
        } 
        
      } else {
        if (messages){
          setMessages([...messages, newMessageReceived])
        }

      }
    }) // monitors socket to see if we receive anything from this socket
    
  }) // we want to update this useEFFECT ON EVERY STATE UPDATE

  const typingHandler = (e: any) => {
    setNewMessage(e.target.value)

    // typing indicator logic

    //first check if socket is connected
    if (!socketConnected) return

    // if socket is connected then we check the typing
    if (!typing){
      setTyping(true)
      socket.emit("typing", chat?._id) // we are emitting this in the selectedchat id room
    }

    // debouncing, where to set typing not typing based on a timer
    let lastTypingTime = new Date().getTime()
    var timerLength = 3000
    setTimeout(() => {
      var timeNow = new Date().getTime()
      var timeDiff = timeNow - lastTypingTime

      if (timeDiff >= timerLength && typing){
        socket.emit("stop typing", chat?._id)  // we are emitting stop typing socket in the room of the selectedchat
        setTyping(false)
      }
    }, timerLength)
  };


// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  return (
    <>
    {groupModal && 
      <GroupModal groupName={groupName} setGroupName={setGroupName} groupUsers={groupUsers} setGroupUsers={setGroupUsers} searchUser={searchUser} setSearchUser={setSearchUser} setGroupModal={setGroupModal}/>
    }
    
    <div className="flex flex-row h-[100vh]">
      {/* SIDEBAR */}
      <div className="w-[80px] flex flex-col items-center h-full border-r border-[#979797] justify-between py-5">
        <div className="flex flex-col gap-5">
          <a href="/">
            <img src="/Images/DevRim_Logo_0.png" width={48} />
          </a>
          <MessageSquare className="w-[48px] text-[#979797]" />
          <UserIcon className="w-[48px] text-[#979797]" />
        </div>
        <div className="flex flex-col gap-5">
          <CircleQuestionMark className="w-[48px] text-[#979797]" />
          <LayoutGrid className="w-[48px] text-[#979797]" />
          <img src={user?.picture} width={48} className="rounded-3xl" />
        </div>
      </div>

      {/* CHAT MENU */}
      <div className="w-[400px] flex flex-col border-r border-[#979797]">
        <div className="h-[50px] border-b border-[#979797] flex items-center p-2 gap-3 ">
          <div className="bg-[#EEEEEE] hover:text-white hover:bg-black p-2 rounded-xl cursor-pointer w-full text-center">
            Find or Start a Conversation
          </div>
          <div className="flex bg-[#EEEEEE] hover:text-white hover:bg-black p-2 rounded-xl cursor-pointer" onClick={() => {setGroupModal(!groupModal)}}> + <Users/></div>
        </div>
        <div className="flex flex-col gap-5 p-5">
          {chats?.map((chat, index) => (
            <ChatMenu key={index} Chat={chat} />
          ))}
        </div>
      </div>

      {/* MESSAGES */}

      <div className="flex-grow flex flex-col justify-between h-[100vh] overflow-scroll feed-container">
        <h1 className="h-[50px] border-b border-[#979797] px-5 sticky top-0 backdrop-blur-md">
          {chat?.chatName === "sender"
            ? chat.users
                .filter((u) => u._id !== user?._id)
                .map((u) => <h2 key={u._id}>{u.name}</h2>)
            : chat?._id}
        </h1>

        <div className="flex flex-col gap-2 px-5 flex-grow justify-end">
          {messages?.map((message, index) => (
            <div
              key={index}
              className={`rounded-2xl flex flex-col gap-2 p-2 w-fit border border-[#979797] font-semibold ${
                message.sender._id === user?._id
                  ? "bg-green-100 self-end"
                  : "bg-[#9A9CD4] self-start"
              }`}
            >
              {renderMessageContent(message)}
              <i className="text-xs text-right font-light">
                {message.updatedAt.split("T")[1].slice(0, 5)}
              </i>
            </div>
            
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="h-[30px]">
          {isTyping ? (<div style={{fontSize: "20px"}}> ... </div>) : (<></>)}
        </div>

        {/* INPUT */}
        <div className="flex flex-row items-center gap-2 px-2 sticky bottom-0 backdrop-blur-md">
          {isRecording ? (
            <div className="flex justify-around">
              <div>VOICE IS BEING RECORDED</div>
              <div onClick={stopRecording}>
                <MicOff />
              </div>
            </div>
          ) : (
            <input
              placeholder="Send Message"
              className="mx-5 my-1 flex-grow"
              value={newMessage}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              onChange={(e) => setNewMessage(e.target.value)}
            />
          )}
          <SendHorizonal onClick={sendMessage} />
          <div className="relative">
            <Paperclip
              className="cursor-pointer"
              onClick={() => setAttachment(!attachment)}
            />
            {attachment && (
              <div className="bg-[#EEEEEE] p-3 flex flex-col rounded-xl shadow-md absolute gap-3 right-0 bottom-10 w-[200px]">
                <label className="flex gap-2 cursor-pointer">
                  <Image /> UPLOAD IMAGE
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
                <div
                  className="flex gap-2 cursor-pointer"
                  onClick={startRecording}
                >
                  <Mic /> RECORD AUDIO
                </div>
                <label className="flex gap-2 cursor-pointer">
                  <FileIcon /> UPLOAD FILES
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default ChatPage;
