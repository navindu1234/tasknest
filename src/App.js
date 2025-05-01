import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Welcome from "./pages/Welcome";
import Login from "./pages/login";
import Register from "./pages/RegUser";
import Home from "./pages/home";
import Profile from "./pages/profile";
import Search from "./pages/search";
import SellerLogin from "./pages/sellerlogin";
import SellerProfile from "./pages/sellerprofile";
import SellerReg from "./pages/sellerreg";
import Order from "./pages/order";

// Private Route Component for Authentication
function PrivateRoute({ children, sellerOnly = false }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (sellerOnly && currentUser.userType !== 'seller') {
    return <Navigate to="/home" />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/sellerlogin" element={<SellerLogin />} />
          <Route path="/sellerprofile" element={<SellerProfile />} />
          <Route path="/sellerreg" element={<SellerReg />} />
          <Route path="/search/:category" element={<Search />} />

          {/* Private Routes - Regular Users */}
          <Route path="/home" element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />

          {/* Private Routes - Sellers Only */}
          <Route path="/sellerprofile" element={
            <PrivateRoute sellerOnly>
              <SellerProfile />
            </PrivateRoute>
          } />
          <Route path="/order/:sellerId" element={
            <PrivateRoute>
              <Order />
            </PrivateRoute>
          } />

          {/* Add a catch-all route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;