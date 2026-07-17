"use client";

import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Send, User, Search, Loader2, CheckCircle2 } from "lucide-react";
import { chatAPI } from "@/services/chat.service";
import { 
  joinChatRoom, 
  leaveChatRoom, 
  sendChatMessage, 
  onReceiveMessage, 
  offReceiveMessage,
  initializeSocket
} from "@/services/socketService";
import { getUser } from "@/lib/axios";
import ShoppingCartLoader from "@/components/ShoppingCartLoader";

export default function ChatPage() {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Authenticate and init socket
    const user = getUser();
    if (user) {
      setCurrentUser(user.user || user);
      initializeSocket();
    }

    fetchConversations();
  }, []);

  // Listen for real-time messages
  useEffect(() => {
    const handleReceiveMessage = (newMessage) => {
      if (activeConversation && newMessage.conversationId === activeConversation._id) {
        setMessages((prev) => [...prev, newMessage]);
        scrollToBottom();
      } else {
        // Just refresh conversations to update "last message"
        fetchConversations();
      }
    };

    onReceiveMessage(handleReceiveMessage);
    return () => offReceiveMessage();
  }, [activeConversation]);

  // Load messages when conversation changes
  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation._id);
      joinChatRoom(activeConversation._id);
    }

    return () => {
      if (activeConversation) {
        leaveChatRoom(activeConversation._id);
      }
    };
  }, [activeConversation]);

  const fetchConversations = async () => {
    try {
      setIsLoadingConversations(true);
      const data = await chatAPI.getConversations();
      if (data.success) {
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      setIsLoadingMessages(true);
      const data = await chatAPI.getMessages(conversationId);
      if (data.success) {
        setMessages(data.messages);
        scrollToBottom();
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConversation || !currentUser) return;

    const messageData = {
      senderId: currentUser._id,
      receiverId: activeConversation.otherParticipant._id,
      messageText: inputText.trim(),
    };

    // Optimistically update UI (Optional)
    // setMessages(prev => [...prev, { ...messageData, _id: Date.now().toString(), createdAt: new Date() }]);
    
    setInputText("");
    sendChatMessage(messageData);
    scrollToBottom();
    showToast("Message sent successfully");
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-100px)] flex bg-background rounded-2xl overflow-hidden border border-border shadow-sm relative">
        
        {/* Toast Notification */}
        {toastMessage && (
          <div className="absolute top-4 right-4 z-50 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 transition-opacity duration-300">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
        )}

        {/* Sidebar - Conversations List */}
        <div className="w-1/3 border-r border-border bg-card flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="text-xl font-bold mb-4">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search chats..." 
                className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {isLoadingConversations ? (
              <ShoppingCartLoader />
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                No active conversations yet
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv._id}
                  onClick={() => setActiveConversation(conv)}
                  className={`w-full text-left flex items-center gap-3 p-4 border-b border-border hover:bg-muted/50 transition-colors ${activeConversation?._id === conv._id ? 'bg-primary/5 border-l-4 border-l-primary' : ''}`}
                >
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center shrink-0 border border-border overflow-hidden">
                    {conv.otherParticipant?.profileImage ? (
                      <img src={`http://localhost:5000/uploads/${conv.otherParticipant.profileImage}`} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-semibold text-sm truncate">
                        {conv.otherParticipant?.fullname || 'Unknown User'}
                      </h3>
                      {conv.lastMessage?.createdAt && (
                        <span className="text-xs text-muted-foreground shrink-0">
                          {formatTime(conv.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {conv.lastMessage ? conv.lastMessage.messageText : 'Start chatting...'}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-background">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border bg-card flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center border border-border overflow-hidden">
                  {activeConversation.otherParticipant?.profileImage ? (
                    <img src={`http://localhost:5000/uploads/${activeConversation.otherParticipant.profileImage}`} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{activeConversation.otherParticipant?.fullname || 'Unknown User'}</h3>
                  <p className="text-xs text-primary">Online</p>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
                {isLoadingMessages ? (
                  <ShoppingCartLoader />
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col justify-center items-center text-muted-foreground">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                      <Send className="w-6 h-6 text-primary opacity-50" />
                    </div>
                    <p>No messages yet.</p>
                    <p className="text-sm">Send a message to start the conversation.</p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isMe = msg.senderId?._id === currentUser?._id || msg.senderId === currentUser?._id;
                    return (
                      <div key={msg._id || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMe ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-card border border-border rounded-tl-sm shadow-sm'}`}>
                          <p className="text-sm break-words">{msg.messageText}</p>
                          <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                            {formatTime(msg.createdAt)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-card border-t border-border">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <button 
                    type="submit"
                    disabled={!inputText.trim()}
                    className="bg-primary text-primary-foreground p-3 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0 w-12"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center text-muted-foreground bg-muted/10">
              <div className="w-20 h-20 bg-card border border-border rounded-full flex items-center justify-center mb-6 shadow-sm">
                <Send className="w-8 h-8 text-primary opacity-50 ml-1" />
              </div>
              <h2 className="text-xl font-medium mb-2 text-foreground">Your Messages</h2>
              <p>Select a conversation from the sidebar to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

