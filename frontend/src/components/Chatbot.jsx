import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { isRAGReady, generateStreamingResponse } from "../config/api";

function Chatbot({
  chatHistory,
  setChatHistory,
  userQueries,
  setUserQueries,
  onLoadConversation,
  isDarkMode,
  onResponsePageNumbers,
}) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your sustainable intensification assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
      sources: [],
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [isRetrieverReady, setIsRetrieverReady] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const scrollToBottom = () => {
    // Simple scroll to bottom without locking
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  };

  const scrollToBottomImmediate = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "auto",
        block: "end",
      });
    }
  };

  const scrollToBottomDuringStreaming = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    // Only scroll when new messages are added (not during streaming)
    if (messages.length > 0 && !streamingMessage) {
      scrollToBottom();
    }
  }, [messages, streamingMessage]);

  // Also scroll when loading state changes
  useEffect(() => {
    if (isLoading) {
      scrollToBottomImmediate();
    }
  }, [isLoading]);

  // Check RAG readiness on component mount
  useEffect(() => {
    const checkRAGReady = async () => {
      try {
        const ready = await isRAGReady();
        setIsRetrieverReady(ready);
        if (ready) {
          console.log("RAG system is ready");
        } else {
          console.log(
            "RAG system not ready - will auto-initialize on first query"
          );
        }
      } catch (error) {
        console.error("Error checking RAG status:", error);
        setIsRetrieverReady(false);
      }
    };

    checkRAGReady();
  }, []);

  // Save chat to history when conversation ends
  useEffect(() => {
    if (messages.length > 1 && !isLoading && !streamingMessage) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender === "bot") {
        const conversation = {
          id: Date.now(),
          title: messages[1]?.text?.slice(0, 50) + "..." || "New Conversation",
          messages: [...messages],
          timestamp: new Date(),
        };
        setChatHistory((prev) => [conversation, ...prev.slice(0, 9)]); // Keep last 10 conversations
      }
    }
  }, [messages, isLoading, streamingMessage]);

  const loadConversation = (conversation) => {
    setMessages(conversation.messages);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
      sources: [],
    };

    // Add user query to the tracking array
    const newQuery = {
      id: Date.now(),
      text: inputMessage,
      timestamp: new Date(),
    };
    setUserQueries((prev) => [...prev, newQuery]);

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage("");
    setIsLoading(true);
    setStreamingMessage("");

    try {
      // Prepare conversation history for the server
      const conversationHistory = messages.map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text,
      }));

      // Add the new user message
      conversationHistory.push({ role: "user", content: currentInput });

      let fullResponse = "";
      let sources = [];

      // Generate streaming response using the server
      await generateStreamingResponse(
        currentInput,
        conversationHistory,
        // onChunk callback
        (chunk) => {
          fullResponse += chunk;
          setStreamingMessage(fullResponse);
          // Scroll to bottom during streaming to show new content
          scrollToBottomDuringStreaming();
        },
        // onComplete callback
        (data) => {
          sources = data.sources || [];
          const botMessage = {
            id: messages.length + 2,
            text: data.fullResponse || fullResponse,
            sender: "bot",
            timestamp: new Date(),
            sources: sources,
          };
          setMessages((prev) => [...prev, botMessage]);
          setStreamingMessage("");
          setIsLoading(false);

          // Extract page numbers from sources and pass to parent
          const pageNumbers = sources
            .map((source) => parseInt(source.pageNumber))
            .filter((num) => !isNaN(num));
          if (onResponsePageNumbers && pageNumbers.length > 0) {
            onResponsePageNumbers(pageNumbers);
          }

          // Scroll to bottom once after response is complete, then let user control
          setTimeout(() => {
            scrollToBottom();
          }, 100);
        },
        // onError callback
        (error) => {
          console.error("Error getting AI response:", error);
          const errorMessage = {
            id: messages.length + 2,
            text: "I apologize, but I'm having trouble connecting to my knowledge base right now. Please check your internet connection and try again. If the problem persists, you may need to check your API key configuration.",
            sender: "bot",
            timestamp: new Date(),
            sources: [],
          };
          setMessages((prev) => [...prev, errorMessage]);
          setStreamingMessage("");
          setIsLoading(false);
        }
      );
    } catch (error) {
      console.error("Error getting AI response:", error);
      const errorMessage = {
        id: messages.length + 2,
        text: "I apologize, but I'm having trouble connecting to my knowledge base right now. Please check your internet connection and try again. If the problem persists, you may need to check your API key configuration.",
        sender: "bot",
        timestamp: new Date(),
        sources: [],
      };
      setMessages((prev) => [...prev, errorMessage]);
      setStreamingMessage("");
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div
      className={`flex flex-col h-full rounded-lg shadow-sm border ${
        isDarkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold">
              Farmer Sustainable Intensification Practice Assistant
            </h3>
            <p className="text-xs text-orange-100">
              AI-powered crop sustainable intensification chatbot
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isRetrieverReady
                ? "bg-green-300 animate-pulse"
                : "bg-orange-300 animate-pulse"
            }`}
          ></div>
          <span className="text-xs">
            {isRetrieverReady ? "RAG Ready" : "Loading..."}
          </span>
        </div>
      </div>

      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        <div ref={messagesEndRef} />
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender === "user"
                  ? "bg-orange-500 text-white rounded-br-none"
                  : isDarkMode
                  ? "bg-gray-800 text-gray-100 rounded-bl-none border border-gray-700"
                  : "bg-gray-100 text-gray-800 rounded-bl-none"
              }`}
            >
              {message.sender === "bot" ? (
                <div className="text-sm prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown
                    components={{
                      // Custom styling for markdown elements
                      p: ({ children }) => (
                        <p className="mb-2 last:mb-0">{children}</p>
                      ),
                      h1: ({ children }) => (
                        <h1 className="text-lg font-bold mb-2 text-orange-600 dark:text-orange-400">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-base font-semibold mb-2 text-orange-600 dark:text-orange-400">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-sm font-semibold mb-1 text-orange-600 dark:text-orange-400">
                          {children}
                        </h3>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc list-inside mb-2 space-y-1">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal list-inside mb-2 space-y-1">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="text-sm">{children}</li>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-orange-600 dark:text-orange-400">
                          {children}
                        </strong>
                      ),
                      em: ({ children }) => (
                        <em className="italic">{children}</em>
                      ),
                      code: ({ children }) => (
                        <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-xs font-mono">
                          {children}
                        </code>
                      ),
                      pre: ({ children }) => (
                        <pre className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-xs font-mono overflow-x-auto mb-2">
                          {children}
                        </pre>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-orange-500 pl-3 italic text-gray-600 dark:text-gray-400 mb-2">
                          {children}
                        </blockquote>
                      ),
                    }}
                  >
                    {message.text}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              )}

              {/* Sources for bot messages */}
              {message.sender === "bot" &&
                message.sources &&
                message.sources.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
                      Sources:
                    </span>
                    {message.sources.map((source, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          // Navigate to the PDF page
                          const pageNumber = parseInt(source.pageNumber);
                          if (!isNaN(pageNumber) && window.scrollToPage) {
                            window.scrollToPage(pageNumber);
                          }
                        }}
                        className={`px-2 py-1 text-xs rounded-md transition-colors border ${
                          isDarkMode
                            ? "bg-orange-900/30 text-orange-300 hover:bg-orange-800/40 border-orange-500"
                            : "bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200"
                        }`}
                        title={`Page ${source.pageNumber}: ${source.content}`}
                      >
                        Page {source.pageNumber}
                      </button>
                    ))}
                  </div>
                )}

              <p
                className={`text-xs mt-1 ${
                  message.sender === "user"
                    ? "text-orange-100"
                    : isDarkMode
                    ? "text-gray-400"
                    : "text-gray-500"
                }`}
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}

        {/* Streaming Message */}
        {streamingMessage && (
          <div className="flex justify-start">
            <div
              className={`rounded-lg rounded-bl-none px-4 py-2 max-w-xs lg:max-w-md ${
                isDarkMode
                  ? "bg-gray-800 text-gray-100 border border-gray-700"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              <div className="text-sm prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => (
                      <p className="mb-2 last:mb-0">{children}</p>
                    ),
                    h1: ({ children }) => (
                      <h1 className="text-lg font-bold mb-2 text-orange-600 dark:text-orange-400">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-base font-semibold mb-2 text-orange-600 dark:text-orange-400">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-sm font-semibold mb-1 text-orange-600 dark:text-orange-400">
                        {children}
                      </h3>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside mb-2 space-y-1">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside mb-2 space-y-1">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="text-sm">{children}</li>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-orange-600 dark:text-orange-400">
                        {children}
                      </strong>
                    ),
                    em: ({ children }) => (
                      <em className="italic">{children}</em>
                    ),
                    code: ({ children }) => (
                      <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-xs font-mono">
                        {children}
                      </code>
                    ),
                    pre: ({ children }) => (
                      <pre className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-xs font-mono overflow-x-auto mb-2">
                        {children}
                      </pre>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-orange-500 pl-3 italic text-gray-600 dark:text-gray-400 mb-2">
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {streamingMessage}
                </ReactMarkdown>
              </div>
              <div className="flex space-x-1 mt-2">
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && !streamingMessage && (
          <div className="flex justify-start">
            <div
              className={`rounded-lg rounded-bl-none px-4 py-2 ${
                isDarkMode
                  ? "bg-gray-800 text-gray-100 border border-gray-700"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about crop mix intensification..."
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 resize-none ${
                isDarkMode
                  ? "border-gray-600 bg-gray-800 text-gray-100 focus:border-orange-500"
                  : "border-gray-300 bg-white text-gray-800 focus:border-orange-500"
              }`}
              rows="1"
              style={{ minHeight: "44px", maxHeight: "120px" }}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
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

        {/* Quick Actions */}
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            "Summarize the manual",
            "What challenges do smallholder farmers face when adopting these practices?",
            "How do legume systems improve soil fertility in the long run?",
          ].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setInputMessage(suggestion)}
              className={`px-3 py-1 text-xs rounded-full transition-colors border ${
                isDarkMode
                  ? "bg-orange-900/30 text-orange-300 hover:bg-orange-800/40 border-orange-500"
                  : "bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200"
              }`}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Chatbot;
