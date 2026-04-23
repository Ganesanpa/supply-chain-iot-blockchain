import { motion } from "framer-motion";

function StatCard({ title, value, icon, color, trend }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative
        p-6
        rounded-2xl
        shadow-md
        text-white
        ${color}
        cursor-pointer
        overflow-hidden
      `}
    >
      {/* Soft Glow Background */}
      <div className="absolute inset-0 bg-white opacity-5"></div>

      <div className="relative flex justify-between items-center">
        <div>
          <h4 className="text-xs uppercase tracking-wider opacity-80">
            {title}
          </h4>

          <p className="text-3xl font-bold mt-2">
            {value}
          </p>

          {trend && (
            <p className="text-xs mt-2 opacity-90">
              {trend}
            </p>
          )}
        </div>

        <div className="text-4xl opacity-80">
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

export default StatCard;