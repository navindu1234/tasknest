import React, { useState, useEffect } from "react";
import { db, storage } from "../components/firebase";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  updateDoc, 
  doc,
  getDoc,
  serverTimestamp
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { Rating } from "@mui/material";
import { Star as StarIcon } from "@mui/icons-material";
import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import { FaSpinner, FaShoppingBag, FaPhone, FaComment, FaImage, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaStar, FaArrowLeft } from "react-icons/fa";
import { motion } from "framer-motion";

const Order = () => {
  const { sellerId } = useParams();
  const { sellerName } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [reviews, setReviews] = useState([]);
  const [orderImages, setOrderImages] = useState([]);
  const [reviewImages, setReviewImages] = useState([]);
  const [seller, setSeller] = useState(null);
  const [sellerLoading, setSellerLoading] = useState(true);

  // Form states
  const [orderName, setOrderName] = useState("");
  const [telephone, setTelephone] = useState("");
  const [description, setDescription] = useState("");
  const [place, setPlace] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [formattedDateTime, setFormattedDateTime] = useState("");
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  // Theme colors matching login.js
  const primaryColor = "bg-gradient-to-br from-green-500 to-green-700";
  const buttonColor = "bg-green-600 hover:bg-green-700";
  const buttonDisabledColor = "bg-green-500";
  const inputFocusColor = "focus:ring-2 focus:ring-green-500";
  const borderColor = "border-green-400";
  const textColor = "text-white";
  const textDarkColor = "text-gray-800";
  const errorColor = "bg-red-100 text-red-700";
  const cardColor = "bg-white bg-opacity-95";

  useEffect(() => {
    const fetchSeller = async () => {
      try {
        const docRef = doc(db, "services", sellerId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          let sellerData = { id: sellerId, ...docSnap.data() };
          
          // Fetch profile image if exists
          if (sellerData.profileImage) {
            try {
              const imageUrl = await getDownloadURL(ref(storage, sellerData.profileImage));
              sellerData.profileImage = imageUrl;
            } catch (error) {
              console.error("Error fetching profile image:", error);
              sellerData.profileImage = "https://via.placeholder.com/150";
            }
          }

          setSeller(sellerData);
          await fetchReviews(sellerData.name);
        } else {
          setSnackbar({
            open: true,
            message: "Seller not found",
            severity: "error",
          });
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching seller:", error);
        setSnackbar({
          open: true,
          message: "Error loading seller information",
          severity: "error",
        });
        navigate("/");
      } finally {
        setSellerLoading(false);
      }
    };

    if (currentUser?.phoneNumber) {
      setTelephone(currentUser.phoneNumber);
    }

    fetchSeller();
  }, [currentUser, sellerId, navigate]);

  const fetchReviews = async (sellerName) => {
    if (!sellerName) return;
    
    try {
      const q = query(
        collection(db, 'reviews'),
        where("sellerId", "==", sellerId),
        orderBy("timestamp", "desc"),
        limit(5)
      );
      const querySnapshot = await getDocs(q);
      const reviewsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp
      }));
      setReviews(reviewsData);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setSnackbar({
        open: true,
        message: "Error fetching reviews",
        severity: "error",
      });
    }
  };

  const handleImageUpload = async (files, isOrder) => {
    const maxImages = 5;
    const currentImages = isOrder ? orderImages : reviewImages;
    
    if (currentImages.length + files.length > maxImages) {
      setSnackbar({
        open: true,
        message: "You can upload up to 5 images",
        severity: "error",
      });
      return;
    }

    const newImages = Array.from(files);
    if (isOrder) {
      setOrderImages([...orderImages, ...newImages]);
    } else {
      setReviewImages([...reviewImages, ...newImages]);
    }
  };

  const removeImage = (index, isOrder) => {
    if (isOrder) {
      setOrderImages(orderImages.filter((_, i) => i !== index));
    } else {
      setReviewImages(reviewImages.filter((_, i) => i !== index));
    }
  };

  const uploadImages = async (images, folder) => {
    const urls = [];
    for (const image of images) {
      const storageRef = ref(storage, `${folder}/${uuidv4()}_${image.name}`);
      await uploadBytes(storageRef, image);
      const downloadURL = await getDownloadURL(storageRef);
      urls.push(downloadURL);
    }
    return urls;
  };

  const updateDateTimeField = () => {
    if (selectedDate && selectedTime) {
      const combinedDateTime = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        selectedTime.getHours(),
        selectedTime.getMinutes()
      );
      setFormattedDateTime(format(combinedDateTime, "MMM dd, yyyy - hh:mm a"));
    } else if (selectedDate) {
      setFormattedDateTime(format(selectedDate, "MMM dd, yyyy"));
    } else if (selectedTime) {
      setFormattedDateTime(format(selectedTime, "hh:mm a"));
    } else {
      setFormattedDateTime("");
    }
  };

  useEffect(() => {
    updateDateTimeField();
  }, [selectedDate, selectedTime]);

  const submitOrder = async () => {
    if (!seller) return;
    
    if (!orderName || !telephone || !description || !place || !formattedDateTime) {
      setSnackbar({
        open: true,
        message: "Please fill all required fields",
        severity: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const orderImageUrls = orderImages.length > 0 ? await uploadImages(orderImages, "orders") : [];

      const orderDoc = await addDoc(collection(db, "orders"), {
        orderId: uuidv4(),
        orderName,
        telephone,
        sellerId: seller.id,
        sellerName: seller.name,
        sellerService: seller.serviceDescription || seller.service,
        description,
        place,
        time: formattedDateTime,
        status: "pending",
        timestamp: serverTimestamp(),
        userId: currentUser.uid,
        username: currentUser.displayName || "Unknown User",
        userPhone: currentUser.phoneNumber || "",
        images: orderImageUrls,
        lastUpdated: serverTimestamp(),
        notificationSeen: false,
      });

      await addDoc(collection(db, "notifications"), {
        recipientId: seller.uid || seller.id,
        senderId: currentUser.uid,
        type: "new_order",
        orderId: orderDoc.id,
        message: `New order request for ${seller.serviceDescription || seller.service}`,
        timestamp: serverTimestamp(),
        read: false,
      });

      setSnackbar({
        open: true,
        message: "Order submitted successfully",
        severity: "success",
      });
      navigate(`/my-orders/${currentUser.uid}`);
    } catch (error) {
      console.error("Error submitting order:", error);
      setSnackbar({
        open: true,
        message: "Error submitting order: " + error.message,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async () => {
    if (!seller) return;
    
    if (!rating) {
      setSnackbar({
        open: true,
        message: "Please provide a rating",
        severity: "error",
      });
      return;
    }

    if (!reviewText) {
      setSnackbar({
        open: true,
        message: "Please enter your review",
        severity: "error",
      });
      return;
    }

    setReviewLoading(true);
    try {
      const imageUrls = reviewImages.length > 0 ? await uploadImages(reviewImages, "reviews") : [];

      await addDoc(collection(db, "reviews"), {
        sellerId: seller.id,
        sellerName: seller.name,
        userId: currentUser.uid,
        username: currentUser.displayName || "Unknown User",
        rating,
        review: reviewText,
        images: imageUrls,
        timestamp: serverTimestamp(),
        service: seller.serviceDescription || seller.service,
      });

      await updateSellerRating();

      setSnackbar({
        open: true,
        message: "Review submitted successfully",
        severity: "success",
      });
      setReviewText("");
      setRating(0);
      setReviewImages([]);
      fetchReviews(seller.name);
    } catch (error) {
      console.error("Error submitting review:", error);
      setSnackbar({
        open: true,
        message: "Error submitting review: " + error.message,
        severity: "error",
      });
    } finally {
      setReviewLoading(false);
    }
  };

  const updateSellerRating = async () => {
    if (!seller) return;
    
    try {
      const q = query(collection(db, "reviews"), where("sellerId", "==", seller.id));
      const querySnapshot = await getDocs(q);

      let totalRating = 0;
      const reviewCount = querySnapshot.size;

      querySnapshot.forEach((doc) => {
        totalRating += doc.data().rating || 0;
      });

      const averageRating = reviewCount > 0 ? totalRating / reviewCount : 0;

      await updateDoc(doc(db, "services", seller.id), {
        rating: averageRating,
        reviewsCount: reviewCount,
      });
    } catch (error) {
      console.error("Error updating seller rating:", error);
      throw error;
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const renderImagePreview = (images, isOrder) => {
    return (
      <div className="flex gap-4 py-4 overflow-x-auto">
        {images.map((image, index) => (
          <div key={index} className="relative">
            <img
              src={URL.createObjectURL(image)}
              className="w-24 h-24 rounded-lg object-cover border-2 border-green-400"
              alt="Preview"
            />
            <button
              className="absolute top-1 right-1 bg-white rounded-full p-1 text-green-600 hover:text-green-800"
              onClick={() => removeImage(index, isOrder)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    );
  };

  const renderReviewCard = (review) => {
    const reviewDate = review.timestamp?.toDate ? review.timestamp.toDate() : new Date();
    
    return (
      <motion.div 
        key={review.id}
        className="mb-6 p-6 rounded-xl shadow-md border-l-4 border-green-500 bg-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-bold text-gray-800">{review.username || "Anonymous"}</h4>
          <span className="text-sm text-gray-500">{format(reviewDate, "MMM dd, yyyy")}</span>
        </div>
        <Rating
          value={review.rating}
          precision={0.5}
          readOnly
          icon={<StarIcon className="text-green-500" fontSize="inherit" />}
          emptyIcon={<StarIcon className="text-gray-300" fontSize="inherit" />}
        />
        <p className="mt-2 mb-4 text-gray-800">{review.review}</p>
        
        {review.images?.length > 0 && (
          <>
            <div className="border-t border-gray-200 my-4"></div>
            <p className="text-sm font-medium text-gray-600 mb-2">Photos:</p>
            <div className="flex gap-3 overflow-x-auto">
              {review.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  className="w-20 h-20 rounded-lg object-cover cursor-pointer hover:scale-105 transition-transform border border-green-200"
                  onClick={() => window.open(img, "_blank")}
                  alt="Review"
                />
              ))}
            </div>
          </>
        )}
        
        {review.service && (
          <div className="mt-4">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
              Service: {review.service}
            </span>
          </div>
        )}
      </motion.div>
    );
  };

  if (sellerLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${primaryColor}`}>
        <FaSpinner className="animate-spin text-white text-4xl" />
      </div>
    );
  }

  if (!seller) {
    return null;
  }

  return (
    <div className={`min-h-screen ${primaryColor} pb-8 pt-4`}>
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <motion.div 
          className="bg-gradient-to-r from-green-500 to-green-700 text-white py-4 px-6 rounded-xl mb-6 shadow-lg border border-green-400"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center">
            <button 
              onClick={() => navigate(-1)}
              className="mr-4 text-white hover:text-green-200 transition-colors"
            >
              <FaArrowLeft className="text-xl" />
            </button>
            <h1 className="text-2xl font-bold flex-1">Order from {seller.name}</h1>
          </div>
        </motion.div>

        {/* Seller Profile Card */}
        <motion.div 
          className={`${cardColor} rounded-xl shadow-lg mb-6 border-4 ${borderColor}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-center mb-6">
              <img 
                src={seller.profileImage} 
                alt={seller.name}
                className="w-24 h-24 rounded-full border-4 border-green-400 object-cover mb-4 sm:mb-0"
              />
              <div className="sm:ml-6 text-center sm:text-left">
                <h2 className="text-xl font-bold text-gray-800">{seller.name || "No Name"}</h2>
                <div className="flex items-center justify-center sm:justify-start mt-1">
                  <Rating
                    value={seller.rating || 0}
                    precision={0.5}
                    readOnly
                    size="small"
                    icon={<StarIcon className="text-green-500" fontSize="inherit" />}
                    emptyIcon={<StarIcon className="text-gray-300" fontSize="inherit" />}
                  />
                  <span className="text-sm text-gray-700 ml-1">({seller.reviewsCount || 0} reviews)</span>
                </div>
                {seller.serviceDescription && (
                  <span className="inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                    {seller.serviceDescription}
                  </span>
                )}
              </div>
            </div>

            <div className="border-t border-green-200 my-4"></div>

            {/* Seller Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {seller.city && (
                <div className="flex items-center">
                  <FaMapMarkerAlt className="text-green-500 mr-2" />
                  <span className="text-sm text-gray-800"><strong>City:</strong> {seller.city}</span>
                </div>
              )}
              {seller.address && (
                <div className="flex items-center">
                  <FaMapMarkerAlt className="text-green-500 mr-2" />
                  <span className="text-sm text-gray-800"><strong>Address:</strong> {seller.address}</span>
                </div>
              )}
              {seller.preferredLocation && (
                <div className="flex items-center">
                  <FaMapMarkerAlt className="text-green-500 mr-2" />
                  <span className="text-sm text-gray-800"><strong>Preferred Location:</strong> {seller.preferredLocation}</span>
                </div>
              )}
              {seller.workType && (
                <div className="flex items-center">
                  <FaShoppingBag className="text-green-500 mr-2" />
                  <span className="text-sm text-gray-800"><strong>Work Type:</strong> {seller.workType}</span>
                </div>
              )}
              {seller.experience && (
                <div className="flex items-center">
                  <FaShoppingBag className="text-green-500 mr-2" />
                  <span className="text-sm text-gray-800"><strong>Experience:</strong> {seller.experience}</span>
                </div>
              )}
              {seller.education && (
                <div className="flex items-center">
                  <FaShoppingBag className="text-green-500 mr-2" />
                  <span className="text-sm text-gray-800"><strong>Education:</strong> {seller.education}</span>
                </div>
              )}
              {seller.age && (
                <div className="flex items-center">
                  <FaShoppingBag className="text-green-500 mr-2" />
                  <span className="text-sm text-gray-800"><strong>Age:</strong> {seller.age}</span>
                </div>
              )}
            </div>

            {seller.hasCertifications === 'Yes' && seller.certificationImage && (
              <div className="mt-6">
                <p className="text-sm font-medium text-gray-800 mb-2">Certifications:</p>
                <img
                  src={seller.certificationImage}
                  className="max-h-40 max-w-full rounded-lg cursor-pointer border-2 border-green-400 hover:opacity-90"
                  onClick={() => window.open(seller.certificationImage, "_blank")}
                  alt="Certification"
                />
              </div>
            )}
          </div>
        </motion.div>

        {/* Order Form */}
        <motion.div 
          className={`${cardColor} rounded-xl shadow-lg mb-6 border-4 ${borderColor}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <FaShoppingBag className="text-green-500 mr-2" />
              Place Your Order
            </h2>
            
            <form className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Order Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaShoppingBag className="text-green-500" />
                    </div>
                    <input
                      type="text"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg ${inputFocusColor}`}
                      value={orderName}
                      onChange={(e) => setOrderName(e.target.value)}
                      required
                      placeholder="Order name"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Telephone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaPhone className="text-green-500" />
                    </div>
                    <input
                      type="tel"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg ${inputFocusColor}`}
                      value={telephone}
                      onChange={(e) => setTelephone(e.target.value)}
                      required
                      placeholder="Phone number"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-gray-700 mb-2">Order Description</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 pt-3 flex items-start pointer-events-none">
                    <FaComment className="text-green-500" />
                  </div>
                  <textarea
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg ${inputFocusColor} h-32`}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    placeholder="Describe your order in detail"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-gray-700 mb-2">Service Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaMapMarkerAlt className="text-green-500" />
                  </div>
                  <input
                    type="text"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg ${inputFocusColor}`}
                    value={place}
                    onChange={(e) => setPlace(e.target.value)}
                    required
                    placeholder="Where the service will be performed"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-gray-700 mb-2 flex items-center">
                  <FaClock className="text-green-500 mr-2" />
                  Select Date & Time
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaCalendarAlt className="text-green-500" />
                      </div>
                      <input
                        type="date"
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg ${inputFocusColor}`}
                        value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
                        onChange={(e) => setSelectedDate(new Date(e.target.value))}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaClock className="text-green-500" />
                      </div>
                      <input
                        type="time"
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg ${inputFocusColor}`}
                        value={selectedTime ? `${String(selectedTime.getHours()).padStart(2, '0')}:${String(selectedTime.getMinutes()).padStart(2, '0')}` : ''}
                        onChange={(e) => {
                          const [hours, minutes] = e.target.value.split(':');
                          const time = new Date();
                          time.setHours(parseInt(hours, 10));
                          time.setMinutes(parseInt(minutes, 10));
                          setSelectedTime(time);
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaClock className="text-green-500" />
                    </div>
                    <input
                      type="text"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-gray-50`}
                      value={formattedDateTime}
                      readOnly
                      placeholder="Selected date and time will appear here"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-gray-700 mb-2 flex items-center">
                  <FaImage className="text-green-500 mr-2" />
                  Add Order Photos (Optional - Max 5)
                </label>
                {orderImages.length > 0 && renderImagePreview(orderImages, true)}
                <label className={`inline-flex items-center mt-2 px-4 py-2 rounded-lg border ${orderImages.length >= 5 ? 'border-gray-300 text-gray-400 cursor-not-allowed' : 'border-green-500 text-green-600 hover:bg-green-50 cursor-pointer'} transition-colors`}>
                  <FaImage className="mr-2" />
                  Upload Photos ({orderImages.length}/5)
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files, true)}
                    disabled={orderImages.length >= 5}
                  />
                </label>
              </div>

              <button
                type="button"
                className={`w-full mt-6 ${loading ? buttonDisabledColor : buttonColor} text-white py-3 rounded-lg transition duration-300 flex items-center justify-center font-bold text-lg`}
                onClick={submitOrder}
                disabled={loading || !orderName || !telephone || !description || !place || !formattedDateTime}
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  "Submit Order"
                )}
              </button>
            </form>
          </div>
        </motion.div>

        {/* Review Form */}
        <motion.div 
          className={`${cardColor} rounded-xl shadow-lg mb-6 border-4 ${borderColor}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <FaStar className="text-green-500 mr-2" />
              Leave a Review
            </h2>
            
            <form className="mt-4">
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Your Rating</label>
                <Rating
                  value={rating}
                  precision={0.5}
                  onChange={(e, newValue) => setRating(newValue)}
                  icon={<StarIcon className="text-green-500" fontSize="large" />}
                  emptyIcon={<StarIcon className="text-gray-300" fontSize="large" />}
                  size="large"
                />
              </div>

              <div className="mt-4">
                <label className="block text-gray-700 mb-2">Your Review</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 pt-3 flex items-start pointer-events-none">
                    <FaComment className="text-green-500" />
                  </div>
                  <textarea
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg ${inputFocusColor} h-32`}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    required
                    placeholder="Share your experience with this seller"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-gray-700 mb-2 flex items-center">
                  <FaImage className="text-green-500 mr-2" />
                  Add Photos (Optional - Max 5)
                </label>
                {reviewImages.length > 0 && renderImagePreview(reviewImages, false)}
                <label className={`inline-flex items-center mt-2 px-4 py-2 rounded-lg border ${reviewImages.length >= 5 ? 'border-gray-300 text-gray-400 cursor-not-allowed' : 'border-green-500 text-green-600 hover:bg-green-50 cursor-pointer'} transition-colors`}>
                  <FaImage className="mr-2" />
                  Upload Photos ({reviewImages.length}/5)
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files, false)}
                    disabled={reviewImages.length >= 5}
                  />
                </label>
              </div>

              <button
                type="button"
                className={`w-full mt-6 ${reviewLoading ? buttonDisabledColor : buttonColor} text-white py-3 rounded-lg transition duration-300 flex items-center justify-center font-bold text-lg`}
                onClick={submitReview}
                disabled={reviewLoading || !rating || !reviewText}
              >
                {reviewLoading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  "Submit Review"
                )}
              </button>
            </form>
          </div>
        </motion.div>

        {/* Reviews Section */}
        <motion.div 
          className={`${cardColor} rounded-xl shadow-lg border-4 ${borderColor}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <FaComment className="text-green-500 mr-2" />
                Customer Reviews
              </h2>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                Latest {reviews.length} reviews
              </span>
            </div>
            
            <p className="text-gray-700 mb-4">What others say about {seller.name}</p>
            
            <div className="border-t border-green-200 my-4"></div>
            
            <div className="mt-4">
              {reviews.length > 0 ? (
                reviews.map(renderReviewCard)
              ) : (
                <div className="p-6 text-center bg-green-50 rounded-lg border border-green-200">
                  <p className="text-gray-800">No reviews yet. Be the first to review!</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Snackbar */}
      {snackbar.open && (
        <motion.div
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
        >
          <div className={`px-6 py-3 rounded-lg shadow-lg ${
            snackbar.severity === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            <div className="flex items-center">
              {snackbar.severity === 'error' ? (
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              <span>{snackbar.message}</span>
              <button
                className="ml-4"
                onClick={handleCloseSnackbar}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Order;