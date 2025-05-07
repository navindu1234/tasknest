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
  FaHistory,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaInfoCircle,
  FaSignOutAlt,
  FaSpinner
} from 'react-icons/fa';
import { MdPayment, MdDescription } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';

const SellerProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { sellerDetails } = location.state || {};
  const [orderStatus, setOrderStatus] = useState('pending');
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success'
  });
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

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
          where('sellerName', '==', sellerDetails.name),
          where('status', '==', orderStatus)
        );
        const querySnapshot = await getDocs(q);
        const ordersData = querySnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() 
        }));
        // Sort by timestamp (newest first)
        ordersData.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        setOrders(ordersData);
      } catch (error) {
        showNotification(`Error fetching orders: ${error.message}`, 'error');
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
    setUpdatingOrderId(orderId);
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { 
        status,
        statusUpdatedAt: serverTimestamp() 
      });

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
          message: `Your order "${orderData.orderName}" has been ${status}`,
          timestamp: serverTimestamp(),
          read: false
        });
      }

      setOrders(prev => prev.filter(order => order.id !== orderId));
      setSelectedOrder(null);
      showNotification(`Order marked as ${status}`, 'success');
    } catch (error) {
      showNotification(`Failed to update order: ${error.message}`, 'error');
    } finally {
      setUpdatingOrderId(null);
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

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!sellerDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-6 bg-white rounded-xl shadow-lg max-w-md w-full mx-4"
        >
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Seller Not Found</h2>
          <p className="mb-6 text-gray-600">Please login with a valid seller code</p>
          <button
            onClick={() => navigate('/seller-login')}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all w-full shadow-md"
          >
            Go to Seller Login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 pb-20">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex justify-between items-center border-b border-gray-100">
        <h1 className="text-xl font-bold text-blue-600">Seller Dashboard</h1>
        <button 
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 text-sm bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition-all"
        >
          <FaSignOutAlt /> Sign Out
        </button>
      </div>

      {/* Profile Section */}
      <div className="p-6 text-center bg-gradient-to-r from-blue-600 to-blue-700 rounded-b-3xl">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="w-28 h-28 mx-auto rounded-full border-4 border-white overflow-hidden shadow-lg"
        >
          {sellerDetails.profileImage ? (
            <img 
              src={sellerDetails.profileImage} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-blue-500 flex items-center justify-center">
              <FaUser className="text-4xl text-white" />
            </div>
          )}
        </motion.div>
        <h2 className="text-2xl font-bold mt-4 text-white">{sellerDetails.name}</h2>
        <p className="text-blue-100 mt-1">{sellerDetails.category}</p>
        <div className="flex items-center justify-center mt-2">
          <FaStar className="text-yellow-300 mr-1" />
          <span className="font-medium">{sellerDetails.rating?.toFixed(1) || '0.0'}</span>
          <span className="text-blue-200 ml-1">({sellerDetails.reviewsCount || 0} reviews)</span>
        </div>
      </div>

      {/* Seller Details */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="m-4 bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
      >
        <div className="p-5">
          <DetailRow icon={<FaBriefcase className="text-blue-500" />} label="Service" value={sellerDetails.serviceDescription} />
          <DetailRow icon={<FaMapMarkerAlt className="text-blue-500" />} label="Location" value={`${sellerDetails.city}, ${sellerDetails.address}`} />
          <DetailRow icon={<FaGraduationCap className="text-blue-500" />} label="Education" value={sellerDetails.education} />
          <DetailRow icon={<FaHistory className="text-blue-500" />} label="Experience" value={sellerDetails.experience} />
          {sellerDetails.phone && (
            <div className="flex items-center mt-3">
              <FaPhone className="text-blue-500 mr-3" />
              <a href={`tel:${sellerDetails.phone}`} className="text-blue-600 hover:text-blue-700 hover:underline transition">
                {sellerDetails.phone}
              </a>
            </div>
          )}
        </div>
      </motion.div>

      {/* Order Management */}
      <div className="mx-4 mt-6">
        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search orders by name, user, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-10 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-400 shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center"
            >
              <FaTimes className="text-gray-400 hover:text-gray-600 transition" />
            </button>
          )}
        </div>

        {/* Status Tabs */}
        <div className="flex border-b border-gray-200 mb-6 overflow-x-auto pb-1">
          {['pending', 'accepted', 'rejected', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setOrderStatus(status)}
              className={`px-5 py-2 font-medium capitalize whitespace-nowrap transition-all relative ${
                orderStatus === status 
                  ? 'text-blue-600 font-semibold' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {status}
              {orderStatus === status && (
                <motion.div 
                  layoutId="statusIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full"
                />
              )}
              <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                {orders.filter(o => o.status === status).length}
              </span>
            </button>
          ))}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100"
          >
            <FaInfoCircle className="mx-auto text-4xl text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-500">
              {searchQuery ? 'No matching orders found' : `No ${orderStatus} orders`}
            </h3>
            <p className="text-gray-400 mt-1">
              {searchQuery ? 'Try a different search term' : 'Check back later for new orders'}
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            <AnimatePresence>
              {filteredOrders.map(order => (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden cursor-pointer"
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">{order.orderName}</h3>
                        <p className="text-gray-500 text-sm mt-1 flex items-center">
                          <FaUser className="mr-2 opacity-70" /> 
                          {order.username || 'Unknown User'}
                        </p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    
                    <p className="mt-3 text-gray-600 line-clamp-2">{order.description}</p>
                    
                    <div className="mt-4 flex flex-wrap gap-3 text-sm">
                      <div className="flex items-center text-gray-500">
                        <FaCalendarAlt className="mr-2 opacity-70" />
                        {formatDate(order.timestamp)}
                      </div>
                      
                      {order.price && (
                        <div className="flex items-center font-medium text-green-600">
                          <FaMoneyBillWave className="mr-2" />
                          ₹{order.price.toLocaleString()}
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 flex justify-end gap-3">
                      {orderStatus === 'pending' && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateOrderStatus(order.id, 'accepted');
                            }}
                            disabled={updatingOrderId === order.id}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-sm disabled:opacity-70"
                          >
                            {updatingOrderId === order.id ? (
                              <FaSpinner className="animate-spin" />
                            ) : (
                              <>
                                <FaCheck /> Accept
                              </>
                            )}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateOrderStatus(order.id, 'rejected');
                            }}
                            disabled={updatingOrderId === order.id}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-sm disabled:opacity-70"
                          >
                            {updatingOrderId === order.id ? (
                              <FaSpinner className="animate-spin" />
                            ) : (
                              <>
                                <FaTimesCircle /> Reject
                              </>
                            )}
                          </button>
                        </>
                      )}
                      {orderStatus === 'accepted' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateOrderStatus(order.id, 'completed');
                          }}
                          disabled={updatingOrderId === order.id}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-sm disabled:opacity-70"
                        >
                          {updatingOrderId === order.id ? (
                            <FaSpinner className="animate-spin" />
                          ) : (
                            <>
                              <FaCheck /> Complete
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-20"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">{selectedOrder.orderName}</h3>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="p-5 space-y-4">
                <DetailRow icon={<FaUser className="text-blue-500" />} label="Customer" value={selectedOrder.username || 'Unknown'} />
                <DetailRow icon={<MdDescription className="text-blue-500" />} label="Description" value={selectedOrder.description || 'No description'} />
                <DetailRow icon={<FaCalendarAlt className="text-blue-500" />} label="Order Date" value={formatDate(selectedOrder.timestamp)} />
                
                {selectedOrder.price && (
                  <DetailRow icon={<FaMoneyBillWave className="text-blue-500" />} label="Price" value={`₹${selectedOrder.price.toLocaleString()}`} />
                )}
                
                {selectedOrder.paymentMethod && (
                  <DetailRow icon={<MdPayment className="text-blue-500" />} label="Payment Method" value={selectedOrder.paymentMethod} />
                )}
                
                <DetailRow 
                  icon={<FaInfoCircle className="text-blue-500" />} 
                  label="Status" 
                  value={
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedOrder.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      selectedOrder.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                      selectedOrder.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedOrder.status}
                    </span>
                  } 
                />
                
                {selectedOrder.customerNotes && (
                  <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FaInfoCircle className="text-blue-400" /> Customer Notes:
                    </h4>
                    <p className="text-gray-600 whitespace-pre-line">{selectedOrder.customerNotes}</p>
                  </div>
                )}
              </div>
              
              <div className="p-5 border-t flex justify-end gap-3">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Close
                </button>
                {orderStatus === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        updateOrderStatus(selectedOrder.id, 'accepted');
                      }}
                      disabled={updatingOrderId === selectedOrder.id}
                      className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition shadow-sm flex items-center gap-2 disabled:opacity-70"
                    >
                      {updatingOrderId === selectedOrder.id ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <>
                          <FaCheck /> Accept Order
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        updateOrderStatus(selectedOrder.id, 'rejected');
                      }}
                      disabled={updatingOrderId === selectedOrder.id}
                      className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition shadow-sm flex items-center gap-2 disabled:opacity-70"
                    >
                      {updatingOrderId === selectedOrder.id ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <>
                          <FaTimesCircle /> Reject Order
                        </>
                      )}
                    </button>
                  </>
                )}
                {orderStatus === 'accepted' && (
                  <button
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, 'completed');
                    }}
                    disabled={updatingOrderId === selectedOrder.id}
                    className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition shadow-sm flex items-center gap-2 disabled:opacity-70"
                  >
                    {updatingOrderId === selectedOrder.id ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <>
                        <FaCheck /> Mark Completed
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 ${
              notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            } text-white`}
          >
            {notification.type === 'success' ? (
              <FaCheck className="text-lg" />
            ) : (
              <FaTimesCircle className="text-lg" />
            )}
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DetailRow = ({ icon, label, value }) => (
  <div className="flex items-start">
    <div className="mt-1 mr-3 flex-shrink-0">
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <div className="mt-1 text-gray-800 break-words">{value}</div>
    </div>
  </div>
);

export default SellerProfile;