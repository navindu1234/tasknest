import React, { useState, useEffect } from "react";
import { db } from "../components/firebase";
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  doc, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot 
} from "firebase/firestore";
import { useUser } from "../components/UserContext";
import Rating from "@mui/material/Rating";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Card, 
  CardContent, 
  Container, 
  Grid, 
  CircularProgress, 
  Divider,
  Paper,
  Snackbar,
  Alert
} from "@mui/material";

const OrderScreen = () => {
  // Get seller ID from URL params
  const { sellerId } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();

  // Form states
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [place, setPlace] = useState("");
  const [time, setTime] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);
  
  // UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sellerInfo, setSellerInfo] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  // Fetch seller data
  useEffect(() => {
    const fetchSellerData = async () => {
      if (!sellerId) return;
      
      try {
        // First try fetching from users collection
        const sellerDoc = await getDoc(doc(db, "users", sellerId));
        
        if (sellerDoc.exists()) {
          setSellerInfo({
            uid: sellerDoc.id,
            ...sellerDoc.data()
          });
        } else {
          // If not found in users, try services collection
          const serviceDoc = await getDoc(doc(db, "services", sellerId));
          
          if (serviceDoc.exists()) {
            setSellerInfo({
              uid: serviceDoc.id,
              ...serviceDoc.data()
            });
          } else {
            setSnackbar({
              open: true,
              message: "Seller not found",
              severity: "error"
            });
          }
        }
      } catch (error) {
        console.error("Error fetching seller data:", error);
        setSnackbar({
          open: true,
          message: `Error: ${error.message}`,
          severity: "error"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSellerData();
  }, [sellerId]);

  // Fetch reviews
  useEffect(() => {
    if (!sellerId) return;

    const reviewsQuery = query(
      collection(db, "reviews"),
      where("sellerId", "==", sellerId),
      orderBy("timestamp", "desc"),
      limit(3)
    );

    const unsubscribe = onSnapshot(reviewsQuery, (snapshot) => {
      const reviewsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReviews(reviewsList);
    }, (error) => {
      console.error("Error fetching reviews:", error);
    });

    return () => unsubscribe();
  }, [sellerId]);

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const validateOrderForm = () => {
    if (!user) {
      setSnackbar({
        open: true,
        message: "Please log in to place an order",
        severity: "error"
      });
      return false;
    }
    
    if (!quantity || isNaN(parseInt(quantity)) || parseInt(quantity) <= 0) {
      setSnackbar({
        open: true,
        message: "Please enter a valid quantity",
        severity: "error"
      });
      return false;
    }
    if (!description.trim()) {
      setSnackbar({
        open: true,
        message: "Please enter a description",
        severity: "error"
      });
      return false;
    }
    if (!place.trim()) {
      setSnackbar({
        open: true,
        message: "Please enter a place",
        severity: "error"
      });
      return false;
    }
    if (!time.trim()) {
      setSnackbar({
        open: true,
        message: "Please enter a time",
        severity: "error"
      });
      return false;
    }
    return true;
  };

  const validateReviewForm = () => {
    if (!user) {
      setSnackbar({
        open: true,
        message: "Please log in to submit a review",
        severity: "error"
      });
      return false;
    }
    
    if (rating === 0) {
      setSnackbar({
        open: true,
        message: "Please select a rating",
        severity: "error"
      });
      return false;
    }
    if (!reviewText.trim()) {
      setSnackbar({
        open: true,
        message: "Please enter a review",
        severity: "error"
      });
      return false;
    }
    return true;
  };

  const submitOrder = async (e) => {
    e.preventDefault();
    if (!validateOrderForm()) return;

    setIsSubmitting(true);
    try {
      // Create new order document
      const orderRef = await addDoc(collection(db, "orders"), {
        sellerName: sellerInfo.name,
        sellerService: sellerInfo.service,
        sellerId: sellerInfo.uid,
        quantity: parseInt(quantity),
        description: description.trim(),
        place: place.trim(),
        time: time.trim(),
        status: "pending",
        timestamp: serverTimestamp(),
        userId: user.uid,
        username: user.username || "Unknown User",
        userPhone: user.telephone || "",
        lastUpdated: serverTimestamp(),
        notificationSeen: false
      });

      // Create notification for seller
      await addDoc(collection(db, "notifications"), {
        recipientId: sellerInfo.uid,
        senderId: user.uid,
        type: "new_order",
        orderId: orderRef.id,
        message: `New order request for ${sellerInfo.service}`,
        timestamp: serverTimestamp(),
        read: false
      });

      setSnackbar({
        open: true,
        message: "Order submitted successfully",
        severity: "success"
      });

      // Reset form
      setQuantity("");
      setDescription("");
      setPlace("");
      setTime("");
      
      // Navigate to my orders page
      setTimeout(() => {
        navigate(`/my-orders/${user.uid}`);
      }, 1500);
    } catch (error) {
      console.error("Error submitting order:", error);
      setSnackbar({
        open: true,
        message: `Error: ${error.message}`,
        severity: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!validateReviewForm()) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "reviews"), {
        sellerId: sellerInfo.uid,
        userId: user.uid,
        username: user.username || "Unknown User",
        rating: rating,
        review: reviewText.trim(),
        timestamp: serverTimestamp()
      });

      setSnackbar({
        open: true,
        message: "Review submitted successfully",
        severity: "success"
      });

      // Reset form
      setReviewText("");
      setRating(0);
    } catch (error) {
      console.error("Error submitting review:", error);
      setSnackbar({
        open: true,
        message: `Error: ${error.message}`,
        severity: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress sx={{ color: "#89AC46" }} />
      </Box>
    );
  }

  if (!sellerInfo) {
    return (
      <Container>
        <Typography variant="h5" sx={{ textAlign: "center", mt: 5 }}>
          Seller not found
        </Typography>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `url('/assets/new.png')`,
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
        py: 3
      }}
    >
      {/* App Bar */}
      <Paper 
        elevation={3}
        sx={{ 
          backgroundColor: "rgba(137, 172, 70, 0.8)", 
          py: 2, 
          px: 3, 
          mb: 3,
          borderRadius: 0
        }}
      >
        <Typography variant="h5" color="white" fontWeight="600">
          Order from {sellerInfo.name}
        </Typography>
      </Paper>

      <Container maxWidth="md">
        <Grid container spacing={3}>
          <Grid item xs={12}>
            {/* Order Form Card */}
            <Card 
              elevation={5} 
              sx={{ 
                borderRadius: 3, 
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                mb: 3
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography 
                  variant="h6" 
                  color="#6E8D38" 
                  fontWeight="600" 
                  gutterBottom
                >
                  Service: {sellerInfo.service}
                </Typography>
                
                <Box component="form" onSubmit={submitOrder} sx={{ mt: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Quantity"
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        required
                        sx={{
                          "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#89AC46",
                          },
                          bgcolor: "white",
                          borderRadius: 2
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Order Description"
                        multiline
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        sx={{
                          "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#89AC46",
                          },
                          bgcolor: "white",
                          borderRadius: 2
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Place"
                        value={place}
                        onChange={(e) => setPlace(e.target.value)}
                        required
                        sx={{
                          "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#89AC46",
                          },
                          bgcolor: "white",
                          borderRadius: 2
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        required
                        sx={{
                          "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#89AC46",
                          },
                          bgcolor: "white",
                          borderRadius: 2
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={isSubmitting}
                        sx={{
                          height: 50,
                          bgcolor: "#89AC46",
                          borderRadius: 2,
                          "&:hover": {
                            bgcolor: "#6E8D38",
                          },
                          fontSize: 16,
                          fontWeight: 600
                        }}
                      >
                        {isSubmitting ? <CircularProgress size={24} color="inherit" /> : "Submit Order"}
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
            
            {/* Review Form Card */}
            <Card 
              elevation={5} 
              sx={{ 
                borderRadius: 3, 
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                mb: 3 
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography 
                  variant="h6" 
                  color="#6E8D38" 
                  fontWeight="600" 
                  gutterBottom
                >
                  Leave a Review
                </Typography>
                
                <Box component="form" onSubmit={submitReview} sx={{ mt: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sx={{ display: "flex", justifyContent: "center" }}>
                      <Rating
                        name="rating"
                        value={rating}
                        precision={0.5}
                        onChange={(e, newValue) => setRating(newValue)}
                        size="large"
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Your Review"
                        multiline
                        rows={4}
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        required
                        sx={{
                          "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#89AC46",
                          },
                          bgcolor: "white",
                          borderRadius: 2
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={isSubmitting}
                        sx={{
                          height: 50,
                          bgcolor: "#89AC46",
                          borderRadius: 2,
                          "&:hover": {
                            bgcolor: "#6E8D38",
                          },
                          fontSize: 16,
                          fontWeight: 600
                        }}
                      >
                        {isSubmitting ? <CircularProgress size={24} color="inherit" /> : "Submit Review"}
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
            
            {/* Reviews List Card */}
            <Card 
              elevation={5} 
              sx={{ 
                borderRadius: 3, 
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                mb: 3 
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography 
                  variant="h6" 
                  color="#6E8D38" 
                  fontWeight="600" 
                  gutterBottom
                >
                  Latest Reviews
                </Typography>
                
                {reviews.length === 0 ? (
                  <Typography color="text.secondary" sx={{ mt: 2 }}>
                    No reviews yet
                  </Typography>
                ) : (
                  <Box sx={{ mt: 2 }}>
                    {reviews.map((review, index) => (
                      <React.Fragment key={review.id}>
                        {index > 0 && <Divider sx={{ my: 3 }} />}
                        <Paper 
                          elevation={2}
                          sx={{ 
                            p: 2, 
                            borderRadius: 2,
                            bgcolor: "white" 
                          }}
                        >
                          <Typography variant="subtitle1" fontWeight="600">
                            {review.username}
                          </Typography>
                          
                          <Box sx={{ mt: 1 }}>
                            <Rating 
                              value={review.rating} 
                              precision={0.5} 
                              readOnly 
                              size="small" 
                            />
                          </Box>
                          
                          <Typography variant="body1" sx={{ mt: 1 }}>
                            {review.review}
                          </Typography>
                        </Paper>
                      </React.Fragment>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OrderScreen;