import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
function PrivateRoute({ children }) {
  return localStorage.getItem("isAuthenticated") ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/sellerlogin" element={<SellerLogin />} />
        <Route path="/sellerreg" element={<SellerReg />} />

        {/* Private Routes */}
        <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/sellerprofile" element={<PrivateRoute><SellerProfile /></PrivateRoute>} />
        <Route path="/search/:category" element={<Search />} />
        <Route path="/order/:sellerId" element={<PrivateRoute><Order /></PrivateRoute>} />
        
        {/* Add a catch-all route for GitHub Pages refresh issues */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;