import { useState, useEffect, useRef } from "react";
import type { Route } from "./+types/chat";
import Layout from "../components/Layout";
import { sendChatMessage, type ChatMessage } from "../services/ai";
import { MessageCircle, Send, Bot, User, Loader } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "AI相談チャット - SafeBridge" },
    { name: "description", content: "AIとチャットで災害時の相談と避難アドバイス" },
  ];
}

const quickQuestions = [
  "地震が発生した時の対処法を教えて",
  "最寄りの避難所はどこですか？",
  "避難時の持ち物リストを教えて",
  "ペット同行避難について知りたい",
  "家族との連絡方法について",
  "天気警報の見方を教えて",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "こんにちは！SafeBridge AI アシスタントです。災害時の避難や安全について、何でもお気軽にご相談ください。緊急の場合は119番または110番に連絡してください。",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (message?: string) => {
    const messageToSend = message || inputMessage.trim();
    if (!messageToSend || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: messageToSend,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await sendChatMessage([...messages, userMessage], messageToSend);
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "申し訳ございません。現在システムに問題が発生しています。緊急の場合は119番または110番に直接連絡してください。",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickQuestion = (question: string) => {
    handleSendMessage(question);
  };

  return (
    <Layout>
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">AI災害相談</h1>
              <p className="text-sm text-gray-600">24時間いつでも相談可能</p>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.role === 'assistant' && (
                    <Bot size={16} className="text-orange-600 mt-1 flex-shrink-0" />
                  )}
                  {message.role === 'user' && (
                    <User size={16} className="text-blue-200 mt-1 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div
                      className={`text-xs mt-1 ${
                        message.role === 'user' ? 'text-blue-200' : 'text-gray-500'
                      }`}
                    >
                      {format(message.timestamp, 'HH:mm', { locale: ja })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3 max-w-[85%]">
                <div className="flex items-center space-x-2">
                  <Bot size={16} className="text-orange-600" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-gray-600 text-sm">回答を準備中...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions */}
        {messages.length === 1 && (
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">よくある質問</h3>
            <div className="grid grid-cols-1 gap-2">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickQuestion(question)}
                  className="text-left p-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <div className="flex space-x-2">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="災害や避難について質問してください..."
              className="flex-1 p-3 border border-gray-300 rounded-lg resize-none max-h-24"
              rows={1}
              disabled={isLoading}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-orange-600 text-white p-3 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <Loader size={20} className="animate-spin" />
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>
          
          {/* Emergency Note */}
          <div className="mt-2 text-xs text-gray-500 text-center">
            ⚠️ 生命に関わる緊急事態の場合は、すぐに119番（消防・救急）または110番（警察）に連絡してください
          </div>
        </div>
      </div>
    </Layout>
  );
}