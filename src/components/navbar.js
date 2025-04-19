import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="flex justify-between items-center p-4 bg-gradient-to-r from-green-300 to-green-500 text-white shadow-lg">
      <h2 className="text-2xl font-bold">TASKNEST</h2>
      <div className="flex gap-6">
        <Link to="/home" className="hover:text-green-200 transition duration-200">Home</Link>
        <Link to="/profile" className="hover:text-green-200 transition duration-200">Profile</Link>
        <Link to="/notifications" className="hover:text-green-200 transition duration-200">Notifications</Link>
        <Link to="/search" className="hover:text-green-200 transition duration-200">Search</Link>
      </div>
    </nav>
  );
}

export default Navbar;
