import React, { useState, useEffect } from 'react';
import { db } from '../components/firebase';
import { useLocation } from 'react-router-dom';
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { Container, Typography, Grid, Card, CardContent, Button, Box } from '@mui/material';

const SellerProfile = () => {
  const location = useLocation();
  const sellerDetails = location.state?.sellerDetails || {};
  const [orderStatus, setOrderStatus] = useState('pending');
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!sellerDetails.name) return;

      const q = query(
        collection(db, 'orders'),
        where('sellerName', '==', sellerDetails.name),
        where('status', '==', orderStatus)
      );
      const querySnapshot = await getDocs(q);
      const ordersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(ordersData);
    };

    fetchOrders();
  }, [orderStatus, sellerDetails.name]);

  const updateOrderStatus = async (orderId, status) => {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, { status });
    setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId)); 
  };

  return (
    <div className="bg-gradient-to-b from-green-500 to-green-800 min-h-screen flex flex-col relative text-white">
      {/* Seller Information */}
      <Box sx={{
        backgroundColor: '#ffffff',
        padding: 3,
        borderRadius: 2,
        boxShadow: 2,
        mb: 3,
        textAlign: 'center',
        marginTop: '80px' // To offset navbar if you have one
      }}>
        <Typography variant="h4" color="primary" fontWeight="bold">Seller Profile</Typography>
        <Typography variant="h6" sx={{ mt: 1 }}><strong>Name:</strong> {sellerDetails.name || 'Unknown'}</Typography>
        <Typography variant="h6"><strong>Service:</strong> {sellerDetails.service || 'No service'}</Typography>
      </Box>

      {/* Order Status Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
        <Button 
          variant={orderStatus === 'pending' ? 'contained' : 'outlined'} 
          color="primary" 
          onClick={() => setOrderStatus('pending')}
          sx={{ backgroundColor: 'green', color: 'white' }}
        >
          Pending Orders
        </Button>
        <Button 
          variant={orderStatus === 'accepted' ? 'contained' : 'outlined'} 
          color="success" 
          onClick={() => setOrderStatus('accepted')}
          sx={{ backgroundColor: 'green', color: 'white' }}
        >
          Accepted Orders
        </Button>
        <Button 
          variant={orderStatus === 'rejected' ? 'contained' : 'outlined'} 
          color="error" 
          onClick={() => setOrderStatus('rejected')}
          sx={{ backgroundColor: 'green', color: 'white' }}
        >
          Rejected Orders
        </Button>
      </Box>

      {/* Orders List */}
      <Typography variant="h5" sx={{ mb: 2, color: 'white' }}>{orderStatus.toUpperCase()} ORDERS</Typography>
      {orders.length === 0 ? (
        <Typography variant="body1" color="textSecondary">No orders available for this status.</Typography>
      ) : (
        <Grid container spacing={3}>
          {orders.map(order => (
            <Grid item xs={12} sm={6} key={order.id}>
              <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6"><strong>User ID:</strong> {order.userId || 'Unknown'}</Typography>
                  <Typography variant="body1"><strong>Service:</strong> {order.sellerService || 'No service'}</Typography>
                  <Typography variant="body1"><strong>Quantity:</strong> {order.quantity || 0}</Typography>

                  {orderStatus === 'pending' && (
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                      <Button 
                        variant="contained" 
                        color="success" 
                        onClick={() => updateOrderStatus(order.id, 'accepted')}
                      >
                        Accept
                      </Button>
                      <Button 
                        variant="contained" 
                        color="error" 
                        onClick={() => updateOrderStatus(order.id, 'rejected')}
                      >
                        Reject
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </div>
  );
};

export default SellerProfile;
