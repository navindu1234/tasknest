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
} from "react-icons/fa";

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
    <div className="bg-gradient-to-b from-green-500 to-green-800 min-h-screen">
      <Navbar />

      <div className="max-w-5xl mx-auto pt-6 pb-16 px-4">
        {/* Greeting Message */}
        <div className="mb-6">
          <p className="text-white text-lg font-semibold">
            Welcome back, {user.username}!
          </p>
        </div>

        {/* Profile Header */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="relative bg-green-600 h-40">
            <div className="absolute -bottom-16 left-6">
              <div className="relative">
                <img
                  src={user.profileImage}
                  alt="Profile"
                  className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-md"
                />
                <button
                  className="absolute bottom-0 right-0 bg-green-500 p-2 rounded-full text-white hover:bg-green-700"
                  onClick={() => navigate("/edit-profile")}
                >
                  <FaEdit size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="pt-20 px-6 pb-8">
            <div className="flex justify-between items-start flex-wrap">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{user.fullName}</h1>
                <p className="text-gray-500">{user.email}</p>
              </div>
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full mt-2 sm:mt-0">
                <span className="flex items-center">
                  <FaStore className="mr-2" /> {user.sellersCount} Sellers
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{user.phone}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="font-medium">2023</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500">Username</p>
                <p className="font-medium">{user.username}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium truncate">{user.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-10">
          {[
            { icon: <FaShoppingBag />, label: "Orders", value: user.ordersCount },
            { icon: <FaStar />, label: "Reviews", value: user.reviewsCount },
            { icon: <FaStore />, label: "Sellers", value: user.sellersCount },
            { icon: <FaUserTie />, label: "Account", value: 1 },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-5 shadow-md text-center hover:shadow-lg transition"
            >
              <div className="bg-green-100 text-green-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                {stat.icon}
              </div>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-gray-600 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Order History */}
        <div className="bg-white mt-10 rounded-2xl p-6 shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Orders</h2>
          {user.orderHistory.length > 0 ? (
            <div className="space-y-4">
              {user.orderHistory.slice(0, 3).map((order, i) => (
                <div key={i} className="border-b pb-3 last:border-0 flex justify-between items-center">
                  <div>
                    <p className="font-medium">Order #{i + 1}</p>
                    <p className="text-gray-500 text-sm">{order}</p>
                  </div>
                  <button className="text-green-600 font-medium hover:underline">
                    View Details
                  </button>
                </div>
              ))}
              {user.orderHistory.length > 3 && (
                <button
                  className="mt-2 text-green-600 font-medium hover:underline text-sm"
                  onClick={() => navigate("/orders")}
                >
                  View all orders ({user.orderHistory.length})
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">You haven't placed any orders yet.</p>
              <button
                className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                onClick={() => navigate("/shop")}
              >
                Start Shopping
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          <button
            onClick={() => navigate("/sellerlogin")}
            className="bg-white text-green-600 border border-green-600 rounded-xl py-3 px-6 shadow hover:bg-green-50 flex items-center justify-center transition"
          >
            <FaUserTie className="mr-2" /> Seller Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="bg-white text-red-600 border border-red-600 rounded-xl py-3 px-6 shadow hover:bg-red-50 flex items-center justify-center transition"
          >
            <FaSignOutAlt className="mr-2" /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
