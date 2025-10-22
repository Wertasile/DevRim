import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import {
  CircleQuestionMark,
  CopyIcon,
  DeleteIcon,
  FileIcon,
  Image,
  LayoutGrid,
  MessageSquare,
  Mic,
  MicOff,
  Paperclip,
  PinIcon,
  ReplyIcon,
  SendHorizonal,
  Trash2Icon,
  UserIcon,
  Users,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import ChatMenu from "~/components/chatComponents/ChatMenu";
import { useChat, useNotification, useUser } from "~/context/userContext";
import type { Chat, Message, User } from "~/types/types";
import io from "socket.io-client" // io is a function to call an individual socket
import { socket } from "../components/socket";
import GroupModal from "~/components/chatComponents/groupModal";
import FindUserModal from "~/components/chatComponents/findUserModal";
import Friends from "~/components/chatComponents/Friends";
import CustomiseGCModal from "~/components/chatComponents/customiseGCModal";
import GCUsersPanel from "~/components/chatComponents/GCUsersPanel";
import AddGCUsers from "~/components/chatComponents/addGCUsersModal";
import deleteMessage from "~/apiCalls/message/deleteMessage";
import PinModal from "~/components/chatComponents/pinModal";
import pinMessage from "~/apiCalls/message/pinMessage";

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
  
  // state to maintain replies
  const [reply, setReply] = useState<Message |null>(null)

  const [convoModal, setConvoModal] = useState(false)
  const [convoUser, setConvoUser] = useState("")

  const [groupModal, setGroupModal] = useState(false)
  const [groupName, setGroupName] = useState("")
  const [searchUser, setSearchUser] = useState<User[]>([]) // search results
  const [groupUsers, setGroupUsers] = useState<User[]>([]) // users selected by user

  const [findUsersModal, setFindUsersModal] = useState(false)
  const [findUsers, setFindUsers] = useState<User[]>([]) // search results

  const [gcModal, setGCModal] = useState(false)

  const [addUsersModal, setAddUsersModal] = useState<boolean>(false)

  const [section, setSection] = useState<string>("messages")

  const [hoveredMessageId, setHoveredMessageId] = useState<string>("");

  const [imageModal, setImageModal] = useState<boolean>(false)
  const [ImageSrc, setImageSrc] = useState<string>("")

  const [pinModal, setPinModal] = useState(false)

  const usersPanel = useRef(null)

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
    console.log(chatData)
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

  const handleDeleteMessage = async (message: Message) => {
    const data = await deleteMessage(message._id)
  }

  const handlePin = async (message: Message) => {
    if (message && chat){
      pinMessage(message._id, chat?._id)
    }
  }

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
        url: "None",
        reply: reply
      }),
    });

    if (!res.ok) return;
    const sentMessage = await res.json();
    socket.emit("new message", sentMessage)
    console.log("new message", sentMessage)
    setMessages((prev) => [...(prev ?? []), sentMessage]);
    setNewMessage("");
    setReply(null)
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (chat?._id) fetchMessages(chat._id);
    selectedChatCompare = chat
  }, [chat]);

  const copy = (messageId:string) => {
    var copyElement = document.getElementById(`message:${messageId}`)
    if (copyElement){
      const textToCopy = copyElement.textContent || "";
      navigator.clipboard.writeText(textToCopy)
    }

  }

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

  const openImageModal = (src: string) => {
    setImageModal(true)
    setImageSrc(src)
  }

  const closeImageModal = () => {
    setImageModal(false)
    setImageSrc("")

  }

  // ---------- RENDER MESSAGE ----------

  const renderMessageContent = (message: Message) => {
    const url = mediaUrls[message._id] || message.url; // presigned URL if available

    switch (message.messageType) {
      case "image":
        return (
          <img src={url} className="cursor-pointer" width="200" alt="Message content" onClick={() => openImageModal(url)}/>
        );
      case "audio":
        return (<audio controls src={url} style={{ maxWidth: "250px" }} />);
      case "file":
        return (
          <div className="file-download">
            <a href={url} download>
              {message.content}
            </a>
          </div>
        );
      default:
        return (
          <div>
            {message.reply && 
            <div className="border-l-[3px] border-[#AAACFF] border-solid border-solid border-[0.5px] p-2 flex-col rounded-[5px]">
              <div className="text-sm text-[#9A9CEF]">{message.reply.sender.name}</div>
              <div className="text-xs">{message.reply.content}  </div>            
            </div>
            }
            {message.content}
          </div>
        );
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

      socket.on("userStatusUpdate", ({ userId, status }) => {
        console.log(`User ${userId} is now ${status}`);
        // You can store in state to show “Online”/“Offline” badges
      });

      // for typing checking
      socket.on("typing", () => setIsTyping(true))
      socket.on("stop typing", () => setIsTyping(false))

      // Cleanup to prevent duplicate listeners on re-render
      return () => {
        socket.off("connected");
        socket.off("typing");
        socket.off("stop typing");
        socket.off("userStatusUpdate");
        socket.disconnect();
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
    {imageModal &&
      <div className="fixed h-full w-full bg-[rgba(0,0,0,0.6)] z-2 cursor-pointer" onClick={() => closeImageModal()}>
        <div className="w-[90vw] max-h-[90vh] mx-auto bg-[rgba(0,0,0,0.9)] border-solid border-[1px]" onClick={(e) => e.stopPropagation()}>
          <img src={ImageSrc} className="mx-auto max-w-[90vw] max-h-[90vh] object-contain"/>
        </div>
      </div>
    }

    {groupModal && 
      <GroupModal groupName={groupName} setGroupName={setGroupName} groupUsers={groupUsers} setGroupUsers={setGroupUsers} searchUser={searchUser} setSearchUser={setSearchUser} setGroupModal={setGroupModal} setChat={setChat}/>
    }

    {findUsersModal && 
      <FindUserModal findUsers={findUsers} setFindUsers={setFindUsers} setFindUsersModal={setFindUsersModal} setChat={setChat}/>
    }

    {(chat?.isGroupChat==true && gcModal) &&
      <CustomiseGCModal groupName={groupName} setGroupName={setGroupName} groupUsers={groupUsers} setGroupUsers={setGroupUsers} setGCModal={setGCModal}/>
    }

    {addUsersModal &&
      <AddGCUsers setAddUsersModal={setAddUsersModal}/>
    }



    
    
    
    <div className="flex flex-row h-[100vh]">
      {/* SIDEBAR */}
      <div className="w-[80px] flex flex-col items-center h-full border-[1px] border-r border-[#353535] justify-between py-5">
        <div className="flex flex-col gap-5">
          <a href="/">
            <img src="/Images/DevRim_Logo_0.png" width={48} />
          </a>
          <MessageSquare 
            onClick={() => setSection("messages")} 
            className={`cursor-pointer w-[48px] text-[#FFF] ${section === "messages" && ('bg-[#229197] rounded-3xl ')}`} 
          />
          <UserIcon 
            onClick={() => setSection("friends")} 
            className={`cursor-pointer w-[48px] text-[#FFF] ${section === "friends" && ('bg-[#229197] rounded-3xl ')}`}  
          />
        </div>
        <div className="flex flex-col gap-5">
          <CircleQuestionMark className="cursor-pointer w-[48px] text-[#FFF]" />
          <LayoutGrid className="cursor-pointer w-[48px] text-[#FFF]" />
          <img src={user?.picture} width={48} className="rounded-3xl" />
        </div>
      </div>

      {/* CHAT MENU */}
      { section === "messages" && 
      
      <div className="w-[400px] flex flex-col border-r border-[#353535]">
        <div className="h-[50px] border-b border-[#353535] flex items-center p-2 gap-3 ">
          <div className="primary-btn p-2 rounded-xl w-full text-center" onClick={() => {setFindUsersModal(!findUsersModal)}}>
            <span>Find or Start a Conversation</span>
          </div>
          <div className="flex primary-btn p-2 " onClick={() => {setGroupModal(!groupModal)}}>
              +
              <Users/>

          </div>
        </div>
        <div className="flex flex-col gap-5 p-2">
          {chats?.map((chatx, index) => (
            <ChatMenu key={index} Chat={chatx} />
          ))}
        </div>
      </div>
      
      }

      {/* MESSAGES */}
      { section === "messages" && 

      <div className="flex-grow flex flex-col feed-container overflow-y-scroll">
        <div className="h-[50px] flex justify-between cursor-pointer items-center border-b border-[#353535] px-5 sticky top-0 bg-[#13111C] z-1">
          <h2
            className="w-fit cursor-pointer"
            onClick={() => {
              if (chat?.isGroupChat) setGCModal(true);
            }}
          >
            {chat?.chatName === "sender"
              ? chat.users
                  .filter((u) => u._id !== user?._id)
                  .map((u) => 
                  <h2 key={u._id}>{u.name}</h2>
              )
              : 
              <h2>{chat?.chatName}</h2>
              }
          </h2>
          <div className="flex gap-2">
            <PinModal pinModal={pinModal} setPinModal={setPinModal}/>
            <GCUsersPanel setAddUsersModal={setAddUsersModal} chat={chat}/>
          </div>
        </div>

        <div className="flex flex-col gap-2 px-5 flex-grow justify-end ">
          {messages?.map((message, index) => (
            <div
              key={index}
              id={`message:${message._id}`}
              className={`relative rounded-[5px] flex flex-col gap-2 p-2 w-fit border border-[#979797] font-semibold ${
                message.sender._id === user?._id
                  ? "bg-green-300 text-black self-end"
                  : "bg-[#9A9CD4] text-black self-start"
              }`}

              onMouseEnter={() => {setHoveredMessageId(message?._id)}}
              onMouseLeave={() => {setHoveredMessageId("")}}
            >
              {renderMessageContent(message)}
              <i className="text-xs text-right font-light">
                {message.updatedAt.split("T")[1].slice(0, 5)}
              </i>
              
              {/* ------------------------------- HOVER MENU ---------------------------------------- */}

              { message._id === hoveredMessageId &&
              <div 
                className={`absolute flex flex-row gap-2 p-2 -top-10 ${message.sender._id === user?._id ? ("right-0") : ("left-0")} text-black rounded-[5px] 
                  ${
                  message.sender._id === user?._id
                    ? "bg-green-500 text-black self-end"
                    : "bg-[#9A9CEF] text-black self-start"
                  } `
                }
              >
                <CopyIcon className="cursor-pointer" strokeWidth={1} onClick={() => copy(message._id)}/>
                {message.sender._id !== user?._id && <ReplyIcon className="cursor-pointer" strokeWidth={1} onClick={() => {setReply(message)}}/>}
                <PinIcon strokeWidth={1} className="cursor-pointer" onClick={() => handlePin(message)}/>
                {message.sender._id === user?._id && <Trash2Icon strokeWidth={1} className="cursor-pointer" onClick={() => {handleDeleteMessage(message)}}/>}
              </div>
              }
            </div>
            
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="h-[30px]">
          {isTyping ? (<div style={{fontSize: "20px"}}> ... </div>) : (<></>)}
        </div>

        {/* INPUT */}
        <div className="flex flex-row items-center relative gap-2 px-2 sticky bottom-0 backdrop-blur-md">
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
          <div className="primary-btn">
            <SendHorizonal onClick={sendMessage} />
          </div>

          <div className="relative primary-btn">
            <Paperclip
              className="cursor-pointer"
              onClick={() => setAttachment(!attachment)}
            />
            {attachment && (
              <div className="p-2 flex flex-col bg-[#111] rounded-3xl z-50 text-white shadow-md absolute gap-2 right-0 bottom-10 w-[200px]">
                <label className="flex gap-2 primary-btn text-sm">
                  <Image /> UPLOAD IMAGE
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
                <div
                  onClick={startRecording}
                  className="flex gap-2 primary-btn text-sm"
                >
                  <Mic /> RECORD AUDIO
                </div>
                <label className="flex gap-2 cursor-pointer primary-btn text-sm">
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
          {reply && 
          <div className="absolute bottom-[50px] mx-5 rounded-[5px] w-[75%] bg-[#9A9CEF] text-black px-3 py-1">
            <div className="flex justify-between">
              <div>from {reply.sender.name}</div>
              <div onClick={() => setReply(null)} className="text-sm font-bold cursor-pointer">X</div>
            </div>  
            <div className="bg-[#9A9CD4] border-[0.5px] p-1">{reply.content}</div>
          </div>  
          }
        </div>
      </div>

      }

      {section === "friends" &&
        <Friends/>
      }
    </div>
    

    
    </>
  );
};

export default ChatPage;
