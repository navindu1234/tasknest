import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

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
    <div className="relative w-full min-h-screen overflow-y-auto bg-gradient-to-br from-green-500 via-green-600 to-green-700">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-20 min-h-screen flex flex-col items-center justify-center">
        {/* Background TASKNEST Text */}
        <h1 className="fixed text-[200px] font-extrabold text-green-300 opacity-20 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none">
          TASKNEST
        </h1>

        {/* Animated Background Images */}
        <div className="fixed inset-0 grid grid-cols-5 grid-rows-2 gap-4 p-10 opacity-20 pointer-events-none">
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
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center bg-white p-10 rounded-2xl shadow-2xl max-w-md relative z-10 bg-opacity-95 border-4 border-green-400 mb-20"
        >
          <h1 className="text-5xl font-bold text-green-900 mb-2">TASKNEST</h1>
          
          {/* Highlighted Tagline */}
          <motion.div 
            className="mb-6"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-lg font-semibold bg-gradient-to-r from-green-600 to-green-800 text-transparent bg-clip-text">
              Smart Help, Trusted Services
            </p>
            <p className="text-sm font-medium text-green-700 mt-1">
              Powered by AI Recommendations
            </p>
          </motion.div>

          <p className="text-green-800 mb-6">Experience the best services with us.</p>

          <div className="space-y-4">
            <button
              onClick={() => navigate("/login")}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl shadow-md hover:from-green-700 hover:to-green-800 transition-all duration-300 font-medium"
            >
              Go to Login
            </button>

            <button
              onClick={() => navigate("/register")}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-800 to-green-900 text-white rounded-xl shadow-md hover:from-green-900 hover:to-green-950 transition-all duration-300 font-medium"
            >
              Create New Account
            </button>
          </div>
        </motion.div>

        {/* AI-Powered Matching Feature - Highlighted Section */}
        <motion.div 
          className="w-full max-w-4xl mx-auto mb-20 px-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="inline-block"
          >
            <div className="text-6xl mb-4"></div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-green-600 text-transparent bg-clip-text mb-3">
              AI-POWERED MATCHING
            </h2>
            <p className="text-xl text-white max-w-2xl mx-auto">
              Our intelligent algorithm connects you with the perfect service providers tailored to your specific needs.
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="bg-green-900 text-white py-12 w-full">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold mb-2">TASKNEST Innovations</h2>
            <p className="text-green-300 mb-6">Creating smarter solutions for modern living</p>
            
            <div className="flex justify-center space-x-6 mb-6">
              {['🏠', '📱', '📧', '📞'].map((icon, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  className="text-2xl cursor-pointer"
                >
                  {icon}
                </motion.div>
              ))}
            </div>
            
            <p className="text-green-200 text-sm">
              © {new Date().getFullYear()} NestTech Innovations. All rights reserved.
            </p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}

export default Welcome;