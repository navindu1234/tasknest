import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { FiMessageCircle } from "react-icons/fi";
import Navbar from "../components/navbar";
import Chatbot from "../components/chatbot"; // Import Chatbot component

function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [chatOpen, setChatOpen] = useState(false); // State for chatbot visibility

  const categories = [
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
  ];

  const categoryImages = [
    "/image1.png",
    "/image2.png",
    "/image3.png",
    "/image4.png",
    "/image5.png",
    "/image6.png",
    "/image7.png",
    "/image8.png",
    "/image9.png",
    "/image10.png",
  ];

  const sliderImages = ["/slider1.jpeg", "/slider2.jpeg"];

  const filteredCategories = categories.filter((category) =>
    category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-gradient-to-b from-green-500 to-green-800 min-h-screen text-white">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        
        {/* 🔍 Search Bar */}
        <div className="flex justify-center items-center mb-6">
          <input
            type="text"
            placeholder="Search for services..."
            className="p-3 w-3/4 md:w-1/2 border-none rounded-l-full shadow-xl text-gray-900"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="bg-white text-green-600 px-6 py-3 rounded-r-full shadow-xl font-bold hover:bg-green-100">
            Search
          </button>
        </div>

        {/* 🔎 Search Results */}
        {searchQuery && (
          <div className="bg-white text-black p-4 rounded-lg shadow-lg">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category, index) => (
                <div key={index} className="py-2 border-b border-gray-300">
                  <Link
                    to={`/search/${encodeURIComponent(category)}`}
                    className="text-green-700 hover:underline"
                  >
                    {category}
                  </Link>
                </div>
              ))
            ) : (
              <p>No results found</p>
            )}
          </div>
        )}

        {/* 🎞️ Image Slider */}
        <div className="max-w-4xl mx-auto mt-6">
          <Carousel
            showThumbs={false}
            autoPlay
            infiniteLoop
            showStatus={false}
            showArrows={true}
            className="max-w-3xl mx-auto mt-6 rounded-lg shadow-lg"
          >
            {sliderImages.map((image, index) => (
              <div key={index} className="relative flex justify-center items-center">
                <img src={image} alt={`slider ${index + 1}`} className="rounded-lg shadow-lg w-full h-72 object-cover" />
              </div>
            ))}
          </Carousel>
        </div>

        {/* 🏷️ Service Categories */}
        <h2 className="text-3xl font-bold text-center mt-12">Explore Categories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6 px-4">
          {categories.map((category, index) => (
            <Link
              to={`/search/${encodeURIComponent(category)}`}
              key={index}
              className="bg-white text-gray-800 p-4 rounded-lg shadow-lg hover:shadow-xl transition flex flex-col items-center text-center"
            >
              <img
                src={categoryImages[index % categoryImages.length]}
                alt={category}
                className="w-full h-28 object-cover rounded-md mb-3"
              />
              <h3 className="text-lg font-semibold">{category}</h3>
            </Link>
          ))}
        </div>
      </div>

      {/* 💬 Chat with AI Button */}
      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-6 right-6 bg-white text-green-600 p-4 rounded-full shadow-lg hover:bg-green-100 flex items-center space-x-2"
      >
        <FiMessageCircle size={24} />
        <span className="hidden md:inline font-bold">Chat with AI</span>
      </button>

      {/* 🧠 AI Chatbot Component */}
      <Chatbot isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}

export default Home;
