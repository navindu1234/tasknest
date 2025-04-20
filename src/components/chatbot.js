import React, { useState, useEffect, useRef } from "react";
import { FiX, FiSend, FiMessageSquare } from "react-icons/fi";
import { db } from "../components/firebase";
import { collection, getDocs } from "firebase/firestore";

function Chatbot({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    { text: "Hi there! 👋 I'm your shopping assistant. How can I help you today?", sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const [sellers, setSellers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "services"));
        const sellersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSellers(sellersData);

        // Extract unique categories
        const uniqueCategories = [
          ...new Set(sellersData.map((s) => s.category)),
        ];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Error fetching sellers:", error);
      }
    };

    if (isOpen) {
      fetchSellers();
    }
  }, [isOpen]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const generateBotResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();

    // Greeting
    if (/hi|hello|hey/.test(lowerMessage)) {
      return "Hello there! 😊 What can I do for you today?";
    }

    // Ask about services
    if (/services|what (do you )?offer|what (can|could) you do/.test(lowerMessage)) {
      return `We provide these services: \n\n${categories.map(cat => `• ${cat}`).join("\n")}\n\nWhich one interests you?`;
    }

    // Try to match category
    const matchedCategory = categories.find((cat) =>
      lowerMessage.includes(cat.toLowerCase())
    );

    if (matchedCategory) {
      const matchedSellers = sellers.filter(
        (seller) =>
          seller.category.toLowerCase() === matchedCategory.toLowerCase()
      );

      if (matchedSellers.length > 0) {
        return `Here are some ${matchedCategory} providers:\n\n${matchedSellers
          .map((s) => `🛍️ ${s.name} (📍 ${s.city})`)
          .join("\n")}\n\nWould you like more details about any of these?`;
      } else {
        return `I couldn't find any ${matchedCategory} providers at the moment. 😔 Try checking back later or ask about another service.`;
      }
    }

    // Thank you response
    if (/thank|thanks|appreciate/.test(lowerMessage)) {
      return "You're very welcome! 😊 Is there anything else I can help you with?";
    }

    // Goodbye
    if (/bye|goodbye|see you/.test(lowerMessage)) {
      return "Goodbye! 👋 Feel free to come back if you have more questions!";
    }

    return "I'm happy to help! 😊 You can ask me about:\n• Our services\n• Specific categories\n• Or anything else shopping-related!";
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    setIsTyping(true);
    
    setTimeout(() => {
      const botReply = { text: generateBotResponse(input), sender: "bot" };
      setMessages((prev) => [...prev, botReply]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // Simulate natural typing delay
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-20 right-6 w-96 bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200 z-50 transition-all duration-300 transform hover:shadow-2xl">
      <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <FiMessageSquare className="text-white" size={20} />
          <span className="font-bold text-lg">Shopping Assistant</span>
        </div>
        <button 
          onClick={onClose} 
          className="text-white hover:bg-white/10 p-1 rounded-full transition-colors"
          aria-label="Close chat"
        >
          <FiX size={20} />
        </button>
      </div>
      
      <div
        className="p-4 h-80 overflow-y-auto bg-gray-50"
        ref={chatRef}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex mb-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] p-3 rounded-lg ${msg.sender === "user"
                ? "bg-green-500 text-white rounded-tr-none"
                : "bg-white text-gray-800 border border-gray-200 rounded-tl-none shadow-sm"}`}
            >
              {msg.text.split('\n').map((paragraph, i) => (
                <p key={i} className="mb-2 last:mb-0">{paragraph}</p>
              ))}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start mb-3">
            <div className="bg-white text-gray-800 p-3 rounded-lg rounded-tl-none border border-gray-200 shadow-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-3 border-t border-gray-200 bg-white">
        <div className="relative flex">
          <input
            type="text"
            className="flex-grow p-3 pr-12 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            aria-label="Type your message"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full ${input.trim() ? 'bg-green-500 text-white hover:bg-green-600' : 'text-gray-400'} transition-colors`}
            aria-label="Send message"
          >
            <FiSend size={18} />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1 text-center">
          Ask about services, categories, or anything shopping-related
        </p>
      </div>
    </div>
  );
}

export default Chatbot;