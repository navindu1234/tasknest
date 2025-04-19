import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { db, storage } from '../components/firebase'; 
import { collection, addDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

const categories = [
  'House Cleaning', 'Garage Labor', 'Electrician', 'Gardening Services',
  'Pest Control', 'Moving and Packing Services', 'Laundry and Ironing Services',
  'House Painting Services', 'Car Repairs and Maintenance', 'Cooking Services',
  'Home Renovation Services',
];

const SellerReg = () => {
  const [name, setName] = useState('');
  const [service, setService] = useState('');
  const [address, setAddress] = useState('');
  const [education, setEducation] = useState('');
  const [age, setAge] = useState('');
  const [city, setCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [profileImage, setProfileImage] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const navigate = useNavigate();

  const handleImageChange = (event, isProfile) => {
    const file = event.target.files[0];
    if (isProfile) {
      setProfileImage(file);
    } else {
      setCoverImage(file);
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
    if (!name || !service || !address || !education || !age || !city) {
      alert('Please fill in all fields');
      return;
    }

    const uniqueCode = Math.floor(10000 + Math.random() * 90000).toString();
    const profileImageUrl = await uploadImageToStorage(profileImage);
    const coverImageUrl = await uploadImageToStorage(coverImage);

    try {
      await addDoc(collection(db, "services"), {
        name,
        service,
        category: selectedCategory,
        uniqueCode,
        address,
        education,
        age,
        city,
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
    <div className="bg-gradient-to-b from-green-500 to-green-800 min-h-screen flex justify-center items-center text-white p-6">
      <div className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-lg text-center text-gray-800">
        <h2 className="text-3xl font-bold text-green-600 mb-6">Become a Seller</h2>

        <div className="flex justify-between mb-6">
          <div className="flex flex-col items-center">
            <input type="file" onChange={(e) => handleImageChange(e, true)} className="mb-2" />
            {profileImage && <img src={URL.createObjectURL(profileImage)} alt="Profile" className="h-24 w-24 rounded-full border-4 border-green-500 shadow-md" />}
          </div>
          <div className="flex flex-col items-center">
            <input type="file" onChange={(e) => handleImageChange(e, false)} className="mb-2" />
            {coverImage && <img src={URL.createObjectURL(coverImage)} alt="Cover" className="h-24 w-24 rounded-lg border-4 border-green-500 shadow-md" />}
          </div>
        </div>

        {[{ value: name, setter: setName, placeholder: "Name" },
          { value: service, setter: setService, placeholder: "Service" },
          { value: address, setter: setAddress, placeholder: "Address" },
          { value: education, setter: setEducation, placeholder: "Educational Qualifications" },
          { value: age, setter: setAge, placeholder: "Age" },
          { value: city, setter: setCity, placeholder: "City" }]
          .map((input, index) => (
            <input key={index} type="text" value={input.value} onChange={(e) => input.setter(e.target.value)}
              placeholder={input.placeholder} className="w-full p-3 rounded-lg border border-green-300 mb-4 text-lg" />
        ))}

        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full p-3 rounded-lg border border-green-300 mb-6 text-lg">
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        <button onClick={registerSeller} 
          className="bg-green-600 text-white py-3 rounded-lg w-full shadow-md text-lg hover:bg-green-700 transition">
          Register as Seller
        </button>
      </div>
    </div>
  );
};

export default SellerReg;