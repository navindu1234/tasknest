import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { auth, db } from "../components/firebase";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { FaTrash, FaEdit, FaFlag, FaCheck, FaTimes, FaSearch } from "react-icons/fa";

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("users");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [note, setNote] = useState("");
  const [editingId, setEditingId] = useState(null);

  // Collections configuration
  const collections = {
    users: collection(db, "users"),
    notifications: collection(db, "notifications"),
    orders: collection(db, "orders"),
    reviews: collection(db, "reviews"),
    services: collection(db, "services"),
  };

  useEffect(() => {
    // Check if user is actually admin
    const isAdmin = localStorage.getItem("admin") === "true";
    if (!isAdmin) {
      navigate("/login");
    } else {
      fetchData();
    }
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collections[activeTab]);
      const items = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        highlighted: doc.data().highlighted || false
      }));
      setData(items);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteDoc(doc(db, activeTab, id));
        setData(data.filter(item => item.id !== id));
      } catch (error) {
        console.error("Error deleting document:", error);
      }
    }
  };

  const toggleHighlight = async (id) => {
    try {
      const docRef = doc(db, activeTab, id);
      const item = data.find(item => item.id === id);
      await updateDoc(docRef, {
        highlighted: !item.highlighted
      });
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error toggling highlight:", error);
    }
  };

  const addNote = async (id) => {
    if (!note.trim()) return;
    
    try {
      const docRef = doc(db, activeTab, id);
      await updateDoc(docRef, {
        adminNote: note,
        updatedAt: new Date().toISOString()
      });
      setNote("");
      setEditingId(null);
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  const filteredData = data.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (item.email && item.email.toLowerCase().includes(searchLower)) ||
      (item.name && item.name.toLowerCase().includes(searchLower)) ||
      (item.title && item.title.toLowerCase().includes(searchLower)) ||
      (item.id && item.id.toLowerCase().includes(searchLower)) ||
      (activeTab === "services" && item.sellerName && item.sellerName.toLowerCase().includes(searchLower)) ||
      (activeTab === "services" && item.category && item.category.toLowerCase().includes(searchLower))
    );
  });

  const renderTable = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (filteredData.length === 0) {
      return <div className="text-center py-8 text-gray-400">No data found</div>;
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white bg-opacity-10 rounded-lg">
          <thead>
            <tr className="border-b border-gray-700">
              {activeTab === "users" && (
                <>
                  <th className="py-3 px-4 text-left">ID</th>
                  <th className="py-3 px-4 text-left">Email</th>
                  <th className="py-3 px-4 text-left">Username</th>
                  <th className="py-3 px-4 text-left">Created</th>
                </>
              )}
              {activeTab === "orders" && (
                <>
                  <th className="py-3 px-4 text-left">Order ID</th>
                  <th className="py-3 px-4 text-left">User</th>
                  <th className="py-3 px-4 text-left">Amount</th>
                  <th className="py-3 px-4 text-left">Status</th>
                </>
              )}
              {activeTab === "reviews" && (
                <>
                  <th className="py-3 px-4 text-left">Review ID</th>
                  <th className="py-3 px-4 text-left">User</th>
                  <th className="py-3 px-4 text-left">Rating</th>
                  <th className="py-3 px-4 text-left">Content</th>
                </>
              )}
              {activeTab === "services" && (
                <>
                  <th className="py-3 px-4 text-left">Service ID</th>
                  <th className="py-3 px-4 text-left">Title</th>
                  <th className="py-3 px-4 text-left">Seller</th>
                  <th className="py-3 px-4 text-left">Category</th>
                  <th className="py-3 px-4 text-left">Price</th>
                </>
              )}
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => (
              <tr 
                key={item.id} 
                className={`border-b border-gray-700 ${item.highlighted ? "bg-yellow-500 bg-opacity-10" : ""}`}
              >
                {activeTab === "users" && (
                  <>
                    <td className="py-3 px-4">{item.id.substring(0, 6)}...</td>
                    <td className="py-3 px-4">{item.email}</td>
                    <td className="py-3 px-4">{item.username}</td>
                    <td className="py-3 px-4">
                      {new Date(item.createdAt?.seconds * 1000 || item.createdAt).toLocaleDateString()}
                    </td>
                  </>
                )}
                {activeTab === "orders" && (
                  <>
                    <td className="py-3 px-4">{item.id.substring(0, 6)}...</td>
                    <td className="py-3 px-4">{item.userId?.substring(0, 6)}...</td>
                    <td className="py-3 px-4">${item.amount}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.status === "completed" ? "bg-green-500" :
                        item.status === "pending" ? "bg-yellow-500" : "bg-red-500"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </>
                )}
                {activeTab === "reviews" && (
                  <>
                    <td className="py-3 px-4">{item.id.substring(0, 6)}...</td>
                    <td className="py-3 px-4">{item.userId?.substring(0, 6)}...</td>
                    <td className="py-3 px-4">{item.rating}/5</td>
                    <td className="py-3 px-4 max-w-xs truncate">{item.content}</td>
                  </>
                )}
                {activeTab === "services" && (
                  <>
                    <td className="py-3 px-4">{item.id.substring(0, 6)}...</td>
                    <td className="py-3 px-4">{item.title}</td>
                    <td className="py-3 px-4">{item.name || "N/A"}</td>
                    <td className="py-3 px-4">{item.city || "N/A"}</td>
                    <td className="py-3 px-4 capitalize">{item.category || "N/A"}</td>
                    <td className="py-3 px-4">${item.price || "0"}</td>
                  </>
                )}
                <td className="py-3 px-4 flex space-x-2">
                  <button
                    onClick={() => toggleHighlight(item.id)}
                    className={`p-2 rounded-full ${item.highlighted ? "bg-yellow-500" : "bg-gray-700"}`}
                    title={item.highlighted ? "Remove highlight" : "Highlight"}
                  >
                    <FaFlag className={item.highlighted ? "text-white" : "text-yellow-500"} />
                  </button>
                  <button
                    onClick={() => setEditingId(item.id === editingId ? null : item.id)}
                    className="p-2 rounded-full bg-blue-500 text-white"
                    title="Add note"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-full bg-red-500 text-white"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("admin");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-blue-300">Manage your platform data</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 rounded-lg font-semibold hover:bg-red-700 transition"
          >
            Logout
          </button>
        </motion.div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700 mb-6">
          {Object.keys(collections).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium capitalize ${activeTab === tab ? "border-b-2 border-blue-500 text-blue-400" : "text-gray-400 hover:text-white"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search and Stats */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-64">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              className="pl-10 pr-4 py-2 bg-gray-800 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="bg-gray-800 px-4 py-2 rounded-lg">
            Total {activeTab}: {filteredData.length}
          </div>
        </div>

        {/* Note Editor */}
        {editingId && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-gray-800 rounded-lg"
          >
            <h3 className="text-lg font-medium mb-2">Add Admin Note</h3>
            <textarea
              className="w-full p-3 bg-gray-700 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Enter your note here..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setEditingId(null);
                  setNote("");
                }}
                className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={() => addNote(editingId)}
                className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500"
              >
                Save Note
              </button>
            </div>
          </motion.div>
        )}

        {/* Data Table */}
        {renderTable()}
      </div>
    </div>
  );
};

export default Admin;