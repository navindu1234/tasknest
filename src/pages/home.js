import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { FiMessageCircle, FiSearch, FiChevronRight } from "react-icons/fi";
import { FaStar, FaCheck, FaDollarSign, FaShieldAlt } from "react-icons/fa";
import Navbar from "../components/navbar";
import Chatbot from "../components/chatbot";

function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [chatOpen, setChatOpen] = useState(false);

  const categories = [
    "House Cleaning", "Garage Labor", "Electrician", "Gardening Services",
    "Pest Control", "Moving Services", "Laundry Services",
    "House Painting", "Car Repairs", "Cooking Services",
    "Home Renovation", "Plumbing", "AC Repair"
  ];

  const categoryImages = [
    `${process.env.PUBLIC_URL}/cleaning.jpg`,
    `${process.env.PUBLIC_URL}/garage.jpg`,
    `${process.env.PUBLIC_URL}/electrician.jpg`,
    `${process.env.PUBLIC_URL}/gardening.jpg`,
    `${process.env.PUBLIC_URL}/pest.jpg`,
    `${process.env.PUBLIC_URL}/moving.jpg`,
    `${process.env.PUBLIC_URL}/laundry.jpg`,
    `${process.env.PUBLIC_URL}/painting.jpg`,
    `${process.env.PUBLIC_URL}/car.jpg`,
    `${process.env.PUBLIC_URL}/cooking.jpg`,
    `${process.env.PUBLIC_URL}/renovation.jpg`,
    `${process.env.PUBLIC_URL}/plumbing.jpg`,
    `${process.env.PUBLIC_URL}/ac.jpg`
  ];

  const sliderImages = [
    `${process.env.PUBLIC_URL}/banner1.jpg`,
    `${process.env.PUBLIC_URL}/banner2.jpg`,
    `${process.env.PUBLIC_URL}/banner3.jpg`
  ];

  const ads = [
    {
      icon: <FaStar className="text-yellow-400" size={24} />,
      title: "Premium Service Providers",
      desc: "Verified professionals for all your needs",
      cta: "Explore Now",
      bg: "bg-gradient-to-r from-green-600 to-green-700"
    },
    {
      icon: <FaDollarSign className="text-yellow-400" size={24} />,
      title: "20% Off First Booking",
      desc: "Use code TASKNEST20 at checkout",
      cta: "Book Now",
      bg: "bg-gradient-to-r from-green-700 to-green-800"
    }
  ];

  const filteredCategories = categories.filter((category) =>
    category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white text-green-900 relative overflow-hidden">
      {/* Background Design - Enhanced Green Theme */}
      <div className="absolute inset-0 -z-10 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-green-800/20"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-[20vw] font-bold tracking-widest opacity-5 select-none text-green-800">
            TASKNEST
          </div>
        </div>
      </div>

      <Navbar />

      <div className="max-w-6xl mx-auto pt-6 pb-16 px-4">
        {/* Hero Section with Green Accents */}
        <div className="text-center mb-12 mt-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-green-800">
            Find Trusted <span className="text-green-600">Service Providers</span>
          </h1>
          <p className="text-xl md:text-2xl text-green-700 max-w-3xl mx-auto">
            Book home services at your convenience with verified professionals
          </p>
        </div>

        {/* Search Bar - Green Theme */}
        <div className="flex justify-center items-center mb-8 max-w-4xl mx-auto">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="What service are you looking for?"
              className="p-4 pr-12 w-full border-none rounded-full shadow-lg text-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-600 text-white p-3 rounded-full hover:bg-green-700 transition shadow-md">
              <FiSearch size={20} />
            </button>
          </div>
        </div>

        {/* Filtered Results - Green Card Style */}
        {searchQuery && (
          <div className="bg-white backdrop-blur-sm text-green-900 p-6 rounded-2xl shadow-lg mb-6 max-w-2xl mx-auto border border-green-100">
            <h3 className="font-semibold text-lg mb-4 flex items-center text-green-700">
              <FiSearch className="mr-2 text-green-600" /> Search Results
            </h3>
            {filteredCategories.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredCategories.map((category, index) => (
                  <Link
                    key={index}
                    to={`/search/${encodeURIComponent(category)}`}
                    className="bg-white p-4 rounded-xl border border-green-100 hover:border-green-300 transition hover:shadow-md"
                  >
                    <div className="flex items-center">
                      <img
                        src={categoryImages[index % categoryImages.length]}
                        alt={category}
                        className="w-12 h-12 object-cover rounded-lg mr-3"
                      />
                      <span className="text-green-700 font-medium">{category}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-green-700 mb-4">No services found matching "{searchQuery}"</p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center justify-center mx-auto"
                >
                  Clear search <FiChevronRight className="ml-1" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Main Carousel with Green Overlay */}
        <div className="max-w-6xl mx-auto mt-10 rounded-2xl overflow-hidden shadow-2xl border-4 border-green-100">
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
              <div key={index} className="relative">
                <img
                  src={image}
                  alt={`promo ${index + 1}`}
                  className="w-full h-80 md:h-96 object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-900/80 to-transparent p-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-white">
                    {index === 0 && "Quality Services On Demand"}
                    {index === 1 && "Verified Professionals"}
                    {index === 2 && "Satisfaction Guaranteed"}
                  </h2>
                  <button className="mt-3 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-semibold transition flex items-center mx-auto shadow-lg hover:shadow-xl">
                    Book Now <FiChevronRight className="ml-1" />
                  </button>
                </div>
              </div>
            ))}
          </Carousel>
        </div>

        {/* Advertisement Banners - Green Gradient */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-12">
          {ads.map((ad, index) => (
            <div 
              key={index}
              className={`${ad.bg} p-6 rounded-2xl shadow-lg text-white hover:shadow-xl transition transform hover:-translate-y-1`}
            >
              <div className="flex items-start">
                <div className="bg-white/20 p-3 rounded-full mr-4">
                  {ad.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{ad.title}</h3>
                  <p className="mb-4 opacity-90">{ad.desc}</p>
                  <button className="bg-white text-green-700 px-5 py-2 rounded-full font-semibold hover:bg-gray-100 transition flex items-center shadow-md">
                    {ad.cta} <FiChevronRight className="ml-1" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Categories Section with Green Accents */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-10 text-green-800">
            Popular <span className="text-green-600">Services</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {categories.map((category, index) => (
              <Link
                to={`/search/${encodeURIComponent(category)}`}
                key={index}
                className="group bg-white hover:bg-green-50 text-green-900 p-4 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-green-100"
              >
                <div className="overflow-hidden rounded-lg mb-3">
                  <img
                    src={categoryImages[index % categoryImages.length]}
                    alt={category}
                    className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="font-semibold text-center group-hover:text-green-600 transition">
                  {category}
                </h3>
              </Link>
            ))}
          </div>
        </div>

        {/* Value Proposition Section - Green Cards */}
        <div className="bg-white backdrop-blur-sm text-green-900 rounded-2xl p-8 md:p-12 shadow-xl mb-12 border border-green-100">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-green-800">
              Why Choose <span className="text-green-600">TaskNest</span>?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-white p-6 rounded-xl border border-green-100 hover:border-green-300 transition hover:shadow-md">
                <div className="bg-green-100 text-green-600 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCheck size={20} />
                </div>
                <h3 className="font-bold mb-2 text-green-800">Verified Providers</h3>
                <p className="text-green-700 text-sm">Background checked professionals</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-green-100 hover:border-green-300 transition hover:shadow-md">
                <div className="bg-green-100 text-green-600 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaDollarSign size={20} />
                </div>
                <h3 className="font-bold mb-2 text-green-800">Fair Pricing</h3>
                <p className="text-green-700 text-sm">No hidden charges</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-green-100 hover:border-green-300 transition hover:shadow-md">
                <div className="bg-green-100 text-green-600 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaShieldAlt size={20} />
                </div>
                <h3 className="font-bold mb-2 text-green-800">Quality Guarantee</h3>
                <p className="text-green-700 text-sm">Satisfaction or your money back</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Button - Green Theme */}
      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-6 right-6 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all flex items-center space-x-2 z-20 animate-bounce"
      >
        <FiMessageCircle size={24} />
        <span className="hidden md:inline font-bold">Need Help?</span>
      </button>

      {/* Chatbot */}
      <Chatbot isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}

export default Home;