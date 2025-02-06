
import { motion } from "framer-motion";

const Gallery = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Pet Gallery</h1>
          <p className="text-gray-600 mt-2">Coming soon...</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Gallery;
