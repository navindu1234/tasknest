import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="flex justify-between items-center p-4 bg-gradient-to-r from-green-300 to-green-500 text-white shadow-lg">
      <h2 className="text-3xl font-bold">TASKNEST</h2>
      <div className="flex items-center gap-8 text-xl">
        <Link to="/home" className="hover:text-green-200 transition duration-200">Home</Link>
        
        <Link to="/profile" className="hover:text-green-200 transition duration-200">Profile</Link>
        
        {/* Notification and Emoji Box */}
        <div className="flex items-center gap-4">
          <button className="relative hover:text-green-200 transition duration-200">
            🔔
            <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full h-4 w-4 flex items-center justify-center">3</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;