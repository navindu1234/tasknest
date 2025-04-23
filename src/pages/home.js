import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { FiMessageCircle } from "react-icons/fi";
import Navbar from "../components/navbar";
import Chatbot from "../components/chatbot";

function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [chatOpen, setChatOpen] = useState(false);

  const categories = [
    "House Cleaning", "Garage Labor", "Electrician", "Gardening Services",
    "Pest Control", "Moving and Packing Services", "Laundry and Ironing Services",
    "House Painting Services", "Car Repairs and Maintenance", "Cooking Services",
    "Home Renovation Services",
  ];

  const categoryImages = [
    `${process.env.PUBLIC_URL}/image1.png`,
    `${process.env.PUBLIC_URL}/image2.png`,
    `${process.env.PUBLIC_URL}/image3.png`,
    `${process.env.PUBLIC_URL}/image4.png`,
    `${process.env.PUBLIC_URL}/image5.png`,
    `${process.env.PUBLIC_URL}/image6.png`,
    `${process.env.PUBLIC_URL}/image7.png`,
    `${process.env.PUBLIC_URL}/image8.png`,
    `${process.env.PUBLIC_URL}/image9.png`,
    `${process.env.PUBLIC_URL}/image10.png`,
  ];

  const sliderImages = [
    `${process.env.PUBLIC_URL}/slider1.jpeg`,
    `${process.env.PUBLIC_URL}/slider2.jpeg`,
  ];

  const filteredCategories = categories.filter((category) =>
    category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-gradient-to-b from-green-500 to-green-800 min-h-screen text-white">
      <Navbar />

      <div className="container mx-auto py-8 px-4">
        {/* Search Bar */}
        <div className="flex justify-center items-center mb-8">
          <input
            type="text"
            placeholder="Search for services..."
            className="p-3 w-4/5 md:w-2/3 lg:w-1/2 border-none rounded-l-full shadow-xl text-gray-900 focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="bg-white text-green-600 px-6 py-3 rounded-r-full shadow-xl font-bold hover:bg-green-100 transition">
            Search
          </button>
        </div>

        {/* Filtered Results */}
        {searchQuery && (
          <div className="bg-white text-black p-4 rounded-lg shadow-lg mb-6">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category, index) => (
                <div key={index} className="py-2 border-b last:border-b-0 border-gray-300">
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

        {/* Image Slider */}
        <div className="max-w-5xl mx-auto mt-10 rounded-xl overflow-hidden shadow-2xl">
          <Carousel
            showThumbs={false}
            autoPlay
            infiniteLoop
            showStatus={false}
            showArrows={true}
            interval={5000}
            className="rounded-xl"
          >
            {sliderImages.map((image, index) => (
              <div key={index}>
                <img
                  src={image}
                  alt={`slider ${index + 1}`}
                  className="w-full h-72 object-cover"
                />
              </div>
            ))}
          </Carousel>
        </div>

        {/* Categories */}
        <h2 className="text-3xl font-bold text-center mt-14">Explore Categories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
          {categories.map((category, index) => (
            <Link
              to={`/search/${encodeURIComponent(category)}`}
              key={index}
              className="bg-white text-gray-800 p-5 rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 flex flex-col items-center"
            >
              <img
                src={categoryImages[index % categoryImages.length]}
                alt={category}
                className="w-full h-28 object-cover rounded-md mb-4"
              />
              <h3 className="text-lg font-semibold text-center">{category}</h3>
            </Link>
          ))}
        </div>
      </div>

      {/* Chat Button */}
      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-6 right-6 bg-white text-green-600 p-4 rounded-full shadow-lg hover:bg-green-100 flex items-center space-x-2"
      >
        <FiMessageCircle size={24} />
        <span className="hidden md:inline font-bold">Chat with AI</span>
      </button>

      {/* Chatbot */}
      <Chatbot isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}

export default Home;
