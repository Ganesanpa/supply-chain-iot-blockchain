import { FaExclamationTriangle } from "react-icons/fa";

function AlertCard({ type, message, onResolve }) {
  return (
    <div className="mb-4 p-4 rounded-xl bg-red-100 border-l-4 border-red-600 shadow-md animate-pulse">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <FaExclamationTriangle className="text-red-600 text-xl" />
          <div>
            <h3 className="font-bold text-red-700">
              {type} Alert!
            </h3>
            <p className="text-sm text-red-600">
              {message}
            </p>
          </div>
        </div>

        <button
          onClick={onResolve}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
        >
          Resolve
        </button>
      </div>
    </div>
  );
}

export default AlertCard;
