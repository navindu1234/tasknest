import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { db, storage } from '../components/firebase'; 
import { collection, addDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

const categories = [
  'House Cleaning',
  'Garage Labor',
  'Electrician',
  'Gardening Services',
  'Pest Control',
  'Moving and Packing Services',
  'Laundry and Ironing Services',
  'House Painting Services',
  'Car Repairs and Maintenance',
  'Cooking Services',
  'Home Renovation Services',
];

const experienceLevels = [
  '<1 year',
  '1-3 years',
  '3-5 years',
  '5+ years',
];

const certificationOptions = ['Yes', 'No'];
const workTypeOptions = ['Individual', 'Team'];

const SellerReg = () => {
  const [name, setName] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [education, setEducation] = useState('');
  const [age, setAge] = useState('');
  const [city, setCity] = useState('');
  const [preferredLocation, setPreferredLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [selectedExperience, setSelectedExperience] = useState(experienceLevels[0]);
  const [hasCertifications, setHasCertifications] = useState(certificationOptions[1]);
  const [workType, setWorkType] = useState(workTypeOptions[0]);
  const [profileImage, setProfileImage] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [certificationImage, setCertificationImage] = useState(null);
  const navigate = useNavigate();

  const handleImageChange = (event, imageType) => {
    const file = event.target.files[0];
    switch(imageType) {
      case 'profile':
        setProfileImage(file);
        break;
      case 'cover':
        setCoverImage(file);
        break;
      case 'certification':
        setCertificationImage(file);
        break;
      default:
        break;
    }
  };

  const uploadImageToStorage = async (image) => {
    if (!image) return '';
    try {
      const storageRef = ref(storage, `images/${image.name}`);
      await uploadBytes(storageRef, image);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error("Image upload error:", error);
      return '';
    }
  };

  const registerSeller = async () => {
    if (!name || !serviceDescription || !phone || !address || 
        !education || !age || !city || !preferredLocation) {
      alert('Please fill in all fields');
      return;
    }

    const uniqueCode = Math.floor(10000 + Math.random() * 90000).toString();
    const profileImageUrl = await uploadImageToStorage(profileImage);
    const coverImageUrl = await uploadImageToStorage(coverImage);
    const certificationImageUrl = hasCertifications === 'Yes' 
      ? await uploadImageToStorage(certificationImage)
      : '';

    try {
      await addDoc(collection(db, "services"), {
        name,
        serviceDescription,
        phone,
        category: selectedCategory,
        uniqueCode,
        address,
        education,
        age,
        city,
        experience: selectedExperience,
        hasCertifications,
        certificationImage: certificationImageUrl,
        workType,
        preferredLocation,
        profileImage: profileImageUrl,
        coverImage: coverImageUrl,
        timestamp: new Date(),
      });

      alert(`Registration successful! Your unique code: ${uniqueCode}`);
      navigate('/seller-login');
    } catch (e) {
      console.error("Firestore error:", e);
      alert(`Error: ${e.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-700">
      <div className="bg-blue-900 text-white p-4 shadow-md">
        <h1 className="text-xl font-bold">Become a Seller</h1>
      </div>

      <div className="p-5">
        <h2 className="text-2xl font-bold text-white mb-5">Seller Registration</h2>

        {/* Image Upload Section */}
        <div className="bg-blue-800 rounded-xl p-4 mb-5 shadow-lg">
          <h3 className="text-lg font-medium text-white mb-3">Upload Your Photos</h3>
          <div className="flex justify-around">
            <div className="flex flex-col items-center">
              <button 
                onClick={() => document.getElementById('profileInput').click()}
                className="bg-blue-700 text-white px-4 py-2 rounded-lg mb-2"
              >
                Profile Photo
              </button>
              <input 
                id="profileInput"
                type="file" 
                onChange={(e) => handleImageChange(e, 'profile')} 
                className="hidden" 
              />
              {profileImage && (
                <img 
                  src={URL.createObjectURL(profileImage)} 
                  alt="Profile" 
                  className="h-20 w-20 rounded-lg border-2 border-blue-300" 
                />
              )}
            </div>
            <div className="flex flex-col items-center">
              <button 
                onClick={() => document.getElementById('coverInput').click()}
                className="bg-blue-700 text-white px-4 py-2 rounded-lg mb-2"
              >
                Cover Photo
              </button>
              <input 
                id="coverInput"
                type="file" 
                onChange={(e) => handleImageChange(e, 'cover')} 
                className="hidden" 
              />
              {coverImage && (
                <img 
                  src={URL.createObjectURL(coverImage)} 
                  alt="Cover" 
                  className="h-20 w-20 rounded-lg border-2 border-blue-300" 
                />
              )}
            </div>
          </div>
        </div>

        {/* Personal Information Section */}
        <div className="bg-blue-800 rounded-xl p-4 mb-5 shadow-lg">
          <h3 className="text-lg font-medium text-white mb-3">Personal Information</h3>
          {[
            { value: name, setter: setName, placeholder: "Full Name", icon: "👤" },
            { value: serviceDescription, setter: setServiceDescription, placeholder: "Service Description", icon: "📝" },
            { value: phone, setter: setPhone, placeholder: "Telephone Number", icon: "📱", type: "tel" },
            { value: address, setter: setAddress, placeholder: "Address", icon: "📍" },
            { value: education, setter: setEducation, placeholder: "Education", icon: "🎓" },
            { value: age, setter: setAge, placeholder: "Age", icon: "🎂" },
            { value: city, setter: setCity, placeholder: "City", icon: "🏙️" }
          ].map((input, index) => (
            <div key={index} className="mb-3">
              <div className="flex items-center bg-blue-700 rounded-lg p-2">
                <span className="mr-2">{input.icon}</span>
                <input
                  type={input.type || "text"}
                  value={input.value}
                  onChange={(e) => input.setter(e.target.value)}
                  placeholder={input.placeholder}
                  className="w-full bg-transparent text-white placeholder-blue-200 outline-none"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Service Category Section */}
        <div className="bg-blue-800 rounded-xl p-4 mb-5 shadow-lg">
          <h3 className="text-lg font-medium text-white mb-3">Service Category</h3>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-blue-700 text-white p-3 rounded-lg border border-blue-300"
          >
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Experience Section */}
        <div className="bg-blue-800 rounded-xl p-4 mb-5 shadow-lg">
          <h3 className="text-lg font-medium text-white mb-3">Years of Experience</h3>
          <select 
            value={selectedExperience} 
            onChange={(e) => setSelectedExperience(e.target.value)}
            className="w-full bg-blue-700 text-white p-3 rounded-lg border border-blue-300"
          >
            {experienceLevels.map((level) => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>

        {/* Certifications Section */}
        <div className="bg-blue-800 rounded-xl p-4 mb-5 shadow-lg">
          <h3 className="text-lg font-medium text-white mb-3">Professional Certifications</h3>
          <select 
            value={hasCertifications} 
            onChange={(e) => setHasCertifications(e.target.value)}
            className="w-full bg-blue-700 text-white p-3 rounded-lg border border-blue-300 mb-3"
          >
            {certificationOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          {hasCertifications === 'Yes' && (
            <div className="mt-3">
              <button 
                onClick={() => document.getElementById('certificationInput').click()}
                className="bg-blue-700 text-white px-4 py-2 rounded-lg mb-2"
              >
                Upload Certification
              </button>
              <input 
                id="certificationInput"
                type="file" 
                onChange={(e) => handleImageChange(e, 'certification')} 
                className="hidden" 
              />
              {certificationImage && (
                <img 
                  src={URL.createObjectURL(certificationImage)} 
                  alt="Certification" 
                  className="h-20 w-20 rounded-lg border-2 border-blue-300" 
                />
              )}
            </div>
          )}
        </div>

        {/* Work Type Section */}
        <div className="bg-blue-800 rounded-xl p-4 mb-5 shadow-lg">
          <h3 className="text-lg font-medium text-white mb-3">Work Type</h3>
          <select 
            value={workType} 
            onChange={(e) => setWorkType(e.target.value)}
            className="w-full bg-blue-700 text-white p-3 rounded-lg border border-blue-300"
          >
            {workTypeOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* Preferred Location Section */}
        <div className="bg-blue-800 rounded-xl p-4 mb-5 shadow-lg">
          <h3 className="text-lg font-medium text-white mb-3">Preferred Working Locations</h3>
          <div className="flex items-center bg-blue-700 rounded-lg p-2">
            <span className="mr-2">🌍</span>
            <input
              type="text"
              value={preferredLocation}
              onChange={(e) => setPreferredLocation(e.target.value)}
              placeholder="City/Area"
              className="w-full bg-transparent text-white placeholder-blue-200 outline-none"
            />
          </div>
        </div>

        {/* Register Button */}
        <button 
          onClick={registerSeller}
          className="w-full bg-white text-blue-900 font-bold py-3 px-6 rounded-xl shadow-lg hover:bg-gray-100 transition-colors"
        >
          REGISTER AS SELLER
        </button>
      </div>
    </div>
  );
};

export default SellerReg;