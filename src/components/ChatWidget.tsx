"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Message {
  id: string;
  text: string;
  sender: "customer" | "ai" | "admin";
  senderName?: string;
  timestamp: Date;
  type?: "text" | "order_query" | "product_recommendation" | "escalation";
  metadata?: any;
}

interface ChatWidgetProps {
  productId?: number;
  cartItems?: Array<{ id: number; name: string; price: number }>;
}

export default function ChatWidget({ productId, cartItems }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isAiMode, setIsAiMode] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionInitialized = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize chat session
  useEffect(() => {
    if (sessionInitialized.current) return;
    sessionInitialized.current = true;
    
    const initSession = async () => {
      try {
        // Cancel any pending request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();
        
        // Check for existing session in localStorage
        const storedSessionId = localStorage.getItem("chatSessionId");
        
        let sessionIdToUse = storedSessionId;
        
        // If we have a stored session, try to fetch previous messages
        if (storedSessionId) {
          try {
            const msgsRes = await fetch(`/api/chat/session?sessionId=${storedSessionId}`, {
              method: "GET",
              headers: { "Content-Type": "application/json" },
              signal: abortControllerRef.current.signal
            });
            
            if (msgsRes.ok) {
              const msgsData = await msgsRes.json();
              if (msgsData.messages && msgsData.messages.length > 0) {
                // Load previous messages
                const loadedMessages = msgsData.messages.map((msg: any) => ({
                  id: msg.id.toString(),
                  text: msg.message,
                  sender: msg.sender as "customer" | "ai" | "admin",
                  senderName: msg.senderName || "RIGHTCLICK Assistant",
                  timestamp: new Date(msg.createdAt),
                  type: msg.messageType as "text" | "order_query" | "product_recommendation" | "escalation",
                }));
                setMessages(loadedMessages);
                setSessionId(storedSessionId);
                setConnectionError(false);
                return; // Don't create new session, use existing one
              }
            }
          } catch (err) {
            console.log("No previous session found, creating new one");
          }
        }
        
        // Create new session if no existing one or no messages
        const response = await fetch("/api/chat/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: abortControllerRef.current.signal
        });
        
        if (!response.ok) {
          throw new Error("Failed to create session");
        }
        
        const data = await response.json();
        if (data.sessionId) {
          setSessionId(data.sessionId);
          localStorage.setItem("chatSessionId", data.sessionId); // Store for persistence
          setConnectionError(false);
          
          // Add welcome message if this is a new session
          if (data.welcomeMessage) {
            setMessages([
              {
                id: Date.now().toString(),
                text: data.welcomeMessage,
                sender: "ai",
                senderName: "RIGHTCLICK Assistant",
                timestamp: new Date(),
              },
            ]);
          }
        }
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error("Failed to initialize chat session:", error);
          setConnectionError(true);
          // Add fallback welcome message on error
          setMessages([
            {
              id: Date.now().toString(),
              text: "Hello! Welcome to RIGHTCLICK COMPUTER DIGITALS. How can I help you today?",
              sender: "ai",
              senderName: "RIGHTCLICK Assistant",
              timestamp: new Date(),
            },
          ]);
        }
      }
    };

    if (isOpen && !sessionId) {
      initSession();
    }
    
    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [isOpen, sessionId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    if (!inputText.trim() || !sessionId || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: "customer",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);
    setConnectionError(false);
    setShowTypingIndicator(true); // Show typing indicator

    try {
      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      
      const response = await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: inputText.trim(),
          productId,
          cartItems,
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();

      if (data.response) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response,
          sender: data.sender || "ai",
          senderName: data.senderName || "RIGHTCLICK Assistant",
          timestamp: new Date(),
          type: data.messageType,
          metadata: data.metadata,
        };
        setMessages((prev) => [...prev, aiMessage]);
        setShowTypingIndicator(false); // Hide typing indicator
      }

      if (data.escalated) {
        setIsAiMode(false);
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Failed to send message:", error);
        setConnectionError(true);
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            text: "Sorry, I'm having trouble connecting. Please try again or call us at 0503819000.",
            sender: "ai",
            senderName: "RIGHTCLICK Assistant",
            timestamp: new Date(),
          },
        ]);
        setShowTypingIndicator(false); // Hide typing indicator on error
      }
    } finally {
      setIsLoading(false);
    }
  }, [inputText, sessionId, productId, cartItems, isLoading]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleRetry = () => {
    setConnectionError(false);
    sessionInitialized.current = false;
    if (isOpen) {
      const initSession = async () => {
        try {
          const response = await fetch("/api/chat/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });
          const data = await response.json();
          if (data.sessionId) {
            setSessionId(data.sessionId);
            setConnectionError(false);
            if (data.welcomeMessage) {
              setMessages([
                {
                  id: Date.now().toString(),
                  text: data.welcomeMessage,
                  sender: "ai",
                  senderName: "RIGHTCLICK Assistant",
                  timestamp: new Date(),
                },
              ]);
            }
          }
        } catch (error) {
          console.error("Retry failed:", error);
        }
      };
      initSession();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      {/* Chat Toggle Button - Orange theme */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-orange-500 hover:bg-orange-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
        aria-label="Open chat"
      >
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )}
      </button>

      {/* Chat Window - Orange theme */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold">RIGHTCLICK Assistant</h3>
                <p className="text-orange-100 text-xs">
                  {isAiMode ? "AI Powered" : "Human Support"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
            </div>
          </div>

          {/* Messages */}
          <div className="h-96 overflow-y-auto p-4 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto mb-3 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <p className="text-sm">Start a conversation!</p>
                <p className="text-xs mt-1">
                  Ask about products, orders, or anything else
                </p>
              </div>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex mb-4 ${
                  msg.sender === "customer" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-5 py-4 ${
                    msg.sender === "customer"
                      ? "bg-blue-600 text-white rounded-br-md"
                      : msg.sender === "admin"
                      ? "bg-blue-600 text-white rounded-bl-md"
                      : "bg-white text-gray-900 rounded-bl-md shadow-md border-2 border-orange-200"
                  }`}
                >
                  {msg.sender !== "customer" && (
                    <p className="text-sm font-bold mb-2 text-gray-600">
                      {msg.senderName}
                    </p>
                  )}
                  <p className="text-base whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  <p
                    className={`text-xs mt-2 ${
                      msg.sender === "customer"
                        ? "text-blue-200"
                        : "text-gray-500"
                    }`}
                  >
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce delay-100"></span>
                    <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce delay-200"></span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">RIGHTCLICK is typing...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="px-4 py-2 bg-gradient-to-r from-orange-50 to-white border-t flex gap-2 overflow-x-auto">
            <button
              onClick={() => {
                setInputText("I want to check my order status");
                setTimeout(() => sendMessage(), 100);
              }}
              className="text-xs bg-orange-100 hover:bg-orange-200 text-orange-700 px-3 py-1.5 rounded-full whitespace-nowrap transition-colors font-medium"
            >
              📦 Track Order
            </button>
            <button
              onClick={() => {
                setInputText("What are your payment methods?");
                setTimeout(() => sendMessage(), 100);
              }}
              className="text-xs bg-orange-100 hover:bg-orange-200 text-orange-700 px-3 py-1.5 rounded-full whitespace-nowrap transition-colors font-medium"
            >
              💳 Payment
            </button>
            <button
              onClick={() => {
                setInputText("Tell me about shipping and delivery");
                setTimeout(() => sendMessage(), 100);
              }}
              className="text-xs bg-orange-100 hover:bg-orange-200 text-orange-700 px-3 py-1.5 rounded-full whitespace-nowrap transition-colors font-medium"
            >
              🚚 Shipping
            </button>
            <button
              onClick={() => {
                setInputText("Show me available products");
                setTimeout(() => sendMessage(), 100);
              }}
              className="text-xs bg-orange-100 hover:bg-orange-200 text-orange-700 px-3 py-1.5 rounded-full whitespace-nowrap transition-colors font-medium"
            >
              🖥️ Products
            </button>
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t">
            <div className="flex gap-2 items-end">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="w-full px-5 py-3 pr-12 border-2 border-gray-300 rounded-full focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-base"
                  maxLength={500}
                />
                <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs ${inputText.length > 450 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                  {inputText.length}/500
                </span>
              </div>
              <button
                onClick={sendMessage}
                disabled={!inputText.trim() || isLoading}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white rounded-full w-12 h-12 flex items-center justify-center transition-colors shadow-md"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">
              Powered by RIGHTCLICK COMPUTER DIGITALS
            </p>
          </div>
        </div>
      )}
    </>
  );
}
