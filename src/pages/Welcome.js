import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// Updated image paths using process.env.PUBLIC_URL for public folder compatibility
const categoryImages = [
  `${process.env.PUBLIC_URL}/image1.png`,
  `${process.env.PUBLIC_URL}/image2.png`,
  `${process.env.PUBLIC_URL}/image3.png`,
  `${process.env.PUBLIC_URL}/image4.png`,
  `${process.env.PUBLIC_URL}/image5.png`,
  `${process.env.PUBLIC_URL}/image6.png`,
  `${process.env.PUBLIC_URL}/image7.png`,
  `${process.env.PUBLIC_URL}/image8.png`,
  `${process.env.PUBLIC_URL}/image9.png`,
  `${process.env.PUBLIC_URL}/image10.png`,
];

function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center bg-gradient-to-r from-green-500 to-green-700">
      {/* Background TASKNEST Text */}
      <h1 className="absolute text-[200px] font-extrabold text-green-300 opacity-20 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 select-none">
        TASKNEST
      </h1>

      {/* Animated Background Images */}
      <div className="absolute inset-0 grid grid-cols-5 grid-rows-2 gap-4 p-10 opacity-40">
        {categoryImages.map((src, index) => (
          <motion.div
            key={index}
            className="w-48 h-48 bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-green-300 flex items-center justify-center"
            animate={{ y: [0, -20, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatType: "reverse",
              delay: index * 0.2,
            }}
          >
            <img src={src} alt={`Category ${index + 1}`} className="w-full h-full object-cover" />
          </motion.div>
        ))}
      </div>

      {/* Main Welcome Content */}
      <div className="text-center bg-white p-10 rounded-2xl shadow-2xl max-w-sm relative z-10 bg-opacity-95 border-4 border-green-400">
        <h1 className="text-4xl font-bold text-green-900">TASKENST</h1>
        <p className="text-green-800 mt-3">Experience the best services with us.</p>

        <div className="mt-6 space-y-4">
          <button
            onClick={() => navigate("/login")}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-xl shadow-md hover:bg-green-700 transition-all duration-300"
          >
            Go to Login
          </button>

          <button
            onClick={() => navigate("/register")}
            className="w-full px-6 py-3 bg-green-800 text-white rounded-xl shadow-md hover:bg-green-900 transition-all duration-300"
          >
            Create New Account
          </button>
        </div>
      </div>
    </div>
  );
}

export default Welcome;
