import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* HERO SECTION */}
      <section className="bg-gradient-to-br from-green-700 via-emerald-700 to-green-900 text-white py-24 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
          
          {/* LEFT */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              Smart Farm Supply Chain Tracking with IoT & Blockchain
            </h1>

            <p className="text-lg opacity-90 mb-8">
              Track, verify, and monitor farm products in real-time with secure,
              tamper-proof blockchain technology.
            </p>

            <div className="flex gap-4 justify-center md:justify-start flex-wrap">
              <button
                onClick={() => navigate("/login")}
                className="bg-white text-green-700 px-8 py-3 rounded-xl font-semibold shadow hover:scale-105 transition"
              >
                Get Started
              </button>

              <button
                onClick={() => navigate("/verify")}
                className="border border-white px-8 py-3 rounded-xl hover:bg-white hover:text-green-700 transition"
              >
                Verify Product
              </button>
            </div>
          </div>

          {/* RIGHT IMAGE */}
          <div className="flex-1">
            <img
              src="https://illustrations.popsy.co/green/digital-nomad.svg"
              alt="Supply Chain"
              className="w-full max-w-md mx-auto"
            />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 bg-white text-center">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <Stat number="100+" label="Batches Tracked" />
          <Stat number="50+" label="Farmers Connected" />
          <Stat number="24/7" label="Monitoring" />
          <Stat number="100%" label="Transparency" />
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-6 bg-gray-100 text-center">
        <h2 className="text-3xl font-bold mb-12 text-gray-800">
          Key Features
        </h2>

        <div className="flex flex-wrap justify-center gap-8">
          <FeatureCard
            icon="📍"
            title="Live Tracking"
            description="Real-time batch tracking across the supply chain."
          />

          <FeatureCard
            icon="🌡️"
            title="Condition Monitoring"
            description="Monitor temperature and humidity of farm products."
          />

          <FeatureCard
            icon="🔐"
            title="Blockchain Security"
            description="Tamper-proof and trusted data storage."
          />

          <FeatureCard
            icon="🚨"
            title="Smart Alerts"
            description="Instant alerts on abnormal storage conditions."
          />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-6 bg-white text-center">
        <h2 className="text-3xl font-bold mb-12 text-gray-800">
          How It Works
        </h2>

        <div className="flex flex-wrap justify-center gap-8">
          <HowCard
            step="1"
            title="Farmer Creates Batch"
            description="Farmers create product batches and send to distributor."
          />

          <HowCard
            step="2"
            title="Distributor Transport"
            description="Products are transported with IoT monitoring."
          />

          <HowCard
            step="3"
            title="Warehouse Storage"
            description="Warehouse monitors storage conditions."
          />

          <HowCard
            step="4"
            title="Retailer Delivery"
            description="Retailer verifies and delivers to customers."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-green-700 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">
          Ready to Track Your Supply Chain?
        </h2>

        <p className="mb-8 opacity-90">
          Join the future of smart agriculture and blockchain tracking.
        </p>

        <button
          onClick={() => navigate("/register")}
          className="bg-white text-green-700 px-8 py-3 rounded-xl font-semibold hover:scale-105 transition"
        >
          Get Started Now
        </button>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white text-center py-6">
        <p>Final Year Project | Farm Supply Chain Tracking System</p>
      </footer>
    </div>
  );
}

/* COMPONENTS */

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-md w-64 
    hover:shadow-2xl hover:-translate-y-2 transition duration-300 border border-gray-200">
      
      <div className="text-4xl mb-4">{icon}</div>

      <h3 className="font-semibold text-lg mb-2 text-gray-800">
        {title}
      </h3>

      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}

function HowCard({ step, title, description }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-md w-64 
    hover:shadow-xl transition hover:-translate-y-1 border border-gray-200">
      
      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white flex items-center justify-center font-bold text-lg">
        {step}
      </div>

      <h3 className="font-semibold text-lg mb-2 text-gray-800">
        {title}
      </h3>

      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}

function Stat({ number, label }) {
  return (
    <div>
      <h2 className="text-3xl font-bold text-green-600">{number}</h2>
      <p className="text-gray-600">{label}</p>
    </div>
  );
}

export default Landing;