import { createContext, useContext, useState } from "react";
import { useEffect } from "react";
import axios from "axios";
const BatchContext = createContext();

export function BatchProvider({ children }) {
  const [batches, setBatches] = useState([]);

  // ----------------------------
  // Stage Locations (for map tracking)
  // ----------------------------
  const stageLocations = {
    Farmer: { lat: 11.1271, lng: 78.6569 },        // Tamil Nadu farm
    Distributor: { lat: 12.9716, lng: 77.5946 },   // Bangalore route
    Warehouse: { lat: 13.0827, lng: 80.2707 },     // Chennai warehouse
    Retailer: { lat: 13.0674, lng: 80.2376 }       // Retail shop
  };
useEffect(() => {
  const fetchBatches = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/batches", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      setBatches(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  fetchBatches();
}, []);
  // ----------------------------
  // Create Batch (Farmer Stage)
  // ----------------------------
  const createBatch = (batch) => {
    const newBatch = {
      ...batch,
      stage: "Distributor", // Automatically move to Distributor after creation
      freshness: "Fresh",
      history: ["Farmer","Distributor"],
      timestamps: {
        Farmer: new Date().toLocaleString(),
      },
      location: stageLocations["Distributor"] // Initial location at Distributor
    };

    setBatches((prev) => [...prev, newBatch]);
  };

  // ----------------------------
  // Freshness Calculation Logic
  // ----------------------------
  const calculateFreshness = (historyLength) => {
    const score = 100 - historyLength * 10;
    if (score >= 70) return "Fresh";
    if (score >= 40) return "Moderate";
    return "Spoiled";
  };

  // ----------------------------
  // Blockchain Signature Functions
  // ----------------------------
  const generateSignature = (batch) => {
    const dataString =
      batch._id +
      batch.product +
      batch.stage +
      JSON.stringify(batch.history) +
      JSON.stringify(batch.timestamps);

    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
      hash = dataString.charCodeAt(i) + ((hash << 5) - hash);
    }

    return "SIG-" + Math.abs(hash).toString(16);
  };

  const verifySignature = (batch) => {
    const recalculated = generateSignature(batch);
    return recalculated === batch.blockchain?.digitalSignature;
  };

  // ----------------------------
  // Update Stage
  // ----------------------------
  const updateBatchStage = (id, newStage) => {
    setBatches((prev) =>
      prev.map((batch) => {
        if (batch._id !== id) return batch;

        // 🔒 Prevent update if already delivered
        if (batch.stage === "Delivered") return batch;

        const updatedHistory = [...batch.history, newStage];

        const updatedBatch = {
          ...batch,
          stage: newStage,
          history: updatedHistory,
          freshness: calculateFreshness(updatedHistory.length),
          timestamps: {
            ...batch.timestamps,
            [newStage]: new Date().toLocaleString(),
          },
          location: stageLocations[newStage] || batch.location, // Update location per stage
        };

        // 🔗 If Delivered → generate blockchain record
        if (newStage === "Delivered") {
          const signature = generateSignature(updatedBatch);

          updatedBatch.blockchain = {
            txHash: "0x" + Math.random().toString(16).substring(2, 10),
            blockNumber: Math.floor(Math.random() * 100000),
            verified: true,
            digitalSignature: signature,
          };
        }

        return updatedBatch;
      })
    );
  };

  return (
    <BatchContext.Provider
      value={{ batches, createBatch, updateBatchStage, verifySignature }}
    >
      {children}
    </BatchContext.Provider>
  );
}

export function useBatch() {
  return useContext(BatchContext);
}