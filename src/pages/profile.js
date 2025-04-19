import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../components/firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Navbar from "../components/navbar";
import { FaUserTie, FaSignOutAlt, FaEdit, FaShoppingBag, FaStar, FaStore } from "react-icons/fa";

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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-green-500 to-green-800 min-h-screen flex flex-col relative">
      <Navbar />
      
      <div className="fixed bottom-4 left-4 bg-green-600 text-white p-3 rounded-lg shadow-lg z-10 animate-bounce">
        <p className="font-semibold">Welcome back, {user.username}!</p>
      </div>

      <div className="flex justify-center pt-6 pb-12 px-4">
        <div className="w-full max-w-4xl">
          {/* Profile Header */}
          <div className="bg-white rounded-t-3xl shadow-xl overflow-hidden">
            <div className="relative h-48 bg-green-600">
              <div className="absolute -bottom-16 left-6">
                <div className="relative">
                  <img
                    src={user.profileImage}
                    alt="Profile"
                    className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg"
                  />
                  <button 
                    className="absolute bottom-0 right-0 bg-green-500 p-2 rounded-full text-white hover:bg-green-600 transition"
                    onClick={() => navigate("/edit-profile")}
                  >
                    <FaEdit size={16} />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="pt-20 px-6 pb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">{user.fullName}</h1>
                  <p className="text-gray-600">{user.email}</p>
                </div>
                <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-medium">
                  <span className="flex items-center">
                    <FaStore className="mr-2" /> {user.sellersCount} Sellers
                  </span>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-gray-500 text-sm">Phone</p>
                  <p className="font-medium">{user.phone}</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-gray-500 text-sm">Member Since</p>
                  <p className="font-medium">2023</p>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white p-4 rounded-xl shadow-md text-center">
              <div className="bg-green-100 text-green-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <FaShoppingBag size={20} />
              </div>
              <p className="text-2xl font-bold text-gray-800">{user.ordersCount}</p>
              <p className="text-gray-600 text-sm">Orders</p>
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow-md text-center">
              <div className="bg-green-100 text-green-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <FaStar size={20} />
              </div>
              <p className="text-2xl font-bold text-gray-800">{user.reviewsCount}</p>
              <p className="text-gray-600 text-sm">Reviews</p>
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow-md text-center">
              <div className="bg-green-100 text-green-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <FaStore size={20} />
              </div>
              <p className="text-2xl font-bold text-gray-800">{user.sellersCount}</p>
              <p className="text-gray-600 text-sm">Sellers</p>
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow-md text-center">
              <div className="bg-green-100 text-green-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <FaUserTie size={20} />
              </div>
              <p className="text-2xl font-bold text-gray-800">1</p>
              <p className="text-gray-600 text-sm">Account</p>
            </div>
          </div>

          {/* Order History */}
          <div className="bg-white rounded-xl shadow-md mt-6 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Orders</h2>
            {user.orderHistory.length > 0 ? (
              <div className="space-y-4">
                {user.orderHistory.slice(0, 3).map((order, index) => (
                  <div key={index} className="border-b pb-3 last:border-0">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Order #{index + 1}</p>
                        <p className="text-gray-600 text-sm">{order}</p>
                      </div>
                      <button className="text-green-600 text-sm font-medium hover:text-green-700">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
                {user.orderHistory.length > 3 && (
                  <button 
                    className="text-green-600 font-medium hover:text-green-700 text-sm"
                    onClick={() => navigate("/orders")}
                  >
                    View all orders ({user.orderHistory.length})
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No orders yet</p>
                <button 
                  className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                  onClick={() => navigate("/shop")}
                >
                  Start Shopping
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <button
              onClick={() => navigate("/sellerlogin")}
              className="bg-white text-green-600 border border-green-600 rounded-xl p-4 shadow-md hover:bg-green-50 transition flex items-center justify-center"
            >
              <FaUserTie className="mr-3" size={18} />
              <span>Seller Dashboard</span>
            </button>
            
            <button
              onClick={handleLogout}
              className="bg-white text-red-600 border border-red-600 rounded-xl p-4 shadow-md hover:bg-red-50 transition flex items-center justify-center"
            >
              <FaSignOutAlt className="mr-3" size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;