import { motion } from "framer-motion";

const Loader = ({ size = "default", message = "" }) => {
  const sizeClasses = {
    small: "w-8 h-8",
    default: "w-12 h-12",
    large: "w-16 h-16",
  };

  const dotSize = {
    small: "w-2 h-2",
    default: "w-3 h-3",
    large: "w-4 h-4",
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-[200px] gap-4">
      <div className={`relative ${sizeClasses[size]}`}>
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-orange-200 dark:border-orange-900"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />

        <motion.div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-500 border-r-orange-400"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        <motion.div
          className="absolute inset-2 rounded-full bg-gradient-to-br from-orange-400 to-orange-600"
          animate={{
            scale: [1, 0.8, 1],
            opacity: [0.8, 0.5, 0.8],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={`${dotSize[size]} rounded-full bg-orange-500`}
            animate={{
              y: [0, -8, 0],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {message && (
        <motion.p
          className="text-gray-600 dark:text-gray-400 text-sm font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {message}
        </motion.p>
      )}
    </div>
  );
};

export const PageLoader = ({ message = "Loading..." }) => {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <Loader size="large" message={message} />
    </div>
  );
};

export const InlineLoader = ({ message = "" }) => {
  return (
    <div className="flex justify-center items-center py-8">
      <Loader size="small" message={message} />
    </div>
  );
};

export default Loader;
