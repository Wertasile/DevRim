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
  Menu,
  Search,
  Send,
  Compass,
  Heart,
  Settings,
  X,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import ChatMenu from "~/components/chatComponents/ChatMenu";
import { useChat, useNotification, useUser } from "~/context/userContext";
import type { Chat, Message, User } from "~/types/types";
import WelcomeScreen from "~/components/WelcomeScreen";
import io from "socket.io-client" // io is a function to call an individual socket
import { socket } from "../components/socket";
import Sidebar from "../components/Sidebar"
import GroupModal from "~/components/chatComponents/groupModal";
import FindUserModal from "~/components/chatComponents/findUserModal";
import Friends from "~/components/chatComponents/Friends";
import CustomiseGCModal from "~/components/chatComponents/customiseGCModal";
import GCUsersPanel from "~/components/chatComponents/GCUsersPanel";
import AddGCUsers from "~/components/chatComponents/addGCUsersModal";
import deleteMessage from "~/apiCalls/message/deleteMessage";
import PinModal from "~/components/chatComponents/pinModal";
import pinMessage from "~/apiCalls/message/pinMessage";
import AudioPlayer from "~/components/AudioPlayer";

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
  const streamRef = useRef<MediaStream | null>(null);

  const [mediaUrls, setMediaUrls] = useState<{ [key: string]: string }>({});
  const [file, setFile] = useState<File | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [isUserAtBottom, setIsUserAtBottom] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const isUserAtBottomRef = useRef(true);
  const isInitialLoadRef = useRef(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

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
  const [searchQuery, setSearchQuery] = useState<string>("")

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
    setIsLoadingMessages(true);
    const startTime = Date.now();
    
    try {
      const res = await fetch(`${API_URL}/messages/${chatId}`, {
        method: "get",
        credentials: "include",
      });
      if (!res.ok) {
        setIsLoadingMessages(false);
        return;
      }

      const messageData = await res.json();
      
      // Ensure minimum loading time of 500ms
      const elapsed = Date.now() - startTime;
      const minLoadTime = 500; // 0.5 seconds
      const remainingTime = Math.max(0, minLoadTime - elapsed);
      
      setTimeout(() => {
        // Set messages and scroll to bottom
        setMessages(messageData);
        socket.emit("join chat", chat?._id);
        
        // Wait for DOM to update, then scroll
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ 
            behavior: 'auto',
            block: 'end'
          });
          // Small delay before hiding loading to ensure smooth transition
          setTimeout(() => {
            setIsLoadingMessages(false);
          }, 100);
        }, 50);
      }, remainingTime);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      setIsLoadingMessages(false);
    }
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
    if (chat?._id) {
      setIsInitialLoad(true);
      isInitialLoadRef.current = true;
      setIsUserAtBottom(true);
      isUserAtBottomRef.current = true;
      setMessages([]); // Clear previous messages immediately
      fetchMessages(chat._id);
    }
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

  const startRecording = async () => {
    try {
      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Request new media stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setIsBlocked(false);

      // Check for supported MIME types
      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        } else {
          mimeType = ''; // Use default
        }
      }

      // Create new MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = mediaRecorder;

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        try {
          const blob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' });
          const file = new File([blob], `audio-${Date.now()}.${mimeType.includes('mp4') ? 'm4a' : 'webm'}`, {
            type: blob.type,
          });
          setAudio(file);
          setAttachment(false);
        } catch (error) {
          console.error('Error creating audio file:', error);
        } finally {
          // Stop all tracks to release microphone
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
          }
        }
      };

      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsBlocked(true);
      setIsRecording(false);
      alert('Failed to access microphone. Please check your permissions.');
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current || !isRecording) return;
    
    try {
      if (mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    } catch (error) {
      console.error('Error stopping recording:', error);
      setIsRecording(false);
      
      // Clean up stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

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
    const isLoading = (message.messageType === "image" || message.messageType === "audio" || message.messageType === "file") && !url;

    switch (message.messageType) {
      case "image":
        return (
          <div className="relative" style={{ minWidth: '200px', minHeight: '150px' }}>
            {isLoading ? (
              <div className="w-[200px] h-[150px] items-center justify-center animate-pulse">
                <div className="text-[#9aa4bd] text-xs">Loading image...</div>
              </div>
            ) : (
              <img 
                src={url} 
                className="cursor-pointer rounded-lg" 
                width="200" 
                alt="Message content" 
                onClick={() => openImageModal(url)}
                style={{ maxWidth: '200px', height: 'auto' }}
                onLoad={() => {
                  // Only scroll if user is at bottom
                  if (isUserAtBottomRef.current) {
                    setTimeout(() => scrollToBottomIfNeeded(true), 50);
                  }
                }}
              />
            )}
          </div>
        );
      case "audio":
        return (
          <div style={{ minWidth: "250px" }}>
            {isLoading ? (
              <div className="w-[250px] h-[60px] bg-[#D6D6CD] rounded-lg flex items-center justify-center animate-pulse">
                <div className="text-xs">Loading audio...</div>
              </div>
            ) : (
              <AudioPlayer 
                src={url} 
                messageId={message._id}
                isOwnMessage={message.sender._id === user?._id}
              />
            )}
          </div>
        );
      case "file":
        return (
          <div className="file-download" style={{ minHeight: "24px" }}>
            {isLoading ? (
              <div className="text-[#9aa4bd] text-sm animate-pulse">Loading file...</div>
            ) : (
              <a href={url} download>
                {message.content}
              </a>
            )}
          </div>
        );
      default:
        return (
          <div>
            {message.reply && 
            <div className="border-l-4 p-2 border-[#4DD499] bg-[#4DD499]/10 rounded-r-lg mb-2">
              <div className="text-small font-medium text-black">{message.reply.sender.name}</div>
              <div className="text-mini truncate text-black/70">{message.reply.content}</div>            
            </div>
            }
            <div className="break-words">{message.content}</div>
          </div>
        );
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Check if user is near bottom of scroll
  const checkIfAtBottom = () => {
    const container = messagesContainerRef.current;
    if (!container) return false;
    
    const threshold = 100; // pixels from bottom
    const isNearBottom = 
      container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
    
    setIsUserAtBottom(isNearBottom);
    isUserAtBottomRef.current = isNearBottom;
    return isNearBottom;
  };

  // Scroll to bottom only if user is already at bottom or it's initial load
  const scrollToBottomIfNeeded = (smooth = false) => {
    if (isUserAtBottomRef.current || isInitialLoadRef.current) {
      messagesEndRef.current?.scrollIntoView({ 
        behavior: smooth ? 'smooth' : 'auto',
        block: 'end'
      });
    }
  };

  // Handle scroll events
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      checkIfAtBottom();
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll when messages change (only if at bottom or initial load)
  useEffect(() => {
    if (!messages || messages.length === 0) return;

    // On initial load, scroll immediately
    if (isInitialLoadRef.current) {
      setTimeout(() => {
        scrollToBottomIfNeeded(false);
        setIsInitialLoad(false);
        isInitialLoadRef.current = false;
      }, 100);
    } else {
      // Otherwise, only scroll if user is at bottom
      scrollToBottomIfNeeded(true);
    }
  }, [messages]);

  // Handle media loading - don't auto-scroll, just update URLs
  useEffect(() => {
    // Only scroll if user is at bottom and it's not initial load
    if (!isInitialLoadRef.current && isUserAtBottomRef.current) {
      // Small delay to let DOM update
      setTimeout(() => {
        scrollToBottomIfNeeded(true);
      }, 50);
    }
  }, [mediaUrls]);

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

  // Show loading skeleton while checking authentication
  const { isLoading: userLoading } = useUser();
  
  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#EDEDE9]">
        <div className="text-center">
          <div className="skeleton w-16 h-16 rounded-full mx-auto mb-4"></div>
          <div className="skeleton w-48 h-6 rounded mx-auto"></div>
        </div>
      </div>
    );
  }
  
  // Redirect or show login page if not logged in (only after loading is complete)
  if (!user) {
    return <WelcomeScreen message="Please log in or sign up to access your chats and messages." />
  }


// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  return (
    <>
    {imageModal &&
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 cursor-pointer flex items-center justify-center p-4" onClick={() => closeImageModal()}>
        <div className="w-full max-w-7xl h-full max-h-[95vh] bg-[#EDEDE9] border-2 border-[#000000] flex flex-col gap-4 p-6 overflow-hidden rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-end items-center flex-shrink-0">
            <button 
              onClick={() => closeImageModal()}
              className="icon bg-[#4DD499] hover:bg-[#3BC088] text-black transition-all duration-200 hover:scale-110"
            >
              <X size={20}/>
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <img 
              src={ImageSrc} 
              className="max-w-full max-h-full w-auto h-auto object-contain border-2 border-[#000000] rounded-lg shadow-lg"
              alt="Message image"
              style={{ maxWidth: '100%', maxHeight: 'calc(95vh - 80px)' }}
            />
          </div>
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



    
    
    
      <div className="flex flex-row gap-6 px-6 py-8 w-full h-[calc(100vh-76px)]">
      {/* Left Sidebar - Global Navigation */}
      <Sidebar/>

      {/* Chat List Sidebar */}
      { section === "messages" && 
      <div className="w-[400px] border-[#000000]">
        {/* Top Section - Menu and Search */}
        <div className="p-4 flex flex-col gap-3 border-[#000000]">
          
          <div className="flex gap-2">
            <button
              onClick={() => {setFindUsersModal(!findUsersModal)}}
              className="primary-btn bg-[#4DD499] hover:bg-[#3BC088] text-black transition-all duration-200 hover:scale-105">
                FIND USER
            </button>
            <div className='icon bg-[#4DD499] hover:bg-[#3BC088] text-black transition-all duration-200 hover:scale-105' onClick={() => {setGroupModal(!groupModal)}}>
              <Users size={20} />
            </div>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex flex-col gap-[20px] p-[10px] overflow-y-auto">
          {chats && chats.length > 0 ? (
            chats.map((chatx, index) => {
            const otherUser = chatx.chatName === "sender" 
              ? chatx.users.find((u) => u._id !== user?._id)
              : null;
            const chatName = chatx.chatName === "sender" 
              ? otherUser?.name || "Unknown"
              : chatx.chatName;
            const chatPicture = chatx.chatName === "sender"
              ? otherUser?.picture
              : '/Images/group_chat.png';
            const lastMessage = chatx.latestMessage;
            const lastMessagePreview = lastMessage 
              ? `${lastMessage.sender._id === user?._id ? 'You: ' : ''}${lastMessage.content?.substring(0, 30)}${lastMessage.content?.length > 30 ? '...' : ''}`
              : 'No messages yet';
            const timestamp = chatx.updatedAt 
              ? new Date(chatx.updatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
              : '';
            const isSelected = chat?._id === chatx._id;

            return (
              <div
                key={index}
                className={`cursor-pointer p-3 flex items-center gap-3 border-2 border-solid border-[#000000] rounded-lg transition-all duration-200 ${
                  isSelected ? 'bg-[#4DD499] shadow-[4px_4px_0px_2px_rgb(0,0,0)]' : 'bg-[#EDEDE9] hover:bg-[#E0E0DC] hover:border-[#4DD499] hover:shadow-sm'
                }`}
                onClick={() => {setChat(chatx)}}
              >
                <img 
                  src={chatPicture} 
                  alt={chatName}
                  width={50}
                  height={50}
                  className="rounded-full border-2 border-transparent transition-all duration-200"
                  style={{ borderColor: isSelected ? '#000000' : 'transparent' }}
                />
                <div className="flex flex-col w-full">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-black">{chatName}</div>
                    {timestamp && (
                      <span className="text-mini text-black/60">{timestamp}</span>
                    )}
                  </div>
                  <div className="text-mini text-black/70">{lastMessagePreview}</div>
                </div>
              </div>
            );
          })
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="text-black/60 text-lg mb-2">No chats yet</div>
              <div className="text-black/40 text-sm">Start chatting with your connections.</div>
            </div>
          )}
        </div>
      </div>
      }

      {/* MESSAGES */}
      { section === "messages" && 

      <div className="flex-grow flex flex-col border-2 border-[#000000] overflow-hidden bg-white rounded-lg shadow-md">
        {/* Chat Header */}
        <div className="h-[60px] flex bg-[#4DD499] items-center justify-between px-5 border-b-2 border-[#000000] shadow-sm">
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => {
              if (chat?.isGroupChat) setGCModal(true);
            }}
          >
            {chat && (
              <>
                <img 
                  src={
                    chat.chatName === "sender"
                      ? chat.users.find((u) => u._id !== user?._id)?.picture || user?.picture
                      : '/Images/group_chat.png'
                  }
                  alt="Chat"
                  className="w-10 h-10 rounded-full border-2 border-[#000000] object-cover hover:ring-2 hover:ring-white/50 transition-all duration-200"
                />
                <h3 className="text-black font-semibold">
                  {chat.chatName === "sender"
                    ? chat.users.find((u) => u._id !== user?._id)?.name || "Unknown"
                    : chat.chatName}
                </h3>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <PinModal pinModal={pinModal} setPinModal={setPinModal}/>
            <GCUsersPanel setAddUsersModal={setAddUsersModal} chat={chat}/>
          </div>
        </div>

        {/* Messages Area */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto px-5 py-4 feed-container flex flex-col gap-3 relative bg-[#F5F5F1]"
        >
          {/* Loading Overlay */}
          {isLoadingMessages && (
            <div className="absolute inset-0 bg-[#EDEDE9]/95 backdrop-blur-sm z-10 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-[#000000] border-t-[#4DD499] rounded-full animate-spin"></div>
                <p className="text-black font-medium">LOADING</p>
              </div>
            </div>
          )}

          {/* Messages being mapped*/}
          {messages?.map((message, index) => {
            const messageDate = new Date(message.createdAt || message.updatedAt);
            const prevMessageDate = index > 0 && messages[index - 1] 
              ? new Date(messages[index - 1].createdAt || messages[index - 1].updatedAt)
              : null;
            
            // Check if this is a new day
            const isNewDay = !prevMessageDate || 
              messageDate.toDateString() !== prevMessageDate.toDateString();
            
            // Format date for display
            const formatDateLabel = (date: Date) => {
              const today = new Date();
              const yesterday = new Date(today);
              yesterday.setDate(yesterday.getDate() - 1);
              
              if (date.toDateString() === today.toDateString()) {
                return 'Today';
              } else if (date.toDateString() === yesterday.toDateString()) {
                return 'Yesterday';
              } else {
                return date.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                });
              }
            };
            
            return (
              <React.Fragment key={index}>

                {/* Day indicator*/}
                {isNewDay && (
                  <div className="flex items-center justify-center my-4">
                    <div className="px-4 py-2 border-2 rounded-[100px] bg-[#EDEDE9] border-[#000000] shadow-sm">
                      <span className="text-mini text-black font-medium">
                        {formatDateLabel(messageDate)}
                      </span>
                    </div>
                  </div>
                )}

                {/* {message} */}
                <div
                  className="relative w-fit min-w-[150px] max-w-[70%]"
                  style={{
                    marginLeft: message.sender._id === user?._id ? 'auto' : '0',
                    marginRight: message.sender._id === user?._id ? '0' : 'auto',
                  }}
                  onMouseEnter={() => {setHoveredMessageId(message?._id)}}
                  onMouseLeave={() => {setHoveredMessageId("")}}
                >
                  <div
                    id={`message:${message._id}`}
                    className={`relative border-2 border-[#000000] rounded-2xl flex flex-col gap-2 p-3 transition-all duration-200 hover:shadow-md text-black ${
                      message.sender._id === user?._id
                        ? "bg-[#4DD499]/30"
                        : "bg-[#EDEDE9] hover:bg-[#E0E0DC]"
                    }`}
                  >
                    {renderMessageContent(message)}
                    <div className="flex items-center justify-end gap-2">
                      {hoveredMessageId === message._id && (
                        <>
                        <CopyIcon className="cursor-pointer hover:text-[#4DD499] transition-colors duration-200" size={16} onClick={() => copy(message._id)}/>
                        {message.sender._id !== user?._id && (
                          <ReplyIcon className="cursor-pointer hover:text-[#4DD499] transition-colors duration-200" size={16} onClick={() => {setReply(message)}}/>
                        )}
                        <PinIcon className="cursor-pointer hover:text-[#4DD499] transition-colors duration-200" size={16} onClick={() => handlePin(message)}/>
                        {message.sender._id === user?._id && (
                          <Trash2Icon className="cursor-pointer hover:text-red-600 transition-colors duration-200" size={16} onClick={() => {handleDeleteMessage(message)}}/>
                        )}
                        </>
                      )}

                      <span className={`text-xs ${message.sender._id === user?._id ? 'opacity-80' : 'opacity-70'}`}>
                        {new Date(message.updatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                      </span>
                    </div>
                  </div>                  
                </div>
              </React.Fragment>
            );
          })}
          <div ref={messagesEndRef} />
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-2 text-black text-sm italic font-medium">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-[#4DD499] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-[#4DD499] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-[#4DD499] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span>Typing...</span>
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="border-t-2 border-[#000000] p-4 relative bg-[#EDEDE9]">
          {reply && 
            <div className="absolute bottom-full left-0 right-0 mb-2 mx-4 bg-[#4DD499]/20 border-2 border-[#000000] p-3 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-1">
                <span className="text-small text-black font-semibold">REPLYING TO {reply.sender.name}</span>
                <button onClick={() => setReply(null)} className="cursor-pointer hover:text-red-600 transition-colors duration-200 text-black font-bold text-lg">
                  ×
                </button>
              </div>  
              <div className="text-mini truncate text-black/80">{reply.content}</div>
            </div>  
          }
          
          {isRecording ? (
            <div className="flex items-center justify-center gap-4 py-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-black font-medium">Recording audio...</span>
              </div>
              <button 
                onClick={stopRecording}
                className="p-2 bg-red-500 rounded-full hover:bg-red-600 transition-all duration-200 hover:scale-110 border-2 border-[#000000]"
                title="Stop recording"
              >
                <MicOff size={20} className="text-black"/>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  placeholder="Type a message..."
                  className="form-input hover:border-[#4DD499] focus:border-[#4DD499] transition-all duration-200"
                  value={newMessage}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  onChange={(e) => {
                    typingHandler(e);
                  }}
                />
              </div>
              
              <div className="relative">
              <button
                className="p-3 icon bg-[#4DD499] hover:bg-[#3BC088] text-black transition-all duration-200 hover:scale-105"
                onClick={() => setAttachment(!attachment)}
              >
                <Paperclip size={20}/>
              </button>
              {attachment && (
                  <div className="absolute bottom-full right-0 mb-2 p-2 bg-[#EDEDE9] border-2 border-[#000000] z-50 min-w-[200px] rounded-lg shadow-lg">
                    <label className="flex items-center hover:bg-[#4DD499]/30 text-black gap-2 p-2 cursor-pointer rounded transition-all duration-200">
                      <Image size={16}/>
                      Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                    <div
                      onClick={startRecording}
                      className="flex items-center hover:bg-[#4DD499]/30 text-black gap-2 p-2 cursor-pointer rounded transition-all duration-200"
                    >
                      <Mic size={16}/>
                      Record Audio
                    </div>
                    <label className="flex items-center hover:bg-[#4DD499]/30 text-black gap-2 p-2 cursor-pointer rounded transition-all duration-200">
                      <FileIcon size={16}/>
                      Upload File
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>
                )}
              </div>
              
              <button
                className="icon bg-[#4DD499] hover:bg-[#3BC088] text-black transition-all duration-200 hover:scale-105"
                onClick={sendMessage}
              >
                <Send size={20}/>
              </button>
            </div>
          )}
        </div>
      </div>

      }

      {section === "friends" &&
        <Friends />
      }
    </div>
    

    
    </>
  );
};

export default ChatPage;
