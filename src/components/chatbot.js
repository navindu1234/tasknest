import React, { useState, useEffect, useRef } from "react";
import { FiX, FiSend, FiMessageSquare, FiShoppingBag, FiSearch, FiHelpCircle } from "react-icons/fi";
import { db } from "../components/firebase";
import { collection, getDocs } from "firebase/firestore";

function Chatbot({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    { 
      text: "Hi there! 👋 I'm your AI shopping assistant. How can I help you today?", 
      sender: "bot",
      quickReplies: ["Browse services", "Find by category", "Help"]
    },
  ]);
  const [input, setInput] = useState("");
  const [sellers, setSellers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationContext, setConversationContext] = useState(null);
  const chatRef = useRef(null);

  // Fetch sellers and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "services"));
        const sellersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSellers(sellersData);

        // Extract unique categories
        const uniqueCategories = [...new Set(sellersData.map((s) => s.category))];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Error fetching data:", error);
        addBotMessage("Sorry, I'm having trouble accessing our services right now. Please try again later.");
      }
    };

    if (isOpen) fetchData();
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const addBotMessage = (text, quickReplies = [], context = null) => {
    setMessages(prev => [...prev, { text, sender: "bot", quickReplies }]);
    if (context) setConversationContext(context);
  };

  const addUserMessage = (text) => {
    setMessages(prev => [...prev, { text, sender: "user" }]);
  };

  const handleQuickReply = (reply) => {
    setInput(reply);
    sendMessage(reply);
  };

  const generateBotResponse = async (userMessage) => {
    const lowerMessage = userMessage.toLowerCase().trim();
    setIsTyping(true);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));

    try {
      // Handle conversation context first
      if (conversationContext?.type === 'awaiting_category_confirmation') {
        setConversationContext(null);
        return handleCategorySearch(userMessage);
      }

      if (conversationContext?.type === 'awaiting_seller_selection') {
        setConversationContext(null);
        const selectedSeller = conversationContext.data.sellers.find(
          seller => seller.name.toLowerCase().includes(userMessage.toLowerCase())
        );
        if (selectedSeller) {
          return {
            text: `Here's more about ${selectedSeller.name}:\n\n• Service: ${selectedSeller.service}\n• Category: ${selectedSeller.category}\n• Location: ${selectedSeller.city}, ${selectedSeller.address}\n• Rating: ⭐ ${selectedSeller.rating?.toFixed(1) || 'New'}\n\nWould you like to contact them or see similar providers?`,
            quickReplies: ["Contact seller", "Similar providers", "Main menu"]
          };
        }
        return {
          text: "I couldn't find that exact seller. Would you like to try again or browse categories?",
          quickReplies: ["Try again", "Browse categories", "Help"]
        };
      }

      if (conversationContext?.type === 'awaiting_location_input') {
        setConversationContext(null);
        return handleLocationSearch(userMessage);
      }

      // General responses
      if (/hi|hello|hey/.test(lowerMessage)) {
        return {
          text: `Hello there! 😊 I can help you:\n• Find services\n• Browse categories\n• Recommend sellers\n\nWhat would you like to do?`,
          quickReplies: ["Browse services", "Find by location", "Help"]
        };
      }

      if (/services|what (do you )?offer|what (can|could) you do/.test(lowerMessage)) {
        return {
          text: `We offer these service categories:\n\n${categories.map(cat => `• ${cat}`).join("\n")}\n\nWhich one interests you?`,
          quickReplies: categories.slice(0, 3),
          context: { type: 'awaiting_category_confirmation' }
        };
      }

      if (/categories|list categories|types/.test(lowerMessage)) {
        return {
          text: `Here are all our service categories:\n\n${categories.map(cat => `• ${cat}`).join("\n")}`,
          quickReplies: categories.slice(0, 3)
        };
      }

      // Search by category
      const matchedCategory = categories.find(cat => 
        lowerMessage.includes(cat.toLowerCase())
      );

      if (matchedCategory) {
        return handleCategorySearch(matchedCategory);
      }

      // Search by location
      if (/near me|in my area|location|city|nearby/.test(lowerMessage)) {
        return {
          text: "Which city or area are you looking for services in?",
          context: { type: 'awaiting_location_input' }
        };
      }

      // Search by seller name
      if (/find seller|search for|look for/.test(lowerMessage)) {
        const nameQuery = lowerMessage.replace(/find seller|search for|look for/i, "").trim();
        if (nameQuery) {
          return handleSellerSearch(nameQuery);
        }
        return {
          text: "Which seller are you looking for? Please tell me the name.",
          context: { type: 'awaiting_seller_name' }
        };
      }

      // Help commands
      if (/help|support|what can you do|how to use/.test(lowerMessage)) {
        return {
          text: `I can help you with:\n\n• Finding services by category\n• Searching sellers by name\n• Filtering by location\n• Answering questions\n\nTry asking:\n"Find plumbers in Boston" or\n"Show me flower shops"`,
          quickReplies: ["Browse services", "Find by location", "Popular categories"]
        };
      }

      // Thank you response
      if (/thank|thanks|appreciate/.test(lowerMessage)) {
        return {
          text: "You're very welcome! 😊 Is there anything else I can help you with?",
          quickReplies: ["No, thanks", "Browse services", "Help"]
        };
      }

      // Goodbye
      if (/bye|goodbye|see you|done|finish/.test(lowerMessage)) {
        return {
          text: "Goodbye! 👋 Feel free to come back if you have more questions!",
          quickReplies: []
        };
      }

      // Default response with smart suggestions
      const suggestions = [
        "Try asking about specific services like 'electricians' or 'cleaning'",
        "You can search by location with 'near me' or a city name",
        "Need help? Just type 'help'"
      ];
      const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];

      return {
        text: `I'm not sure I understand. ${randomSuggestion}`,
        quickReplies: ["Help", "Browse services", "Find by location"]
      };

    } finally {
      setIsTyping(false);
    }
  };

  const handleCategorySearch = (category) => {
    const matchedSellers = sellers.filter(
      seller => seller.category.toLowerCase() === category.toLowerCase()
    );

    if (matchedSellers.length > 0) {
      const topRated = [...matchedSellers]
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 3);

      return {
        text: `Here are some top ${category} providers:\n\n${topRated
          .map((s, i) => `${i+1}. ${s.name} ⭐ ${s.rating?.toFixed(1) || 'New'} (📍 ${s.city})`)
          .join("\n")}\n\nWould you like:\n• More ${category} options\n• Details about any of these\n• Or search in a specific location?`,
        quickReplies: [
          `More ${category}`,
          `Search ${category} near me`,
          "Browse other categories"
        ],
        context: { 
          type: 'awaiting_seller_selection',
          data: { category, sellers: matchedSellers } 
        }
      };
    } else {
      return {
        text: `I couldn't find any ${category} providers at the moment. 😔 Try checking back later or ask about another service.`,
        quickReplies: categories.filter(c => c !== category).slice(0, 3)
      };
    }
  };

  const handleSellerSearch = (query) => {
    const matchedSellers = sellers.filter(seller =>
      seller.name.toLowerCase().includes(query.toLowerCase())
    );

    if (matchedSellers.length > 0) {
      return {
        text: `I found these sellers matching "${query}":\n\n${matchedSellers
          .map(s => `• ${s.name} (${s.category}, ${s.city}) ⭐ ${s.rating?.toFixed(1) || 'New'}`)
          .join("\n")}\n\nWould you like more details about any?`,
        quickReplies: matchedSellers.slice(0, 3).map(s => s.name),
        context: { 
          type: 'awaiting_seller_selection',
          data: { sellers: matchedSellers } 
        }
      };
    } else {
      return {
        text: `I couldn't find any sellers matching "${query}". Try a different name or browse categories instead.`,
        quickReplies: ["Browse categories", "Help", "Try another name"]
      };
    }
  };

  const handleLocationSearch = (location) => {
    const matchedSellers = sellers.filter(seller =>
      seller.city.toLowerCase().includes(location.toLowerCase())
    );

    if (matchedSellers.length > 0) {
      const categoriesInLocation = [...new Set(matchedSellers.map(s => s.category))];
      
      return {
        text: `I found services in ${location} across these categories:\n\n${categoriesInLocation
          .map(c => `• ${c} (${matchedSellers.filter(s => s.category === c).length} options)`)
          .join("\n")}\n\nWhich category interests you?`,
        quickReplies: categoriesInLocation.slice(0, 3),
        context: { 
          type: 'awaiting_category_confirmation',
          data: { location } 
        }
      };
    } else {
      return {
        text: `I couldn't find any services in ${location}. Try a nearby city or browse all services.`,
        quickReplies: ["Browse all services", "Help", "Try another location"]
      };
    }
  };

  const sendMessage = async (customMessage) => {
    const messageText = customMessage || input.trim();
    if (!messageText) return;

    addUserMessage(messageText);
    setInput("");

    const response = await generateBotResponse(messageText);
    if (response) {
      addBotMessage(response.text, response.quickReplies, response.context);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-20 right-6 w-96 bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200 z-50 transition-all duration-300 transform hover:shadow-2xl">
      <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <FiMessageSquare className="text-white" size={20} />
          <span className="font-bold text-lg">AI Shopping Assistant</span>
        </div>
        <button 
          onClick={onClose} 
          className="text-white hover:bg-white/10 p-1 rounded-full transition-colors"
          aria-label="Close chat"
        >
          <FiX size={20} />
        </button>
      </div>
      
      <div className="p-4 h-80 overflow-y-auto bg-gray-50" ref={chatRef}>
        {messages.map((msg, index) => (
          <React.Fragment key={index}>
            <div className={`flex mb-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
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

            {/* Quick Replies */}
            {msg.quickReplies && msg.sender === "bot" && (
              <div className="flex flex-wrap gap-2 mb-3">
                {msg.quickReplies.map((reply, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickReply(reply)}
                    className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full transition-colors"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}
          </React.Fragment>
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
            onClick={() => sendMessage()}
            disabled={!input.trim()}
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full ${input.trim() ? 'bg-green-500 text-white hover:bg-green-600' : 'text-gray-400'} transition-colors`}
            aria-label="Send message"
          >
            <FiSend size={18} />
          </button>
        </div>
        <div className="flex justify-center space-x-2 mt-2">
          <button 
            onClick={() => handleQuickReply("Browse services")}
            className="text-xs flex items-center text-green-600 hover:text-green-800"
          >
            <FiShoppingBag size={14} className="mr-1" /> Services
          </button>
          <button 
            onClick={() => handleQuickReply("Find by location")}
            className="text-xs flex items-center text-green-600 hover:text-green-800"
          >
            <FiSearch size={14} className="mr-1" /> Location
          </button>
          <button 
            onClick={() => handleQuickReply("Help")}
            className="text-xs flex items-center text-green-600 hover:text-green-800"
          >
            <FiHelpCircle size={14} className="mr-1" /> Help
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;