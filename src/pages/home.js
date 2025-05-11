import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { FiMessageCircle, FiSearch, FiChevronRight, FiAward, FiClock, FiUsers } from "react-icons/fi";
import { FaStar, FaCheck, FaDollarSign, FaShieldAlt, FaRobot } from "react-icons/fa";
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 text-green-900 relative overflow-x-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10 opacity-5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0icmdiYSgwLDAsMCwwLjAyKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXR0ZXJuKSIvPjwvc3ZnPg==')]"></div>
      </div>

      <Navbar />

      {/* Full-width hero section */}
      <div className="w-full bg-gradient-to-r from-green-500 to-green-600 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white leading-tight">
            Find <span className="text-yellow-300">Trusted</span> Home Services
          </h1>
          <p className="text-xl md:text-2xl text-green-100 max-w-4xl mx-auto mb-8">
            Book professional services with confidence. All our providers are verified and background-checked.
          </p>
          
          {/* Search Bar */}
          <div className="flex justify-center items-center mb-8 max-w-3xl mx-auto relative">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="What service are you looking for?"
                className="p-5 pr-20 w-full border-none rounded-full shadow-2xl text-green-900 focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-opacity-50 transition-all duration-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-green-700 hover:bg-green-800 text-white p-4 rounded-full transition-all shadow-lg hover:shadow-xl">
                <FiSearch size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        {/* Filtered Results */}
        {searchQuery && (
          <div className="bg-white bg-opacity-95 backdrop-blur-md text-green-900 p-8 rounded-2xl shadow-2xl mb-12 mx-auto border border-green-200">
            <h3 className="font-semibold text-2xl mb-6 flex items-center text-green-800">
              <FiSearch className="mr-3 text-green-600" /> Search Results
            </h3>
            {filteredCategories.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCategories.map((category, index) => (
                  <Link
                    key={index}
                    to={`/search/${encodeURIComponent(category)}`}
                    className="bg-white p-6 rounded-xl border border-green-100 hover:border-green-300 transition-all hover:shadow-lg hover:scale-[1.02]"
                  >
                    <div className="flex items-center">
                      <img
                        src={categoryImages[index % categoryImages.length]}
                        alt={category}
                        className="w-16 h-16 object-cover rounded-lg mr-5"
                      />
                      <span className="text-lg text-green-800 font-medium">{category}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-green-700 mb-6 text-xl">No services found matching "{searchQuery}"</p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-green-600 hover:text-green-800 text-lg font-medium flex items-center justify-center mx-auto"
                >
                  Clear search <FiChevronRight className="ml-2" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Main Carousel - Full width */}
        <div className="w-full rounded-3xl overflow-hidden shadow-3xl border-4 border-white my-16">
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
                  className="w-full h-[30rem] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-green-900/90 via-green-900/40 to-transparent flex flex-col justify-end p-12">
                  <div className="max-w-2xl">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                      {index === 0 && "Quality Services On Demand"}
                      {index === 1 && "Verified Professionals"}
                      {index === 2 && "Satisfaction Guaranteed"}
                    </h2>
                    <p className="text-green-100 mb-8 text-xl">
                      {index === 0 && "Find the perfect professional for any home service need"}
                      {index === 1 && "All our service providers are background-checked and verified"}
                      {index === 2 && "We stand behind every service with our satisfaction guarantee"}
                    </p>
                    <button className="bg-green-600 hover:bg-green-700 text-white px-10 py-4 rounded-full font-semibold transition-all flex items-center shadow-xl hover:shadow-2xl transform hover:-translate-y-1 text-lg">
                      Book Now <FiChevronRight className="ml-3" size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </Carousel>
        </div>

        {/* Advertisement Banners - Full width */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 my-16 w-full">
          {ads.map((ad, index) => (
            <div 
              key={index}
              className={`${ad.bg} p-10 rounded-3xl shadow-2xl text-white hover:shadow-3xl transition-all transform hover:-translate-y-2 h-full`}
            >
              <div className="flex items-start h-full">
                <div className="bg-white/20 p-4 rounded-full mr-6 flex-shrink-0">
                  {ad.icon}
                </div>
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <h3 className="text-3xl font-bold mb-4">{ad.title}</h3>
                    <p className="text-xl mb-8 opacity-90">{ad.desc}</p>
                  </div>
                  <button className="bg-white text-green-700 px-8 py-3 rounded-full font-semibold hover:bg-gray-50 transition-all flex items-center w-fit shadow-lg hover:shadow-xl text-lg">
                    {ad.cta} <FiChevronRight className="ml-3" size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* AI Assistant Section - Full width */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-3xl overflow-hidden shadow-3xl mb-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-12 text-white flex flex-col justify-center">
              <div className="flex items-center mb-6">
                <FaRobot className="text-yellow-300 mr-4" size={40} />
                <h2 className="text-4xl font-bold">AI Service Assistant</h2>
              </div>
              <p className="text-green-100 mb-8 text-xl">
                Our smart AI helps you find the perfect service match instantly. 
                Just describe what you need and we'll recommend the best providers.
              </p>
              <button 
                onClick={() => setChatOpen(true)}
                className="bg-white text-green-700 px-10 py-4 rounded-full font-semibold hover:bg-gray-50 transition-all flex items-center w-fit shadow-xl hover:shadow-2xl text-lg"
              >
                Try AI Assistant <FiChevronRight className="ml-3" size={20} />
              </button>
            </div>
            <div className="hidden lg:block relative min-h-[400px]">
              <img 
                src={`${process.env.PUBLIC_URL}/ai-assistant.jpg`} 
                alt="AI Assistant" 
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-green-600/30 to-green-600/0"></div>
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="mb-20 w-full">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-green-900">
              Popular <span className="text-green-600">Services</span>
            </h2>
            <p className="text-xl text-green-700 mt-4 max-w-3xl mx-auto">
              Browse our most requested home service categories
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {categories.map((category, index) => (
              <Link
                to={`/search/${encodeURIComponent(category)}`}
                key={index}
                className="group bg-white hover:bg-green-50 text-green-900 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100 flex flex-col items-center text-center"
              >
                <div className="overflow-hidden rounded-lg mb-5 w-full h-48">
                  <img
                    src={categoryImages[index % categoryImages.length]}
                    alt={category}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <h3 className="font-semibold text-xl group-hover:text-green-600 transition">
                  {category}
                </h3>
              </Link>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 w-full">
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-green-100 text-center hover:shadow-2xl transition-all">
            <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiUsers className="text-green-600" size={40} />
            </div>
            <h3 className="text-5xl font-bold text-green-800 mb-3">10,000+</h3>
            <p className="text-green-600 font-medium text-xl">Happy Customers</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-green-100 text-center hover:shadow-2xl transition-all">
            <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiAward className="text-green-600" size={40} />
            </div>
            <h3 className="text-5xl font-bold text-green-800 mb-3">500+</h3>
            <p className="text-green-600 font-medium text-xl">Verified Professionals</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-green-100 text-center hover:shadow-2xl transition-all">
            <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiClock className="text-green-600" size={40} />
            </div>
            <h3 className="text-5xl font-bold text-green-800 mb-3">24/7</h3>
            <p className="text-green-600 font-medium text-xl">Support Available</p>
          </div>
        </div>

        {/* Value Proposition Section */}
        <div className="bg-white text-green-900 rounded-3xl p-10 shadow-2xl mb-20 w-full border border-green-100">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6 text-green-900">
              Why Choose <span className="text-green-600">TaskNest</span>?
            </h2>
            <p className="text-xl text-green-700 mb-16 max-w-4xl mx-auto">
              We connect you with trusted professionals for all your home service needs
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="bg-green-50 p-8 rounded-2xl border border-green-100 hover:border-green-300 transition-all hover:shadow-lg">
                <div className="bg-green-600 text-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaCheck size={30} />
                </div>
                <h3 className="font-bold mb-4 text-2xl text-green-900">Verified Providers</h3>
                <p className="text-green-700 text-lg">Background checked professionals with verified credentials</p>
              </div>
              <div className="bg-green-50 p-8 rounded-2xl border border-green-100 hover:border-green-300 transition-all hover:shadow-lg">
                <div className="bg-green-600 text-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaDollarSign size={30} />
                </div>
                <h3 className="font-bold mb-4 text-2xl text-green-900">Fair Pricing</h3>
                <p className="text-green-700 text-lg">Transparent pricing with no hidden charges</p>
              </div>
              <div className="bg-green-50 p-8 rounded-2xl border border-green-100 hover:border-green-300 transition-all hover:shadow-lg">
                <div className="bg-green-600 text-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaShieldAlt size={30} />
                </div>
                <h3 className="font-bold mb-4 text-2xl text-green-900">Quality Guarantee</h3>
                <p className="text-green-700 text-lg">Satisfaction guaranteed or your money back</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full-width Footer */}
      <footer className="w-full bg-green-900 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <h3 className="text-3xl font-bold mb-6">TaskNest</h3>
              <p className="text-green-300 mb-6 text-lg">
                Making home services accessible and reliable for everyone.
              </p>
              <p className="text-green-400 text-lg">
                © 2015-{new Date().getFullYear()} NestTech Innovations
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-xl mb-6">Services</h4>
              <ul className="space-y-4">
                {categories.slice(0, 5).map((category, index) => (
                  <li key={index}>
                    <a href="#" className="text-green-300 hover:text-white transition text-lg">
                      {category}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-xl mb-6">Company</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-green-300 hover:text-white transition text-lg">About Us</a></li>
                <li><a href="#" className="text-green-300 hover:text-white transition text-lg">Careers</a></li>
                <li><a href="#" className="text-green-300 hover:text-white transition text-lg">Blog</a></li>
                <li><a href="#" className="text-green-300 hover:text-white transition text-lg">Press</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-xl mb-6">Support</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-green-300 hover:text-white transition text-lg">Help Center</a></li>
                <li><a href="#" className="text-green-300 hover:text-white transition text-lg">Safety Center</a></li>
                <li><a href="#" className="text-green-300 hover:text-white transition text-lg">Community Guidelines</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-green-800 mt-16 pt-8 text-center">
            <p className="text-green-400 text-lg">
              NestTech Innovations - Revolutionizing home services since 2015
            </p>
          </div>
        </div>
      </footer>

      {/* Chat Button */}
      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-8 right-8 bg-green-600 hover:bg-green-700 text-white p-6 rounded-full shadow-2xl hover:shadow-3xl transition-all flex items-center space-x-3 z-20 animate-bounce"
      >
        <FiMessageCircle size={32} />
        <span className="hidden md:inline font-bold text-xl">Need Help?</span>
      </button>

      {/* Chatbot */}
      <Chatbot isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}

export default Home;