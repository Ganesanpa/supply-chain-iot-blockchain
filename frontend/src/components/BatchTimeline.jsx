import { motion } from "framer-motion";

function BatchTimeline({ history = [] }) {
  const stages = ["farmer", "distributor", "warehouse", "retailer", "delivered"];

  const normalizedHistory = history.map((item) => String(item).toLowerCase());

  const currentStage =
    normalizedHistory.length > 0
      ? normalizedHistory[normalizedHistory.length - 1]
      : "farmer";

  const currentIndex = stages.indexOf(currentStage);

  const progress =
    currentIndex >= 0 ? ((currentIndex + 1) / stages.length) * 100 : 0;

  const formatLabel = (value) => {
    if (!value) return "-";
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  return (
    <div className="w-full mt-6">
      {/* Top Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-medium text-gray-700">
            Supply Chain Progress
          </p>
          <p className="text-sm text-gray-500">
            {Math.round(progress)}% Completed
          </p>
        </div>

        <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6 }}
            className="bg-green-500 h-3 rounded-full"
          />
        </div>
      </div>

      {/* Stage Nodes */}
      <div className="relative flex items-start justify-between">
        {/* Background connector line */}
        <div className="absolute top-4 left-0 right-0 h-1 bg-gray-300 -z-10" />

        {/* Active connector line */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6 }}
          className="absolute top-4 left-0 h-1 bg-green-500 -z-10"
        />

        {stages.map((stage, index) => {
          const isCompleted = normalizedHistory.includes(stage);
          const isCurrent = index === currentIndex;

          return (
            <div
              key={stage}
              className="flex-1 flex flex-col items-center text-center"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0.7 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.08 }}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 ${
                  isCompleted
                    ? "bg-green-500 border-green-500"
                    : "bg-gray-400 border-gray-400"
                } ${isCurrent ? "ring-4 ring-green-100" : ""}`}
              >
                {index + 1}
              </motion.div>

              <span
                className={`mt-2 text-xs sm:text-sm ${
                  isCompleted ? "text-green-700 font-semibold" : "text-gray-500"
                }`}
              >
                {formatLabel(stage)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BatchTimeline;