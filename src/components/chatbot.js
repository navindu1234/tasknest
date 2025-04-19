import React, { useState, useEffect } from "react";
import { FiX, FiSend } from "react-icons/fi";
import { db } from "../components/firebase"; // Firebase import
import { collection, getDocs } from "firebase/firestore";

function Chatbot({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    { text: "Hi! How can I help you?", sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const [sellers, setSellers] = useState([]);
  const [categories, setCategories] = useState([
    "House Cleaning",
    "Garage Labor",
    "Electrician",
    "Gardening Services",
    "Pest Control",
    "Moving and Packing Services",
    "Laundry and Ironing Services",
    "House Painting Services",
    "Car Repairs and Maintenance",
    "Cooking Services",
    "Home Renovation Services",
  ]);

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "services"));
        const sellersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSellers(sellersData);
      } catch (error) {
        console.error("Error fetching sellers:", error);
      }
    };

    if (isOpen) {
      fetchSellers();
    }
  }, [isOpen]);

  const generateBotResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();

    if (
      lowerMessage.includes("hi") ||
      lowerMessage.includes("hello") ||
      lowerMessage.includes("hey")
    ) {
      return "Hello! How can I assist you today?";
    }

    if (
      lowerMessage.includes("services") ||
      lowerMessage.includes("what services")
    ) {
      return `We provide various services including: ${categories.join(", ")}. Let me know which one you need!`;
    }

    if (
      lowerMessage.includes("find") ||
      lowerMessage.includes("need") ||
      lowerMessage.includes("looking for")
    ) {
      const matchedSellers = sellers.filter((seller) =>
        lowerMessage.includes(seller.category.toLowerCase())
      );

      if (matchedSellers.length > 0) {
        return `I found some sellers for ${matchedSellers[0].category}:
${matchedSellers
          .map((seller) => `${seller.name} - ${seller.city}`)
          .join("\n")}. You can search on the homepage for more details!`;
      } else {
        return "Sorry, I couldn't find any sellers for that service. Try searching on the homepage!";
      }
    }

    return "I'm here to help! You can ask me about available services and sellers.";
  };

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: "user" };
    setMessages([...messages, userMessage]);

    setTimeout(() => {
      const botReply = { text: generateBotResponse(input), sender: "bot" };
      setMessages((prevMessages) => [...prevMessages, botReply]);
    }, 1000);

    setInput("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-20 right-6 bg-white w-80 shadow-lg rounded-lg border">
      <div className="bg-green-600 text-white p-3 flex justify-between items-center rounded-t-lg">
        <span className="font-bold">AI Chatbot</span>
        <button onClick={onClose} className="text-white">
          <FiX size={20} />
        </button>
      </div>
      <div className="p-4 max-h-60 overflow-y-auto">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 my-1 max-w-[80%] rounded-lg ${
              msg.sender === "user"
                ? "ml-auto bg-green-200 text-gray-800"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <div className="p-2 border-t flex">
        <input
          type="text"
          className="flex-grow p-2 border rounded-l-lg outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage} className="bg-green-600 text-white p-2 rounded-r-lg">
          <FiSend size={20} />
        </button>
      </div>
    </div>
  );
}

export default Chatbot;
