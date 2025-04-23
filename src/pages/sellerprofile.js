import React, { useState, useEffect } from 'react';
import { db } from '../components/firebase';
import { useLocation } from 'react-router-dom';
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
  addDoc
} from 'firebase/firestore';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  Avatar,
  TextField,
  InputAdornment,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Search,
  Clear,
  Star,
  Work,
  LocationCity,
  Place,
  LocationOn,
  BusinessCenter,
  School,
  Timeline,
  ConfirmationNumber,
  Phone,
  Person
} from '@mui/icons-material';

const SellerProfile = () => {
  const location = useLocation();
  const sellerDetails = location.state?.sellerDetails || {};
  const [orderStatus, setOrderStatus] = useState('pending');
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const primaryColor = '#0d47a1';
  const secondaryColor = '#1565c0';

  useEffect(() => {
    const fetchOrders = async () => {
      if (!sellerDetails.uid) return;
      setLoading(true);

      try {
        const q = query(
          collection(db, 'orders'),
          where('sellerId', '==', sellerDetails.uid),
          where('status', '==', orderStatus)
        );
        const querySnapshot = await getDocs(q);
        const ordersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrders(ordersData);
      } catch (error) {
        setSnackbar({
          open: true,
          message: `Error fetching orders: ${error.message}`,
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [orderStatus, sellerDetails.uid]);

  const updateOrderStatus = async (orderId, status) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
      });

      const orderDoc = await getDocs(query(collection(db, 'orders'), where('__name__', '==', orderId)));
      const orderData = orderDoc.docs[0].data();

      await addDoc(collection(db, 'notifications'), {
        recipientId: orderData.userId,
        senderId: sellerDetails.uid,
        type: 'order_update',
        orderId,
        message: `Your order status has been updated to ${status}`,
        timestamp: serverTimestamp(),
        read: false
      });

      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));

      setSnackbar({
        open: true,
        message: `Order status updated to ${status}`,
        severity: status === 'accepted' ? 'success' : 'error'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Error updating order: ${error.message}`,
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const filteredOrders = orders.filter(order => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (order.orderName?.toLowerCase().includes(query)) ||
      (order.username?.toLowerCase().includes(query)) ||
      (order.description?.toLowerCase().includes(query)) ||
      (order.id?.toLowerCase().includes(query))
    );
  });

  return (
    <Box sx={{
      minHeight: '100vh',
      background: `linear-gradient(to bottom, ${primaryColor}, ${secondaryColor}, #1976d2)`,
      color: 'white'
    }}>
      <Box sx={{ backgroundColor: primaryColor, padding: 2, boxShadow: 3, position: 'sticky', top: 0 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
          Seller Dashboard
        </Typography>
      </Box>

      <Box sx={{ backgroundColor: primaryColor, padding: 3, borderRadius: '0 0 30px 30px', textAlign: 'center' }}>
        <Avatar
          src={sellerDetails.profileImage}
          sx={{ width: 120, height: 120, border: '3px solid white', fontSize: 60 }}
        >
          {!sellerDetails.profileImage && <Person fontSize="inherit" />}
        </Avatar>
        <Typography variant="h5" sx={{ mt: 2, fontWeight: 'bold' }}>
          {sellerDetails.name || 'No Name'}
        </Typography>
        <Typography variant="subtitle1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          {sellerDetails.service || 'No Service'}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 1 }}>
          <Star sx={{ color: 'gold', fontSize: 20 }} />
          <Typography variant="body1" sx={{ ml: 0.5 }}>
            {sellerDetails.rating?.toFixed(1) || '0.0'}
          </Typography>
          <Typography variant="body1" sx={{ ml: 0.5, color: 'rgba(255, 255, 255, 0.7)' }}>
            ({sellerDetails.reviewsCount || 0})
          </Typography>
        </Box>
      </Box>

      <Card sx={{ mx: 2, mt: 2, borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <DetailRow icon={<Work />} label="Category" value={sellerDetails.category} />
          <DetailRow icon={<LocationCity />} label="City" value={sellerDetails.city} />
          <DetailRow icon={<Place />} label="Address" value={sellerDetails.address} />
          <DetailRow icon={<LocationOn />} label="Preferred Location" value={sellerDetails.preferredLocation} />
          <DetailRow icon={<BusinessCenter />} label="Work Type" value={sellerDetails.workType} />
          <DetailRow icon={<School />} label="Education" value={sellerDetails.education} />
          <DetailRow icon={<Timeline />} label="Experience" value={sellerDetails.experience} />
          <DetailRow icon={<ConfirmationNumber />} label="Unique Code" value={sellerDetails.uniqueCode} />
          {sellerDetails.phone && (
            <Box component="a" href={`tel:${sellerDetails.phone}`} sx={{ display: 'flex', alignItems: 'center', mt: 2, textDecoration: 'none' }}>
              <Phone sx={{ mr: 2 }} />
              <Typography variant="body2">{sellerDetails.phone}</Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <Box sx={{ mx: 2, mt: 2 }}>
        <TextField
          fullWidth
          placeholder="Search Orders..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton onClick={() => setSearchQuery('')}>
                  <Clear />
                </IconButton>
              </InputAdornment>
            ),
            sx: {
              backgroundColor: 'white',
              borderRadius: 30,
            }
          }}
        />
      </Box>

      <Box sx={{ mx: 2, mt: 2 }}>
        <ToggleButtonGroup
          value={orderStatus}
          exclusive
          onChange={(e, newStatus) => newStatus && setOrderStatus(newStatus)}
          fullWidth
          sx={{ borderRadius: 30 }}
        >
          <ToggleButton value="pending">Pending</ToggleButton>
          <ToggleButton value="accepted">Accepted</ToggleButton>
          <ToggleButton value="rejected">Rejected</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box sx={{ mx: 2, mt: 2, mb: 4 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress color="inherit" />
          </Box>
        ) : filteredOrders.length === 0 ? (
          <Typography variant="body1" sx={{ textAlign: 'center', mt: 2 }}>
            {searchQuery ? 'No orders match your search' : `No ${orderStatus} orders found`}
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {filteredOrders.map(order => (
              <Grid item xs={12} key={order.id}>
                {/* Replace below with your own OrderCard component */}
                <Card sx={{ p: 2, borderRadius: 3 }}>
                  <Typography variant="h6">{order.orderName}</Typography>
                  <Typography>{order.description}</Typography>
                  <Button
                    variant="contained"
                    onClick={() => updateOrderStatus(order.id, 'accepted')}
                    sx={{ mt: 1 }}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => updateOrderStatus(order.id, 'rejected')}
                    sx={{ mt: 1, ml: 2 }}
                  >
                    Reject
                  </Button>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

const DetailRow = ({ icon, label, value }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', my: 1 }}>
    <Box sx={{ mr: 2 }}>{icon}</Box>
    <Box>
      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{label}:</Typography>
      <Typography variant="body2">{value || 'Not specified'}</Typography>
    </Box>
  </Box>
);

export default SellerProfile;
