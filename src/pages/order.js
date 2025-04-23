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
  getDoc  // Added getDoc import
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { Rating } from "@mui/material";
import { Star as StarIcon } from "@mui/icons-material";
import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import {
  Container,
  Card,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Avatar,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Paper,
} from "@mui/material";
import {
  ShoppingBag,
  Phone,
  Description,
  LocationOn,
  CalendarToday,
  AccessTime,
  Comment,
  AddAPhoto,
  Close,
} from "@mui/icons-material";

// Date picker imports - using native HTML inputs instead of MUI X Date Pickers
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

const Order = () => {
  const { sellerId } = useParams();
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

  // Colors - matching search.js theme
  const primaryColor = "#16a34a";
  const darkPrimaryColor = "#15803d";
  const backgroundColor = "#f0fdf4";

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

          // Fetch cover photo if exists
          if (sellerData.coverPhoto) {
            try {
              const imageUrl = await getDownloadURL(ref(storage, sellerData.coverPhoto));
              sellerData.coverPhoto = imageUrl;
            } catch (error) {
              console.error("Error fetching cover photo:", error);
              sellerData.coverPhoto = "https://via.placeholder.com/400";
            }
          }

          setSeller(sellerData);
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
    fetchReviews();
  }, [currentUser, sellerId, navigate]);

  const fetchReviews = async () => {
    if (!sellerId) return;
    
    try {
      const q = query(
        collection(db, "reviews"),
        where("sellerId", "==", sellerId),
        orderBy("timestamp", "desc"),
        limit(5)
      );
      const querySnapshot = await getDocs(q);
      const reviewsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
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

  const handleDateTimeChange = (newValue) => {
    setSelectedDate(newValue);
    if (newValue) {
      setFormattedDateTime(format(newValue, "MMM dd, yyyy - hh:mm a"));
    } else {
      setFormattedDateTime("");
    }
  };

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
      const orderImageUrls = await uploadImages(orderImages, "orders");

      const orderDoc = await addDoc(collection(db, "orders"), {
        orderName,
        telephone,
        sellerId: seller.id,
        sellerName: seller.name,
        sellerService: seller.service,
        description,
        place,
        time: formattedDateTime,
        status: "pending",
        timestamp: new Date(),
        userId: currentUser.uid,
        username: currentUser.displayName || "Unknown User",
        userPhone: currentUser.phoneNumber || "",
        images: orderImageUrls,
        lastUpdated: new Date(),
        notificationSeen: false,
      });

      await addDoc(collection(db, "notifications"), {
        recipientId: seller.uid,
        senderId: currentUser.uid,
        type: "new_order",
        orderId: orderDoc.id,
        message: `New order request for ${seller.service}`,
        timestamp: new Date(),
        read: false,
      });

      setSnackbar({
        open: true,
        message: "Order submitted successfully",
        severity: "success",
      });
      navigate("/my-orders");
    } catch (error) {
      console.error("Error submitting order:", error);
      setSnackbar({
        open: true,
        message: "Error submitting order",
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
      const imageUrls = await uploadImages(reviewImages, "reviews");

      await addDoc(collection(db, "reviews"), {
        sellerId: seller.id,
        sellerName: seller.name,
        userId: currentUser.uid,
        username: currentUser.displayName || "Unknown User",
        rating,
        review: reviewText,
        images: imageUrls,
        timestamp: new Date(),
        service: seller.service,
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
      fetchReviews();
    } catch (error) {
      console.error("Error submitting review:", error);
      setSnackbar({
        open: true,
        message: "Error submitting review",
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
      <Box sx={{ display: "flex", gap: 2, overflowX: "auto", py: 2 }}>
        {images.map((image, index) => (
          <Box key={index} sx={{ position: "relative" }}>
            <Box
              component="img"
              src={URL.createObjectURL(image)}
              sx={{
                width: 100,
                height: 100,
                borderRadius: 1,
                objectFit: "cover",
              }}
            />
            <IconButton
              size="small"
              sx={{
                position: "absolute",
                top: 0,
                right: 0,
                backgroundColor: "rgba(0,0,0,0.5)",
                color: "white",
                "&:hover": { backgroundColor: "rgba(0,0,0,0.7)" },
              }}
              onClick={() => removeImage(index, isOrder)}
            >
              <Close fontSize="small" />
            </IconButton>
          </Box>
        ))}
      </Box>
    );
  };

  const renderReviewCard = (review) => {
    return (
      <Paper key={review.id} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {review.username || "Anonymous"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {format(review.timestamp?.toDate(), "dd/MM/yyyy")}
          </Typography>
        </Box>
        <Rating
          value={review.rating}
          precision={0.5}
          readOnly
          icon={<StarIcon fontSize="inherit" color="primary" />}
          emptyIcon={<StarIcon fontSize="inherit" />}
        />
        <Typography variant="body1" sx={{ mt: 1, mb: 2 }}>
          {review.review}
        </Typography>
        {review.images?.length > 0 && (
          <>
            <Typography variant="body2" fontWeight="500" color="text.secondary" sx={{ mb: 1 }}>
              Photos:
            </Typography>
            <Box sx={{ display: "flex", gap: 2, overflowX: "auto" }}>
              {review.images.map((img, idx) => (
                <Box
                  key={idx}
                  component="img"
                  src={img}
                  sx={{
                    width: 100,
                    height: 100,
                    borderRadius: 1,
                    objectFit: "cover",
                  }}
                />
              ))}
            </Box>
          </>
        )}
        {review.service && (
          <Typography variant="caption" color="text.secondary" fontStyle="italic" sx={{ mt: 1 }}>
            Service: {review.service}
          </Typography>
        )}
      </Paper>
    );
  };

  if (sellerLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #16a34a, #15803d)'
      }}>
        <CircularProgress sx={{ color: 'white' }} />
      </Box>
    );
  }

  if (!seller) {
    return null;
  }

  return (
    <Box sx={{ background: 'linear-gradient(to bottom, #16a34a, #15803d)', minHeight: "100vh" }}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Card sx={{ mb: 3, borderRadius: 3, overflow: "hidden" }}>
          <Box sx={{ backgroundColor: `${primaryColor}`, p: 3 }}>
            <Typography variant="h5" fontWeight="bold" color="white">
              Order from {seller.name}
            </Typography>
          </Box>
        </Card>

        {/* Seller Info Card */}
        <Card sx={{ mb: 3, borderRadius: 3, backgroundColor: backgroundColor }}>
          <Box sx={{ p: 3 }}>
            {seller.profileImage && (
              <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
                <Avatar src={seller.profileImage} sx={{ width: 100, height: 100 }} />
              </Box>
            )}
            <Typography variant="h6" fontWeight="bold" color={darkPrimaryColor} gutterBottom>
              {seller.name || "No Name"}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <StarIcon color="warning" fontSize="small" />
              <Typography variant="body1" sx={{ ml: 0.5, mr: 1 }}>
                {seller.rating?.toFixed(1) || "0.0"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ({seller.reviewsCount || "0"} reviews)
              </Typography>
            </Box>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {seller.service && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    <strong>Service:</strong> {seller.service}
                  </Typography>
                </Grid>
              )}
              {seller.category && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    <strong>Category:</strong> {seller.category}
                  </Typography>
                </Grid>
              )}
              {seller.age && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    <strong>Age:</strong> {seller.age}
                  </Typography>
                </Grid>
              )}
              {seller.city && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    <strong>City:</strong> {seller.city}
                  </Typography>
                </Grid>
              )}
              {seller.address && (
                <Grid item xs={12}>
                  <Typography variant="body2">
                    <strong>Address:</strong> {seller.address}
                  </Typography>
                </Grid>
              )}
              {seller.preferredLocation && (
                <Grid item xs={12}>
                  <Typography variant="body2">
                    <strong>Preferred Location:</strong> {seller.preferredLocation}
                  </Typography>
                </Grid>
              )}
              {seller.workType && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    <strong>Work Type:</strong> {seller.workType}
                  </Typography>
                </Grid>
              )}
              {seller.experience && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    <strong>Experience:</strong> {seller.experience}
                  </Typography>
                </Grid>
              )}
              {seller.education && (
                <Grid item xs={12}>
                  <Typography variant="body2">
                    <strong>Education:</strong> {seller.education}
                  </Typography>
                </Grid>
              )}
              {seller.hasCertifications && seller.certificationImage && (
                <Grid item xs={12}>
                  <Typography variant="body2" fontWeight="500" gutterBottom>
                    Certifications:
                  </Typography>
                  <Box
                    component="img"
                    src={seller.certificationImage}
                    sx={{
                      height: 100,
                      borderRadius: 1,
                      cursor: "pointer",
                      "&:hover": { opacity: 0.8 },
                    }}
                    onClick={() => window.open(seller.certificationImage, "_blank")}
                  />
                </Grid>
              )}
            </Grid>
          </Box>
        </Card>

        {/* Order Form */}
        <Card sx={{ mb: 3, borderRadius: 3, backgroundColor: backgroundColor }}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" color={darkPrimaryColor} gutterBottom>
              Place Your Order
            </Typography>
            <Box component="form" sx={{ mt: 2 }}>
              <TextField
                label="Order Name"
                fullWidth
                margin="normal"
                value={orderName}
                onChange={(e) => setOrderName(e.target.value)}
                InputProps={{ startAdornment: <ShoppingBag color="action" sx={{ mr: 1 }} /> }}
                required
              />
              <TextField
                label="Telephone Number"
                fullWidth
                margin="normal"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                InputProps={{ startAdornment: <Phone color="action" sx={{ mr: 1 }} /> }}
                required
              />
              <TextField
                label="Order Description"
                fullWidth
                margin="normal"
                multiline
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                InputProps={{ startAdornment: <Description color="action" sx={{ mr: 1 }} /> }}
                required
              />
              <TextField
                label="Address"
                fullWidth
                margin="normal"
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                InputProps={{ startAdornment: <LocationOn color="action" sx={{ mr: 1 }} /> }}
                required
              />
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Date & Time
                </Typography>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    label="Select Date and Time"
                    value={selectedDate}
                    onChange={handleDateTimeChange}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Add Order Photos (Optional - Max 5)
                </Typography>
                {orderImages.length > 0 && renderImagePreview(orderImages, true)}
                <Button
                  variant="outlined"
                  startIcon={<AddAPhoto />}
                  component="label"
                  disabled={orderImages.length >= 5}
                  sx={{
                    mt: 1,
                    color: orderImages.length >= 5 ? "text.disabled" : darkPrimaryColor,
                    borderColor: orderImages.length >= 5 ? "action.disabled" : darkPrimaryColor,
                  }}
                >
                  Add Photos ({orderImages.length}/5)
                  <input
                    type="file"
                    hidden
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files, true)}
                  />
                </Button>
              </Box>
              <Button
                fullWidth
                variant="contained"
                size="large"
                sx={{
                  mt: 3,
                  backgroundColor: primaryColor,
                  "&:hover": { backgroundColor: darkPrimaryColor },
                }}
                onClick={submitOrder}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Submit Order"}
              </Button>
            </Box>
          </Box>
        </Card>

        {/* Review Form */}
        <Card sx={{ mb: 3, borderRadius: 3, backgroundColor: backgroundColor }}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" color={darkPrimaryColor} gutterBottom>
              Leave a Review
            </Typography>
            <Box component="form" sx={{ mt: 2 }}>
              <Rating
                value={rating}
                precision={0.5}
                onChange={(e, newValue) => setRating(newValue)}
                icon={<StarIcon fontSize="inherit" color="primary" />}
                emptyIcon={<StarIcon fontSize="inherit" />}
              />
              <TextField
                label="Your Review"
                fullWidth
                margin="normal"
                multiline
                rows={4}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                InputProps={{ startAdornment: <Comment color="action" sx={{ mr: 1 }} /> }}
                required
              />
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Add Photos (Optional - Max 5)
                </Typography>
                {reviewImages.length > 0 && renderImagePreview(reviewImages, false)}
                <Button
                  variant="outlined"
                  startIcon={<AddAPhoto />}
                  component="label"
                  disabled={reviewImages.length >= 5}
                  sx={{
                    mt: 1,
                    color: reviewImages.length >= 5 ? "text.disabled" : darkPrimaryColor,
                    borderColor: reviewImages.length >= 5 ? "action.disabled" : darkPrimaryColor,
                  }}
                >
                  Add Photos ({reviewImages.length}/5)
                  <input
                    type="file"
                    hidden
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files, false)}
                  />
                </Button>
              </Box>
              <Button
                fullWidth
                variant="contained"
                size="large"
                sx={{
                  mt: 3,
                  backgroundColor: primaryColor,
                  "&:hover": { backgroundColor: darkPrimaryColor },
                }}
                onClick={submitReview}
                disabled={reviewLoading}
              >
                {reviewLoading ? <CircularProgress size={24} color="inherit" /> : "Submit Review"}
              </Button>
            </Box>
          </Box>
        </Card>

        {/* Reviews List */}
        <Card sx={{ borderRadius: 3, backgroundColor: backgroundColor }}>
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Typography variant="h6" fontWeight="bold" color={darkPrimaryColor}>
                Customer Reviews
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Latest 5 Reviews
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              For {seller.name}
            </Typography>
            <Box sx={{ mt: 2 }}>
              {reviews.length > 0 ? (
                reviews.map(renderReviewCard)
              ) : (
                <Paper sx={{ p: 3, textAlign: "center" }}>
                  <Typography variant="body1" color="text.secondary">
                    No reviews yet. Be the first to review!
                  </Typography>
                </Paper>
              )}
            </Box>
          </Box>
        </Card>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Order;