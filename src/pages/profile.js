import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../components/firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Navbar from "../components/navbar";
import {
  FaUserTie,
  FaSignOutAlt,
  FaEdit,
  FaShoppingBag,
  FaStar,
  FaStore,
  FaHistory,
  FaPhone,
  FaCalendarAlt,
  FaUserAlt,
  FaEnvelope
} from "react-icons/fa";
import { FiChevronRight } from "react-icons/fi";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    username: "",
    email: "",
    fullName: "",
    phone: "",
    ordersCount: 0,
    reviewsCount: 0,
    sellersCount: 0,
    profileImage: "https://via.placeholder.com/150",
    orderHistory: [],
    joinDate: "2023"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              username: userData.username || "",
              email: userData.email || "",
              fullName: userData.fullName || userData.username || "",
              phone: userData.phone || "Not provided",
              ordersCount: userData.ordersCount || 0,
              reviewsCount: userData.reviewsCount || 0,
              sellersCount: userData.sellersCount || 0,
              profileImage: userData.profileImage || "https://via.placeholder.com/150",
              orderHistory: userData.orderHistory || [],
              joinDate: userData.joinDate || "2023"
            });
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-green-500 to-green-800">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-white border-b-4"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-500 to-green-800 relative overflow-hidden">
      {/* Background Design */}
      <div className="absolute inset-0 -z-10 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-green-800/20"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-[20vw] font-bold tracking-widest opacity-5 select-none">
            TASKNEST
          </div>
        </div>
      </div>

      <Navbar />

      <div className="max-w-6xl mx-auto pt-6 pb-16 px-4">
        {/* Greeting Message */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Hello, <span className="text-yellow-300">{user.username}</span>!
          </h1>
          <p className="text-white/90 mt-2">Welcome back to your profile</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden">
          {/* Profile Header */}
          <div className="relative bg-gradient-to-r from-green-600 to-green-700 h-40">
            <div className="absolute -bottom-16 left-6">
              <div className="relative">
                <img
                  src={user.profileImage}
                  alt="Profile"
                  className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg"
                />
                <button
                  className="absolute bottom-0 right-0 bg-green-500 hover:bg-green-600 p-2 rounded-full text-white transition-all shadow-md"
                  onClick={() => navigate("/edit-profile")}
                  aria-label="Edit profile"
                >
                  <FaEdit size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="pt-20 px-6 pb-6">
            <div className="flex flex-wrap justify-between items-start gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{user.fullName}</h1>
                <p className="text-gray-600">{user.email}</p>
              </div>
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-medium flex items-center">
                <FaStore className="mr-2" /> {user.sellersCount} Services
              </div>
            </div>

            {/* Profile Details Grid */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { icon: <FaPhone className="text-green-600" />, label: "Phone", value: user.phone },
                { icon: <FaCalendarAlt className="text-green-600" />, label: "Member Since", value: user.joinDate },
                { icon: <FaUserAlt className="text-green-600" />, label: "Username", value: user.username },
                { icon: <FaEnvelope className="text-green-600" />, label: "Email", value: user.email }
              ].map((item, index) => (
                <div key={index} className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-md transition">
                  <div className="flex items-center mb-1">
                    {item.icon}
                    <span className="ml-2 text-sm text-gray-500">{item.label}</span>
                  </div>
                  <p className="font-medium text-gray-800 truncate">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
          {[
            { icon: <FaShoppingBag className="text-white" size={20} />, label: "Orders", value: user.ordersCount, color: "from-green-500 to-green-600" },
            { icon: <FaStar className="text-white" size={20} />, label: "Reviews", value: user.reviewsCount, color: "from-yellow-500 to-yellow-600" },
            { icon: <FaStore className="text-white" size={20} />, label: "Services", value: user.sellersCount, color: "from-blue-500 to-blue-600" },
            { icon: <FaUserTie className="text-white" size={20} />, label: "Account", value: "Active", color: "from-purple-500 to-purple-600" }
          ].map((stat, index) => (
            <div 
              key={index} 
              className={`bg-gradient-to-r ${stat.color} rounded-2xl p-5 shadow-lg text-white hover:shadow-xl transition cursor-pointer`}
              onClick={() => index === 0 ? navigate("/home") : index === 1 ? navigate("/home") : null}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm opacity-90">{stat.label}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order History Section */}
        <div className="bg-white/90 backdrop-blur-sm mt-8 rounded-2xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <FaHistory className="mr-2 text-green-600" /> Recent Orders
            </h2>
            {user.orderHistory.length > 0 && (
              <button 
                onClick={() => navigate("/orders")}
                className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center"
              >
                View All <FiChevronRight className="ml-1" />
              </button>
            )}
          </div>

          {user.orderHistory.length > 0 ? (
            <div className="space-y-4">
              {user.orderHistory.slice(0, 3).map((order, i) => (
                <div 
                  key={i} 
                  className="bg-white p-4 rounded-xl border border-gray-200 hover:border-green-300 transition cursor-pointer"
                  onClick={() => navigate(`/orders/${i}`)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800">Order #{i + 1}</p>
                      <p className="text-gray-500 text-sm mt-1">{order}</p>
                    </div>
                    <div className="text-green-600">
                      <FiChevronRight />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <img 
                src={`${process.env.PUBLIC_URL}/empty-orders.svg`} 
                alt="No orders" 
                className="w-40 mx-auto mb-4 opacity-70"
              />
              <p className="text-gray-600 mb-4">You haven't placed any orders yet</p>
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition flex items-center mx-auto"
                onClick={() => navigate("/home")}
              >
                <FaShoppingBag className="mr-2" /> Explore Services
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <button
            onClick={() => navigate("/sellerlogin")}
            className="bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 rounded-xl py-4 px-6 shadow-sm hover:shadow-md transition flex items-center justify-center"
          >
            <FaUserTie className="mr-3 text-green-600" />
            <div className="text-left">
              <p className="font-medium">Seller Dashboard</p>
              <p className="text-xs text-gray-500">Manage your services</p>
            </div>
          </button>
          <button
            onClick={handleLogout}
            className="bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 rounded-xl py-4 px-6 shadow-sm hover:shadow-md transition flex items-center justify-center"
          >
            <FaSignOutAlt className="mr-3 text-red-500" />
            <div className="text-left">
              <p className="font-medium">Sign Out</p>
              <p className="text-xs text-gray-500">Logout from your account</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;