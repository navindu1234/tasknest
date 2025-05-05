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
    `${process.env.PUBLIC_URL}/image11.png`,
    `${process.env.PUBLIC_URL}/image12.png`,
    `${process.env.PUBLIC_URL}/image13.png`
  ];

  const sliderImages = [
    `${process.env.PUBLIC_URL}/slider1.jpeg`,
    `${process.env.PUBLIC_URL}/slider2.jpg`,
    `${process.env.PUBLIC_URL}/slider3.jpg`
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 text-green-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10 opacity-5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0icmdiYSgwLDAsMCwwLjAyKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXR0ZXJuKSIvPjwvc3ZnPg==')]"></div>
      </div>

      <Navbar />

      <div className="max-w-7xl mx-auto pt-6 pb-16 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12 mt-10">
          <div className="inline-block bg-green-100 px-4 py-2 rounded-full mb-6 shadow-sm">
            <span className="text-green-700 font-medium">Trusted by 10,000+ customers</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-green-900 leading-tight">
            Find <span className="text-green-600">Trusted</span> Home Services
          </h1>
          <p className="text-lg md:text-xl text-green-700 max-w-3xl mx-auto mb-8">
            Book professional services with confidence. All our providers are verified and background-checked.
          </p>
          
          {/* Search Bar */}
          <div className="flex justify-center items-center mb-8 max-w-2xl mx-auto relative">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="What service are you looking for?"
                className="p-4 pr-16 w-full border-none rounded-full shadow-lg text-green-900 focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-opacity-50 transition-all duration-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-600 hover:bg-green-700 text-white p-3 rounded-full transition-all shadow-lg hover:shadow-xl">
                <FiSearch size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Filtered Results */}
        {searchQuery && (
          <div className="bg-white bg-opacity-90 backdrop-blur-md text-green-900 p-6 rounded-2xl shadow-xl mb-8 max-w-3xl mx-auto border border-green-200">
            <h3 className="font-semibold text-xl mb-4 flex items-center text-green-800">
              <FiSearch className="mr-2 text-green-600" /> Search Results
            </h3>
            {filteredCategories.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredCategories.map((category, index) => (
                  <Link
                    key={index}
                    to={`/search/${encodeURIComponent(category)}`}
                    className="bg-white p-4 rounded-xl border border-green-100 hover:border-green-300 transition-all hover:shadow-md hover:scale-[1.02]"
                  >
                    <div className="flex items-center">
                      <img
                        src={categoryImages[index % categoryImages.length]}
                        alt={category}
                        className="w-14 h-14 object-cover rounded-lg mr-4"
                      />
                      <span className="text-green-800 font-medium">{category}</span>
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

        {/* Main Carousel */}
        <div className="max-w-7xl mx-auto mt-10 rounded-3xl overflow-hidden shadow-2xl border-4 border-green-100">
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
                  className="w-full h-80 md:h-[32rem] object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-900/90 to-transparent p-8">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    {index === 0 && "Quality Services On Demand"}
                    {index === 1 && "Verified Professionals"}
                    {index === 2 && "Satisfaction Guaranteed"}
                  </h2>
                  <p className="text-green-100 mb-6 max-w-xl">
                    {index === 0 && "Find the perfect professional for any home service need"}
                    {index === 1 && "All our service providers are background-checked and verified"}
                    {index === 2 && "We stand behind every service with our satisfaction guarantee"}
                  </p>
                  <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-semibold transition-all flex items-center mx-auto shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                    Book Now <FiChevronRight className="ml-2" />
                  </button>
                </div>
              </div>
            ))}
          </Carousel>
        </div>

        {/* Advertisement Banners */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-14">
          {ads.map((ad, index) => (
            <div 
              key={index}
              className={`${ad.bg} p-8 rounded-2xl shadow-lg text-white hover:shadow-xl transition-all transform hover:-translate-y-1`}
            >
              <div className="flex items-start">
                <div className="bg-white/20 p-3 rounded-full mr-5">
                  {ad.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3">{ad.title}</h3>
                  <p className="mb-5 opacity-90">{ad.desc}</p>
                  <button className="bg-white text-green-700 px-6 py-2 rounded-full font-semibold hover:bg-gray-50 transition-all flex items-center shadow-md hover:shadow-lg">
                    {ad.cta} <FiChevronRight className="ml-2" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Categories Section */}
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

        {/* Value Proposition Section */}
        <div className="bg-white text-green-900 rounded-3xl p-8 md:p-12 shadow-xl mb-16 border border-green-100">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-green-900">
              Why Choose <span className="text-green-600">TaskNest</span>?
            </h2>
            <p className="text-lg text-green-700 mb-12 max-w-3xl mx-auto">
              We connect you with trusted professionals for all your home service needs
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-green-50 p-6 rounded-xl border border-green-100 hover:border-green-300 transition-all hover:shadow-md">
                <div className="bg-green-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5">
                  <FaCheck size={24} />
                </div>
                <h3 className="font-bold mb-3 text-xl text-green-900">Verified Providers</h3>
                <p className="text-green-700">Background checked professionals with verified credentials</p>
              </div>
              <div className="bg-green-50 p-6 rounded-xl border border-green-100 hover:border-green-300 transition-all hover:shadow-md">
                <div className="bg-green-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5">
                  <FaDollarSign size={24} />
                </div>
                <h3 className="font-bold mb-3 text-xl text-green-900">Fair Pricing</h3>
                <p className="text-green-700">Transparent pricing with no hidden charges</p>
              </div>
              <div className="bg-green-50 p-6 rounded-xl border border-green-100 hover:border-green-300 transition-all hover:shadow-md">
                <div className="bg-green-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5">
                  <FaShieldAlt size={24} />
                </div>
                <h3 className="font-bold mb-3 text-xl text-green-900">Quality Guarantee</h3>
                <p className="text-green-700">Satisfaction guaranteed or your money back</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Button */}
      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-8 right-8 bg-green-600 hover:bg-green-700 text-white p-5 rounded-full shadow-2xl hover:shadow-3xl transition-all flex items-center space-x-2 z-20 animate-bounce"
      >
        <FiMessageCircle size={28} />
        <span className="hidden md:inline font-bold text-lg">Need Help?</span>
      </button>

      {/* Chatbot */}
      <Chatbot isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}

export default Home;