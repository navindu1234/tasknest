import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from '../components/firebase'; // Ensure this is correctly initialized

const SellerLogin = () => {
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();

  // Function to validate the unique code in Firebase
  const validateUniqueCode = async (code) => {
    try {
      const q = query(collection(db, 'services'), where('uniqueCode', '==', code));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        console.log("Seller Found:", querySnapshot.docs[0].data()); // Debugging
        return querySnapshot.docs[0].data(); // Return seller details
      } else {
        console.log("No Seller Found for code:", code); // Debugging
        return null; // No matching record found
      }
    } catch (e) {
      console.error('Error fetching unique code:', e);
      return null;
    }
  };

  // Login function
  const login = async () => {
    setErrorMessage(null); // Clear error messages
    const trimmedCode = code.trim();

    if (!trimmedCode) {
      setErrorMessage("Please enter a unique code.");
      return;
    }

    const sellerDetails = await validateUniqueCode(trimmedCode);

    if (sellerDetails) {
      navigate('/sellerprofile', { state: { sellerDetails } }); // Pass details through state
    } else {
      setErrorMessage("Invalid unique code. Please try again.");
    }
  };

  // Redirect to seller registration page
  const createSellerAccount = () => {
    navigate('/sellerreg'); 
  };

  return (
    <div className="bg-gradient-to-b from-green-500 to-green-800 min-h-screen flex flex-col justify-center items-center text-white">
      <h2 className="text-center text-3xl font-bold mb-8">Enter Your Unique Code:</h2>
      <div className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-lg text-center relative">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Unique Code"
          className="w-full p-4 rounded-lg border-2 border-green-500 text-gray-700 mb-4 outline-none"
        />
        {errorMessage && <p className="text-red-600 mb-4">{errorMessage}</p>}
        
        <button
          onClick={login}
          className="w-full bg-green-600 text-white py-3 rounded-lg shadow-md hover:bg-green-700 transition mb-4"
        >
          Login
        </button>

        <button
          onClick={createSellerAccount}
          className="w-full bg-blue-600 text-white py-3 rounded-lg shadow-md hover:bg-blue-700 transition"
        >
          Create Seller Account
        </button>
      </div>
    </div>
  );
};

export default SellerLogin;