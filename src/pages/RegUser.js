import React, { useState } from "react";
import { auth, db, storage } from "../components/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { collection, doc, setDoc, getDocs, query, where } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { FiUser, FiMail, FiPhone, FiLock, FiCalendar, FiHome, FiCamera } from "react-icons/fi";
import { FaSpinner } from "react-icons/fa";

const RegUser = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    dob: "",
    address: "",
    gender: "",
    userType: "",
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImagePick = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("Image size should be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    // Validation
    if (!agreedToTerms) {
      setError("You must agree to the Terms & Conditions");
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      // Check if username exists
      const usersRef = collection(db, "users");
      const usernameQuery = query(usersRef, where("username", "==", formData.username));
      const usernameSnapshot = await getDocs(usernameQuery);

      if (!usernameSnapshot.empty) {
        setError("Username already exists");
        setIsLoading(false);
        return;
      }

      // Check if email exists
      const emailQuery = query(usersRef, where("email", "==", formData.email));
      const emailSnapshot = await getDocs(emailQuery);

      if (!emailSnapshot.empty) {
        setError("Email already exists");
        setIsLoading(false);
        return;
      }

      // Create auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      // Upload image if exists
      let imageUrl = "";
      if (profileImage) {
        const fileInput = document.querySelector('input[type="file"]');
        const file = fileInput.files[0];
        if (file) {
          const storageRef = ref(storage, `profileImages/${user.uid}`);
          const uploadTask = await uploadBytes(storageRef, file);
          imageUrl = await getDownloadURL(uploadTask.ref);
        }
      }

      // Save user data
      await setDoc(doc(usersRef, user.uid), {
        username: formData.username,
        email: formData.email,
        fullName: formData.fullName,
        phone: formData.phone,
        dob: formData.dob,
        address: formData.address,
        gender: formData.gender,
        userType: formData.userType,
        profileImage: imageUrl,
        createdAt: new Date().toISOString(),
      });

      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      console.error("Registration error:", error);
      setError(error.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Side - Visual Appeal */}
        <div className="md:w-1/3 bg-gradient-to-b from-green-600 to-green-700 p-8 text-white flex flex-col justify-center items-center text-center">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Join Our Community</h1>
            <p className="opacity-90">Start your journey with us today</p>
          </div>
          
          <div className="hidden md:block">
            <svg className="w-64 h-64" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="100" cy="100" r="80" fill="white" fillOpacity="0.1"/>
              <circle cx="100" cy="80" r="40" fill="white" fillOpacity="0.2"/>
              <path d="M100 120C120 120 140 140 140 160H60C60 140 80 120 100 120Z" fill="white" fillOpacity="0.3"/>
              <path d="M100 120C80 120 60 140 60 160H140C140 140 120 120 100 120Z" fill="white" fillOpacity="0.2"/>
            </svg>
          </div>
          
          <div className="mt-8">
            <p className="text-sm opacity-80 mb-4">Already have an account?</p>
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-2 border-2 border-white rounded-full text-sm font-medium hover:bg-white hover:text-green-700 transition-colors duration-300"
            >
              Sign In
            </button>
          </div>
        </div>
        
        {/* Right Side - Registration Form */}
        <div className="md:w-2/3 p-8 md:p-10">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Create Account</h2>
            <p className="text-gray-600">Fill in your details to get started</p>
          </div>
          
          <form onSubmit={handleRegister}>
            {/* Profile Image Upload */}
            <div className="flex justify-center mb-6">
              <div className="relative group">
                <label className="cursor-pointer">
                  <div className="w-24 h-24 rounded-full border-4 border-green-100 flex items-center justify-center overflow-hidden bg-white hover:border-green-300 transition-all duration-300 shadow-md group-hover:shadow-lg">
                    {profileImage ? (
                      <img 
                        src={profileImage} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center text-green-400">
                        <FiCamera size={28} className="group-hover:text-green-600 transition-colors" />
                        <span className="text-xs mt-1 text-gray-500 group-hover:text-gray-700">Add Photo</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImagePick}
                    className="hidden"
                  />
                </label>
                {profileImage && (
                  <button 
                    type="button"
                    onClick={() => setProfileImage(null)}
                    className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded-full hover:bg-red-600 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            {/* Status Messages */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-100 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {success}
              </div>
            )}

            {/* Personal Information Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                <span className="w-4 h-4 bg-green-500 rounded-full mr-2"></span>
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      name="fullName"
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Username</label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      name="username"
                      placeholder="johndoe"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      minLength="3"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="1234567890"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      pattern="[0-9]{10,15}"
                      title="Please enter a valid phone number"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      required
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Account Security Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                <span className="w-4 h-4 bg-green-500 rounded-full mr-2"></span>
                Account Security
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="password"
                      name="password"
                      placeholder="••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength="6"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                <span className="w-4 h-4 bg-green-500 rounded-full mr-2"></span>
                Additional Information
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <div className="relative">
                    <FiHome className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      name="address"
                      placeholder="123 Main St, City"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">User Type</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="userType"
                        value="Buyer"
                        checked={formData.userType === "Buyer"}
                        onChange={handleChange}
                        required
                        className="sr-only"
                      />
                      <div className={`w-full p-4 border rounded-lg transition-all duration-300 ${
                        formData.userType === "Buyer" 
                          ? "border-green-500 bg-green-50 shadow-inner" 
                          : "border-gray-300 hover:border-green-300"
                      }`}>
                        <div className="font-semibold text-gray-800">Buyer</div>
                        <div className="text-xs text-gray-500 mt-1">I want to hire freelancers</div>
                      </div>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="userType"
                        value="Seller"
                        checked={formData.userType === "Seller"}
                        onChange={handleChange}
                        required
                        className="sr-only"
                      />
                      <div className={`w-full p-4 border rounded-lg transition-all duration-300 ${
                        formData.userType === "Seller" 
                          ? "border-green-500 bg-green-50 shadow-inner" 
                          : "border-gray-300 hover:border-green-300"
                      }`}>
                        <div className="font-semibold text-gray-800">Seller</div>
                        <div className="text-xs text-gray-500 mt-1">I want to offer services</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="mb-6">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    required
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                </div>
                <label htmlFor="terms" className="ml-3 text-sm text-gray-600">
                  I agree to the <a href="/terms" className="text-green-600 hover:underline font-medium">Terms of Service</a> and <a href="/privacy" className="text-green-600 hover:underline font-medium">Privacy Policy</a>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full ${
                isLoading ? 'bg-green-500' : 'bg-green-600 hover:bg-green-700'
              } text-white py-3 rounded-lg transition duration-300 flex items-center justify-center shadow-md hover:shadow-lg`}
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Creating Account...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Create Account
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegUser;