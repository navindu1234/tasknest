import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from '../components/firebase';
import { FaUserTie, FaUserPlus } from 'react-icons/fa';

const SellerLogin = () => {
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateUniqueCode = async (code) => {
    try {
      const q = query(collection(db, 'services'), where('uniqueCode', '==', code));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        return { 
          id: querySnapshot.docs[0].id,
          ...querySnapshot.docs[0].data() 
        };
      }
      return null;
    } catch (e) {
      console.error('Error fetching unique code:', e);
      return null;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    const trimmedCode = code.trim();

    if (!trimmedCode) {
      setErrorMessage("Please enter your unique code");
      return;
    }

    setIsLoading(true);
    try {
      const sellerDetails = await validateUniqueCode(trimmedCode);
      
      if (sellerDetails) {
        navigate('/sellerprofile', { state: { sellerDetails } });
      } else {
        setErrorMessage("Invalid code. Please try again.");
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again.");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-500 to-green-800 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="bg-green-600 p-6 text-center">
          <h2 className="text-2xl font-bold text-white">Seller Login</h2>
          <p className="text-green-100 mt-1">Enter your unique seller code</p>
        </div>

        <form onSubmit={handleLogin} className="p-6">
          <div className="mb-5">
            <label htmlFor="code" className="block text-gray-700 mb-2 font-medium">
              Unique Seller Code
            </label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter your 5-digit code"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
              required
            />
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            // disabled={isLoading}
            onClick={() => navigate('/sellerprofile')}
            className={`w-full py-3 px-4 rounded-lg text-white font-bold shadow-md transition flex items-center justify-center ${
              isLoading ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </>
            ) : (
              <>
                <FaUserTie className="mr-2" /> Login
              </>
            )}
          </button>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => navigate('/sellerreg')}
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center mx-auto"
            >
              <FaUserPlus className="mr-2" /> Register as Seller
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellerLogin;