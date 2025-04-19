import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, storage } from "../components/firebase"; // Ensure correct import path
import { collection, query, where, getDocs } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";

function Search() {
  const { category } = useParams();
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch sellers based on the category
  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const q = query(
          collection(db, "services"),
          where("category", ">=", category),
          where("category", "<=", category + "\uf8ff")
        );

        const querySnapshot = await getDocs(q);
        const sellersData = [];

        for (const doc of querySnapshot.docs) {
          let data = doc.data();

          // Fetch cover photo URL if it exists
          if (data.coverPhoto) {
            try {
              const imageUrl = await getDownloadURL(ref(storage, data.coverPhoto));
              data.coverPhoto = imageUrl;
            } catch (error) {
              console.error("Error fetching image:", error);
              data.coverPhoto = "https://via.placeholder.com/400"; // Fallback image
            }
          }

          sellersData.push({ id: doc.id, ...data });
        }

        setSellers(sellersData);
      } catch (error) {
        console.error("Error fetching sellers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSellers();
  }, [category]);

  // Handle "Order Now" button click - navigate to order page instead of modal
  const handleOrderClick = (sellerId) => {
    navigate(`/order/${sellerId}`);
  };

  return (
    <div className="bg-gradient-to-b from-green-500 to-green-800 min-h-screen text-white">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-center">
          Search Results for: {decodeURIComponent(category)}
        </h1>

        {loading ? (
          <p className="text-center mt-4">Loading...</p>
        ) : sellers.length === 0 ? (
          <p className="text-center mt-4">No results found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {sellers.map((seller) => (
              <div
                key={seller.id}
                className="bg-white rounded-lg shadow-md p-4 text-black"
              >
                {/* Seller Cover Photo */}
                <img
                  src={seller.coverPhoto || "https://via.placeholder.com/400"}
                  alt={seller.name}
                  className="w-full h-48 object-cover rounded-md"
                />

                {/* Seller Name */}
                <h2 className="text-xl font-bold mt-2">{seller.name}</h2>

                {/* Rating and Reviews */}
                <div className="flex items-center text-gray-600 text-sm mt-1">
                  <span className="mr-1">⭐</span>
                  <span>{seller.rating || "0.0"} ({seller.reviewsCount || "0"} reviews)</span>
                </div>

                {/* Category */}
                <p className="text-green-700 font-semibold mt-1">
                  Category: {seller.category}
                </p>

                {/* Seller Details */}
                <p className="text-sm mt-1">{seller.service}</p>
                <p className="text-sm">City: {seller.city}</p>
                <p className="text-sm">Address: {seller.address}</p>

                {/* Order Button */}
                <button
                  className="bg-green-600 text-white w-full mt-4 py-2 rounded-md hover:bg-green-700"
                  onClick={() => handleOrderClick(seller.id)}
                >
                  Order Now
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Search;