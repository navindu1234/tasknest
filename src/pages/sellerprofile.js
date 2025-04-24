import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../components/firebase';
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
  FaUser, 
  FaBriefcase, 
  FaMapMarkerAlt, 
  FaGraduationCap, 
  FaPhone,
  FaStar,
  FaSearch,
  FaTimes,
  FaCheck,
  FaTimesCircle,
  FaHistory
} from 'react-icons/fa';

const SellerProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { sellerDetails } = location.state || {};
  const [orderStatus, setOrderStatus] = useState('pending');
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  useEffect(() => {
    if (!sellerDetails?.id) {
      navigate('/seller-login');
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'orders'),
          where('sellerId', '==', sellerDetails.id),
          where('status', '==', orderStatus)
        );
        const querySnapshot = await getDocs(q);
        const ordersData = querySnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        }));
        setOrders(ordersData);
      } catch (error) {
        showNotification(`Error: ${error.message}`, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [orderStatus, sellerDetails?.id, navigate]);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status });

      // Get order details for notification
      const orderQuery = query(collection(db, 'orders'), where('__name__', '==', orderId));
      const orderSnapshot = await getDocs(orderQuery);
      const orderData = orderSnapshot.docs[0]?.data();

      if (orderData?.userId) {
        await addDoc(collection(db, 'notifications'), {
          recipientId: orderData.userId,
          senderId: sellerDetails.id,
          type: 'order_update',
          orderId,
          message: `Your order status has been updated to ${status}`,
          timestamp: serverTimestamp(),
          read: false
        });
      }

      setOrders(prev => prev.filter(order => order.id !== orderId));
      showNotification(`Order ${status} successfully`, 'success');
    } catch (error) {
      showNotification(`Failed to update order: ${error.message}`, 'error');
    }
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

  if (!sellerDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Seller Not Found</h2>
          <p className="mb-4">Please login with a valid seller code</p>
          <button
            onClick={() => navigate('/seller-login')}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Go to Seller Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-700 text-white">
      {/* Header */}
      <div className="bg-blue-800 p-4 shadow-md sticky top-0 z-10">
        <h1 className="text-xl font-bold text-center">Seller Dashboard</h1>
      </div>

      {/* Profile Section */}
      <div className="p-6 text-center bg-blue-800 rounded-b-3xl">
        <div className="w-24 h-24 mx-auto rounded-full border-4 border-white overflow-hidden">
          {sellerDetails.profileImage ? (
            <img 
              src={sellerDetails.profileImage} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-blue-600 flex items-center justify-center">
              <FaUser className="text-3xl text-white" />
            </div>
          )}
        </div>
        <h2 className="text-xl font-bold mt-3">{sellerDetails.name}</h2>
        <p className="text-blue-200">{sellerDetails.category}</p>
        <div className="flex items-center justify-center mt-1">
          <FaStar className="text-yellow-400 mr-1" />
          <span>{sellerDetails.rating?.toFixed(1) || '0.0'}</span>
          <span className="text-blue-300 ml-1">({sellerDetails.reviewsCount || 0})</span>
        </div>
      </div>

      {/* Seller Details */}
      <div className="m-4 bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-4 text-gray-800">
          <DetailRow icon={<FaBriefcase />} label="Service" value={sellerDetails.serviceDescription} />
          <DetailRow icon={<FaMapMarkerAlt />} label="Location" value={`${sellerDetails.city}, ${sellerDetails.address}`} />
          <DetailRow icon={<FaGraduationCap />} label="Education" value={sellerDetails.education} />
          <DetailRow icon={<FaHistory />} label="Experience" value={sellerDetails.experience} />
          {sellerDetails.phone && (
            <div className="flex items-center mt-3">
              <FaPhone className="text-blue-600 mr-3" />
              <a href={`tel:${sellerDetails.phone}`} className="text-blue-600 hover:underline">
                {sellerDetails.phone}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Order Management */}
      <div className="m-4">
        {/* Search Bar */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <FaTimes className="text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* Status Tabs */}
        <div className="flex border-b border-blue-300 mb-4">
          {['pending', 'accepted', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setOrderStatus(status)}
              className={`px-4 py-2 font-medium capitalize ${orderStatus === status 
                ? 'text-blue-400 border-b-2 border-blue-400' 
                : 'text-blue-200 hover:text-blue-300'}`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-400"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-8 text-blue-200">
            {searchQuery ? 'No matching orders found' : `No ${orderStatus} orders`}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map(order => (
              <div key={order.id} className="bg-white rounded-lg shadow-md p-4 text-gray-800">
                <h3 className="font-bold">{order.orderName}</h3>
                <p className="text-gray-600 text-sm mt-1">{order.description}</p>
                <div className="flex justify-end mt-3 space-x-2">
                  {orderStatus === 'pending' && (
                    <>
                      <button
                        onClick={() => updateOrderStatus(order.id, 'accepted')}
                        className="bg-green-500 text-white px-3 py-1 rounded flex items-center"
                      >
                        <FaCheck className="mr-1" /> Accept
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, 'rejected')}
                        className="bg-red-500 text-white px-3 py-1 rounded flex items-center"
                      >
                        <FaTimesCircle className="mr-1" /> Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notification */}
      {notification.show && (
        <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

const DetailRow = ({ icon, label, value }) => (
  <div className="flex items-start mb-3">
    <div className="text-blue-600 mt-1 mr-3">{icon}</div>
    <div>
      <p className="font-medium text-gray-700">{label}</p>
      <p className="text-gray-600">{value || 'Not specified'}</p>
    </div>
  </div>
);

export default SellerProfile;