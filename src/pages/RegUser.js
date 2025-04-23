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
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-500 to-green-700 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
        <div className="bg-green-600 p-6 text-white text-center">
          <h2 className="text-3xl font-bold">Join Our Community</h2>
          <p className="mt-2">Create an account to start your journey</p>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleRegister}>
            {/* Profile Image */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <label className="cursor-pointer">
                  <div className="w-32 h-32 rounded-full border-2 border-gray-300 flex items-center justify-center overflow-hidden bg-white hover:border-green-500 transition-colors duration-300">
                    {profileImage ? (
                      <img 
                        src={profileImage} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center text-gray-500">
                        <FiCamera size={30} />
                        <span className="text-xs mt-1">Add Photo</span>
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
                    className="text-green-600 hover:underline text-sm mt-2"
                  >
                    Remove photo
                  </button>
                )}
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">
                {success}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    name="fullName"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Username
                </label>
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
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Email
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Phone
              </label>
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
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Password
                </label>
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
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Date of Birth
                </label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    required
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Address
              </label>
              <div className="relative">
                <FiHome className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  name="address"
                  placeholder="123 Main St, City"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                User Type
              </label>
              <div className="flex gap-3">
                <label className="flex items-center cursor-pointer flex-1">
                  <input
                    type="radio"
                    name="userType"
                    value="Buyer"
                    checked={formData.userType === "Buyer"}
                    onChange={handleChange}
                    required
                    className="mr-2"
                  />
                  <div className={`flex-1 p-3 border rounded-lg transition-all duration-300 ${
                    formData.userType === "Buyer" 
                      ? "border-green-500 bg-green-50" 
                      : "border-gray-300"
                  }`}>
                    <div className="font-semibold">Buyer</div>
                    <div className="text-xs text-gray-500">I want to hire freelancers</div>
                  </div>
                </label>
                <label className="flex items-center cursor-pointer flex-1">
                  <input
                    type="radio"
                    name="userType"
                    value="Seller"
                    checked={formData.userType === "Seller"}
                    onChange={handleChange}
                    required
                    className="mr-2"
                  />
                  <div className={`flex-1 p-3 border rounded-lg transition-all duration-300 ${
                    formData.userType === "Seller" 
                      ? "border-green-500 bg-green-50" 
                      : "border-gray-300"
                  }`}>
                    <div className="font-semibold">Seller</div>
                    <div className="text-xs text-gray-500">I want to offer services</div>
                  </div>
                </label>
              </div>
            </div>

            <div className="mb-6 flex items-start">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                required
                className="mt-1 mr-2"
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I agree to the <a href="/terms" className="text-green-600 hover:underline">Terms of Service</a> and <a href="/privacy" className="text-green-600 hover:underline">Privacy Policy</a>, including the <a href="/cookies" className="text-green-600 hover:underline">Use of Cookies</a>.
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full ${
                isLoading ? 'bg-green-500' : 'bg-green-600'
              } text-white py-3 rounded-lg hover:bg-green-700 transition duration-300 flex items-center justify-center`}
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>

            <div className="mt-4 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-green-600 font-semibold hover:underline"
              >
                Log In
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegUser;