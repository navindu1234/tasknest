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
  Divider,
  Chip
} from "@mui/material";
import {
  ShoppingBag,
  Phone,
  Description,
  LocationOn,
  Comment as CommentIcon,
  AddAPhoto,
  Close,
  ArrowBack,
  Work,
  School,
  Place,
  Schedule,
  StarBorder,
  CalendarMonth,
  AccessTime
} from "@mui/icons-material";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';

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

  // Theme colors
  const primaryColor = "#89AC46";
  const darkPrimaryColor = "#6E8D38";
  const lightPrimaryColor = "#E8F5E9";
  const backgroundColor = "#F5F5F5";
  const textColor = "#2E7D32";

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
          // Fetch reviews after seller data is loaded

          
          await fetchReviews(reviews.sellerName);
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
              
        // orderBy("timestamp", "desc"),
        limit(5)
      );
      const querySnapshot = await getDocs(q);
      const reviewsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        // timestamp: doc.data().timestamp // Keep the Firestore timestamp
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
                border: `1px solid ${primaryColor}`
              }}
            />
            <IconButton
              size="small"
              sx={{
                position: "absolute",
                top: 4,
                right: 4,
                backgroundColor: "rgba(255,255,255,0.8)",
                color: darkPrimaryColor,
                "&:hover": { backgroundColor: "white" },
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
    const reviewDate = review.timestamp?.toDate ? review.timestamp.toDate() : new Date();
    
    return (
      <Paper 
        key={review.id} 
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 2,
          borderLeft: `4px solid ${primaryColor}`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold" color={textColor}>
            {review.username || "Anonymous"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {format(reviewDate, "MMM dd, yyyy")}
          </Typography>
        </Box>
        <Rating
          value={review.rating}
          precision={0.5}
          readOnly
          icon={<StarIcon fontSize="inherit" sx={{ color: primaryColor }} />}
          emptyIcon={<StarIcon fontSize="inherit" sx={{ color: '#e0e0e0' }} />}
        />
        <Typography variant="body1" sx={{ mt: 1, mb: 2, color: textColor }}>
          {review.review}
        </Typography>
        {review.images?.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
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
                    cursor: "pointer",
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: "scale(1.05)"
                    }
                  }}
                  onClick={() => window.open(img, "_blank")}
                />
              ))}
            </Box>
          </>
        )}
        {review.service && (
          <Chip
            label={`Service: ${review.service}`}
            size="small"
            sx={{ 
              mt: 2,
              backgroundColor: lightPrimaryColor,
              color: darkPrimaryColor
            }}
          />
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
        backgroundColor: backgroundColor
      }}>
        <CircularProgress sx={{ color: primaryColor }} />
      </Box>
    );
  }

  if (!seller) {
    return null;
  }

  return (
    <Box sx={{ 
      backgroundColor: backgroundColor,
      minHeight: "100vh",
      pb: 4
    }}>
      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{
          background: `linear-gradient(to right, ${primaryColor}, ${darkPrimaryColor})`,
          color: 'white',
          py: 2,
          px: 3,
          borderRadius: 2,
          mb: 3,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton 
              color="inherit" 
              onClick={() => navigate(-1)}
              sx={{ mr: 2 }}
            >
              <ArrowBack />
            </IconButton>
            <Typography 
              variant="h5" 
              fontWeight="bold"
              sx={{ flexGrow: 1 }}
            >
              Order from {seller.name}
            </Typography>
          </Box>
        </Box>

        {/* Seller Profile Card */}
        <Card sx={{ 
          mb: 3, 
          borderRadius: 2, 
          backgroundColor: 'white',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <Box sx={{ p: 3 }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' }, 
              alignItems: 'center',
              mb: 3
            }}>
              <Avatar 
                src={seller.profileImage} 
                sx={{ 
                  width: 100, 
                  height: 100,
                  border: `3px solid ${primaryColor}`
                }} 
              />
              <Box sx={{ 
                ml: { sm: 3 }, 
                mt: { xs: 2, sm: 0 },
                textAlign: { xs: 'center', sm: 'left' }
              }}>
                <Typography variant="h5" fontWeight="bold" color={textColor}>
                  {seller.name || "No Name"}
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: { xs: 'center', sm: 'flex-start' },
                  mt: 1
                }}>
                  <Rating
                    value={seller.rating || 0}
                    precision={0.5}
                    readOnly
                    size="small"
                    icon={<StarIcon fontSize="inherit" sx={{ color: primaryColor }} />}
                    emptyIcon={<StarIcon fontSize="inherit" sx={{ color: '#e0e0e0' }} />}
                  />
                  <Typography variant="body2" sx={{ ml: 1, color: textColor }}>
                    ({seller.reviewsCount || 0} reviews)
                  </Typography>
                </Box>
                {seller.serviceDescription && (
                  <Chip
                    label={seller.serviceDescription}
                    sx={{ 
                      mt: 1,
                      backgroundColor: lightPrimaryColor,
                      color: darkPrimaryColor,
                      fontWeight: 'bold'
                    }}
                  />
                )}
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Seller Details */}
            <Grid container spacing={2}>
              {seller.city && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Place color="action" sx={{ mr: 1, color: primaryColor }} />
                    <Typography variant="body2" color={textColor}>
                      <strong>City:</strong> {seller.city}
                    </Typography>
                  </Box>
                </Grid>
              )}
              {seller.address && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationOn color="action" sx={{ mr: 1, color: primaryColor }} />
                    <Typography variant="body2" color={textColor}>
                      <strong>Address:</strong> {seller.address}
                    </Typography>
                  </Box>
                </Grid>
              )}
              {seller.preferredLocation && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Place color="action" sx={{ mr: 1, color: primaryColor }} />
                    <Typography variant="body2" color={textColor}>
                      <strong>Preferred Location:</strong> {seller.preferredLocation}
                    </Typography>
                  </Box>
                </Grid>
              )}
              {seller.workType && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Work color="action" sx={{ mr: 1, color: primaryColor }} />
                    <Typography variant="body2" color={textColor}>
                      <strong>Work Type:</strong> {seller.workType}
                    </Typography>
                  </Box>
                </Grid>
              )}
              {seller.experience && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Work color="action" sx={{ mr: 1, color: primaryColor }} />
                    <Typography variant="body2" color={textColor}>
                      <strong>Experience:</strong> {seller.experience}
                    </Typography>
                  </Box>
                </Grid>
              )}
              {seller.education && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <School color="action" sx={{ mr: 1, color: primaryColor }} />
                    <Typography variant="body2" color={textColor}>
                      <strong>Education:</strong> {seller.education}
                    </Typography>
                  </Box>
                </Grid>
              )}
              {seller.age && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Work color="action" sx={{ mr: 1, color: primaryColor }} />
                    <Typography variant="body2" color={textColor}>
                      <strong>Age:</strong> {seller.age}
                    </Typography>
                  </Box>
                </Grid>
              )}
              {seller.hasCertifications === 'Yes' && seller.certificationImage && (
                <Grid item xs={12}>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" fontWeight="500" color={textColor} gutterBottom>
                      Certifications:
                    </Typography>
                    <Box
                      component="img"
                      src={seller.certificationImage}
                      sx={{
                        maxHeight: 150,
                        maxWidth: '100%',
                        borderRadius: 1,
                        cursor: "pointer",
                        border: `1px solid ${primaryColor}`,
                        "&:hover": { opacity: 0.8 },
                      }}
                      onClick={() => window.open(seller.certificationImage, "_blank")}
                    />
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>
        </Card>

        {/* Order Form */}
        <Card sx={{ 
          mb: 3, 
          borderRadius: 2, 
          backgroundColor: 'white',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight="bold" color={textColor} gutterBottom>
              <ShoppingBag sx={{ 
                color: primaryColor, 
                verticalAlign: 'middle', 
                mr: 1 
              }} />
              Place Your Order
            </Typography>
            
            <Box component="form" sx={{ mt: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Order Name"
                    fullWidth
                    margin="normal"
                    value={orderName}
                    onChange={(e) => setOrderName(e.target.value)}
                    InputProps={{ 
                      startAdornment: <ShoppingBag color="action" sx={{ mr: 1, color: primaryColor }} />,
                      sx: { borderRadius: 2 }
                    }}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Telephone Number"
                    fullWidth
                    margin="normal"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    InputProps={{ 
                      startAdornment: <Phone color="action" sx={{ mr: 1, color: primaryColor }} />,
                      sx: { borderRadius: 2 }
                    }}
                    required
                  />
                </Grid>
              </Grid>

              <TextField
                label="Order Description"
                fullWidth
                margin="normal"
                multiline
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                InputProps={{ 
                  startAdornment: <Description color="action" sx={{ mr: 1, color: primaryColor }} />,
                  sx: { borderRadius: 2 }
                }}
                required
              />

              <TextField
                label="Service Address"
                fullWidth
                margin="normal"
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                InputProps={{ 
                  startAdornment: <LocationOn color="action" sx={{ mr: 1, color: primaryColor }} />,
                  sx: { borderRadius: 2 }
                }}
                required
              />

              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <Schedule sx={{ 
                    verticalAlign: 'middle', 
                    mr: 1, 
                    color: primaryColor 
                  }} />
                  Select Date & Time
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="Select Date"
                        value={selectedDate}
                        onChange={(newValue) => setSelectedDate(newValue)}
                        minDate={new Date()}
                        renderInput={(params) => (
                          <TextField 
                            {...params} 
                            fullWidth 
                            sx={{ borderRadius: 2 }}
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: <CalendarMonth color="action" sx={{ mr: 1, color: primaryColor }} />
                            }}
                          />
                        )}
                      />
                    </LocalizationProvider>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <TimePicker
                        label="Select Time"
                        value={selectedTime}
                        onChange={(newValue) => setSelectedTime(newValue)}
                        renderInput={(params) => (
                          <TextField 
                            {...params} 
                            fullWidth 
                            sx={{ borderRadius: 2 }}
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: <AccessTime color="action" sx={{ mr: 1, color: primaryColor }} />
                            }}
                          />
                        )}
                      />
                    </LocalizationProvider>
                  </Grid>
                </Grid>
                <TextField
                  fullWidth
                  margin="normal"
                  value={formattedDateTime}
                  InputProps={{
                    readOnly: true,
                    startAdornment: <Schedule color="action" sx={{ mr: 1, color: primaryColor }} />,
                    sx: { borderRadius: 2 }
                  }}
                  placeholder="Selected date and time will appear here"
                />
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <AddAPhoto sx={{ 
                    verticalAlign: 'middle', 
                    mr: 1, 
                    color: primaryColor 
                  }} />
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
                    color: orderImages.length >= 5 ? "text.disabled" : primaryColor,
                    borderColor: orderImages.length >= 5 ? "action.disabled" : primaryColor,
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: lightPrimaryColor,
                      borderColor: primaryColor
                    }
                  }}
                >
                  Upload Photos ({orderImages.length}/5)
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
                  borderRadius: 2,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  "&:hover": { 
                    backgroundColor: darkPrimaryColor,
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                  },
                }}
                onClick={submitOrder}
                disabled={loading || !orderName || !telephone || !description || !place || !formattedDateTime}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Submit Order"
                )}
              </Button>
            </Box>
          </Box>
        </Card>

        {/* Review Form */}
        <Card sx={{ 
          mb: 3, 
          borderRadius: 2, 
          backgroundColor: 'white',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight="bold" color={textColor} gutterBottom>
              <StarBorder sx={{ 
                color: primaryColor, 
                verticalAlign: 'middle', 
                mr: 1 
              }} />
              Leave a Review
            </Typography>
            
            <Box component="form" sx={{ mt: 3 }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Your Rating
                </Typography>
                <Rating
                  value={rating}
                  precision={0.5}
                  onChange={(e, newValue) => setRating(newValue)}
                  icon={<StarIcon fontSize="large" sx={{ color: primaryColor }} />}
                  emptyIcon={<StarIcon fontSize="large" sx={{ color: '#e0e0e0' }} />}
                  size="large"
                />
              </Box>

              <TextField
                label="Your Review"
                fullWidth
                margin="normal"
                multiline
                rows={4}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                InputProps={{ 
                  startAdornment: <CommentIcon color="action" sx={{ mr: 1, color: primaryColor }} />,
                  sx: { borderRadius: 2 }
                }}
                required
              />

              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <AddAPhoto sx={{ 
                    verticalAlign: 'middle', 
                    mr: 1, 
                    color: primaryColor 
                  }} />
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
                    color: reviewImages.length >= 5 ? "text.disabled" : primaryColor,
                    borderColor: reviewImages.length >= 5 ? "action.disabled" : primaryColor,
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: lightPrimaryColor,
                      borderColor: primaryColor
                    }
                  }}
                >
                  Upload Photos ({reviewImages.length}/5)
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
                  borderRadius: 2,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  "&:hover": { 
                    backgroundColor: darkPrimaryColor,
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                  },
                }}
                onClick={submitReview}
                disabled={reviewLoading || !rating || !reviewText}
              >
                {reviewLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Submit Review"
                )}
              </Button>
            </Box>
          </Box>
        </Card>

        {/* Reviews Section */}
        <Card sx={{ 
          borderRadius: 2, 
          backgroundColor: 'white',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <Box sx={{ p: 3 }}>
            <Box sx={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              mb: 2
            }}>
              <Typography variant="h5" fontWeight="bold" color={textColor}>
                <CommentIcon sx={{ 
                  color: primaryColor, 
                  verticalAlign: 'middle', 
                  mr: 1 
                }} />
                Customer Reviews
              </Typography>
              <Chip
                label={`Latest ${reviews.length} reviews`}
                size="small"
                sx={{ 
                  backgroundColor: lightPrimaryColor,
                  color: darkPrimaryColor,
                  fontWeight: 'bold'
                }}
              />
            </Box>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              What others say about {seller.name}
            </Typography>
            
            <Divider sx={{ my: 3 }} />
            
            <Box sx={{ mt: 2 }}>
              {reviews.length > 0 ? (
                reviews.map(renderReviewCard)
              ) : (
                <Paper sx={{ 
                  p: 3, 
                  textAlign: "center",
                  backgroundColor: lightPrimaryColor
                }}>
                  <Typography variant="body1" color={textColor}>
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
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ 
            width: "100%",
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            '& .MuiAlert-icon': {
              color: snackbar.severity === 'error' ? 'error.main' : `${primaryColor}`
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Order;