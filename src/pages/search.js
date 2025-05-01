import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, storage } from "../components/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";

function Search() {
  const { category } = useParams();
  const [sellers, setSellers] = useState([]);
  const [filteredSellers, setFilteredSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [sortByRating, setSortByRating] = useState(false);
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
              const imageRef = ref(storage, data.coverPhoto);
              const imageUrl = await getDownloadURL(imageRef);
              data.coverPhoto = imageUrl;
            } catch (error) {
              console.error("Error fetching image:", error);
              data.coverPhoto = "https://via.placeholder.com/400";
            }
          } else {
            data.coverPhoto = "https://via.placeholder.com/400";
          }

          sellersData.push({ id: doc.id, ...data });
        }

        setSellers(sellersData);
        setFilteredSellers(sellersData);
      } catch (error) {
        console.error("Error fetching sellers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSellers();
  }, [category]);

  // Apply filters and sorting whenever search term, city filter, or sort option changes
  useEffect(() => {
    let results = [...sellers];

    // Apply name search filter
    if (searchTerm) {
      results = results.filter(seller =>
        seller.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply city filter
    if (cityFilter) {
      results = results.filter(seller =>
        seller.city.toLowerCase().includes(cityFilter.toLowerCase())
      );
    }

    // Apply rating sort
    if (sortByRating) {
      results.sort((a, b) => {
        const ratingA = a.rating || 0;
        const ratingB = b.rating || 0;
        return ratingB - ratingA; // Descending order
      });
    }

    setFilteredSellers(results);
  }, [searchTerm, cityFilter, sortByRating, sellers]);

  // Handle "Order Now" button click
  const handleOrderClick = (sellerId) => {
    navigate(`/order/${sellerId}`);
  };

  // Get unique cities for filter dropdown
  const uniqueCities = [...new Set(sellers.map(seller => seller.city))].filter(Boolean);

  return (
    <div className="bg-gradient-to-b from-green-500 to-green-800 min-h-screen text-white">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-center">
          Search Results for: {decodeURIComponent(category)}
        </h1>

        {/* Search and Filter Controls */}
        <div className="bg-white p-4 rounded-lg shadow-md mt-6 mb-6 text-black">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search by Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search by Seller Name
              </label>
              <input
                type="text"
                placeholder="Enter seller name..."
                className="w-full p-2 border border-gray-300 rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter by City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by City
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
              >
                <option value="">All Cities</option>
                {uniqueCities.map((city, index) => (
                  <option key={index} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort by Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort Options
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="sortByRating"
                  checked={sortByRating}
                  onChange={(e) => setSortByRating(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="sortByRating">Top Rated First</label>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-center mb-4">
          {!loading && (
            <p>
              Showing {filteredSellers.length} of {sellers.length} results
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-center mt-4">Loading...</p>
          </div>
        ) : filteredSellers.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-center mt-4">No results found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filteredSellers.map((seller) => (
              <div
                key={seller.id}
                className="bg-white rounded-lg shadow-md p-4 text-black hover:shadow-lg transition-shadow duration-300"
              >
                {/* Seller Cover Photo */}
                <div className="relative h-48 w-full overflow-hidden rounded-md mb-4">
                  <img
                    src={seller.coverImage}
                    alt={seller.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/400";
                    }}
                  />
                </div>

                {/* Seller Name */}
                <h2 className="text-xl font-bold mt-2">{seller.name}</h2>

                {/* Rating and Reviews */}
                <div className="flex items-center text-gray-600 text-sm mt-1">
                  <span className="mr-1">⭐</span>
                  <span>
                    {seller.rating?.toFixed(1) || "0.0"} ({seller.reviewsCount || "0"} reviews)
                  </span>
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
                  className="bg-green-600 text-white w-full mt-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-300"
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