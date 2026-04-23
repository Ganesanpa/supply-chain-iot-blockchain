import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { QrReader } from "react-qr-reader";
import verifyAnimation from "../assets/verified.json";
import Lottie from 'react-lottie-player';
function VerifyProduct() {
  const [batchId, setBatchId] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [scanError, setScanError] = useState("");
  const navigate = useNavigate();
 const extractBatchId = (value) => {
    if (!value) return "";

    // If scanned QR contains full verify URL
    const verifyMatch = value.match(/\/verify\/([^/?#]+)/i);
    if (verifyMatch?.[1]) {
      return verifyMatch[1];
    }

    // Otherwise assume the scanned value itself is the batch id
    return value.trim();
  };
  const handleVerify = () => {
    if (!batchId) {
      alert("Enter batch ID");
      return;
    }

    navigate(`/verify/${batchId}`);
  };
const handleScanResult = (result) => {
    if (!result?.text) return;

    const extractedId = extractBatchId(result.text);

    if (!extractedId) {
      setScanError("Unable to extract batch ID from QR");
      return;
    }

    setBatchId(extractedId);
    setShowScanner(false);
    setScanError("");
  };

  return (

    
    <div className="min-h-screen bg-gradient-to-br from-emerald-700 via-green-600 to-lime-500 flex items-center justify-center px-4 py-10">
      
      {/* Back to Home Floating Button */}
<button
  onClick={() => navigate("/")}
  className="fixed top-4 left-4 z-50 bg-green-600 text-white px-4 py-2 rounded-xl shadow-lg hover:bg-green-700 transition flex items-center gap-2 font-semibold"
>
  ⬅️ 
</button>
      <div className="w-full max-w-5xl grid md:grid-cols-2 bg-white rounded-3xl overflow-hidden shadow-2xl">

        {/* LEFT PANEL */}
        <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-green-700 to-emerald-900 text-white p-10 relative overflow-hidden">

          {/* Glow */}
          <div className="absolute w-72 h-72 bg-green-400/20 rounded-full blur-3xl top-10 left-10"></div>
          <div className="absolute w-72 h-72 bg-emerald-300/20 rounded-full blur-3xl bottom-10 right-10"></div>

          {/* Lottie */}
          <div className="w-full max-w-sm z-10">
          <Lottie
  loop
  play
  animationData={verifyAnimation}
  style={{ width: '100%', height: '100%' }}
/>
          </div>

          <h1 className="text-4xl font-bold text-center z-10 mt-4">
            Verify Product
          </h1>

          <p className="mt-3 text-green-100 text-center z-10">
            Check product authenticity and full supply chain journey.
          </p>

       
        </div>

        {/* RIGHT PANEL */}
        <div className="p-8 md:p-10 flex items-center">

          
          <div className="max-w-md mx-auto w-full">

            <h2 className="text-3xl font-bold text-gray-800 text-center">
              Product Verification
            </h2>

            <p className="text-center text-gray-500 mt-2 mb-8">
              Enter batch ID to track the product journey
            </p>

            <div className="space-y-5">

              {/* Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batch ID
                </label>

                <input
                  type="text"
                  placeholder="Enter Batch ID"
                  value={batchId}
                  onChange={(e) => setBatchId(e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none"
                />
              </div>

              {/* Button */}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleVerify}
                  className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition"
                >
                  🔍 Verify Product
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowScanner((prev) => !prev);
                    setScanError("");
                  }}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
                >
                  {showScanner ? "Close Scanner" : "📷 Scan QR"}
                </button>
              </div>

              {showScanner && (
                <div className="bg-gray-50 border rounded-2xl p-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Point your camera at the QR code
                  </p>

                  <div className="overflow-hidden rounded-xl border">
                    <QrReader
                      constraints={{ facingMode: "environment" }}
                      onResult={(result, error) => {
                        if (result) {
                          handleScanResult(result);
                        }

                        if (error && error.name !== "NotFoundException") {
                          setScanError("Camera scanning issue. Try again.");
                        }
                      }}
                      containerStyle={{ width: "100%" }}
                      videoStyle={{
                        width: "100%",
                        borderRadius: "12px",
                      }}
                    />
                  </div>

                  {scanError && (
                    <p className="text-red-600 text-sm mt-3">{scanError}</p>
                  )}
                </div>
              )}

              

              {/* Extra UI */}
              <div className="bg-gray-50 border rounded-xl p-4 text-sm text-gray-600">
                💡 Tip: Scan QR code or paste Batch ID from product packaging
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default VerifyProduct;