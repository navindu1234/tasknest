import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Welcome from "./pages/Welcome";
import Login from "./pages/login"; // Ensure correct case
import Register from "./pages/RegUser"; // Import Registration Page
import Home from "./pages/home"; // Ensure correct case
import Profile from "./pages/profile"; // Ensure correct case
import Search from "./pages/search";
import SellerLogin from "./pages/sellerlogin";
import SellerProfile from "./pages/sellerprofile";
import SellerReg from "./pages/sellerreg";
import Order from "./pages/order"; // Import the Order component

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
        <Route path="/register" element={<Register />} /> {/* Registration Route */}
        <Route path="/sellerlogin" element={<SellerLogin />} /> {/* Seller Login Route */}
        <Route path="/sellerreg" element={<SellerReg />} /> {/* Seller Registration Route */}

        {/* Private Routes */}
        <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/sellerprofile" element={<PrivateRoute><SellerProfile /></PrivateRoute>} /> {/* Seller Profile Route */}
        <Route path="/search/:category" element={<Search />} /> {/* Search Route */}
        <Route path="/order/:sellerId" element={<PrivateRoute><Order /></PrivateRoute>} /> {/* Order Route */}
      </Routes>
    </Router>
  );
}

export default App;