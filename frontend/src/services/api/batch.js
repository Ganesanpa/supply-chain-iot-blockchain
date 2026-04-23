// src/services/api/batch.js
const API_BASE = "http://localhost:5000/api";
const getToken = () => localStorage.getItem("token");

// GET ALL BATCHES
export const getBatches = async () => {
  const res = await fetch(`${API_BASE}/batches`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.json();
};

// CREATE BATCH
export const createBatch = async (data) => {
  const res = await fetch(`${API_BASE}/batches/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const getBatchById = async (id) => {
  const res = await fetch(`${API_BASE}/batches/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.json();
};

// UPDATE BATCH STAGE
export const updateBatchStage = async (id, stage, lat = null, lng = null) => {
  const res = await fetch(`${API_BASE}/batches/${id}/stage`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ stage, lat, lng }),
  });
  return res.json();
};

// UPDATE LOCATION
export const updateLocation = async (id, location) => {
  const res = await fetch(`${API_BASE}/batches/${id}/location`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(location),
  });
  return res.json();
};

// -------------------- NEW FUNCTIONS FOR ACTIVE BATCH --------------------

// GET CURRENT ACTIVE BATCH
export const getActiveBatch = async () => {
  const res = await fetch(`${API_BASE}/batches/active/current`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.json();
};

// ACTIVATE A BATCH FOR TRACKING
export const activateBatchTracking = async (id) => {
  const res = await fetch(`${API_BASE}/batches/${id}/activate`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return res.json();
};

// DEACTIVATE A BATCH
export const deactivateBatchTracking = async (id) => {
  const res = await fetch(`${API_BASE}/batches/${id}/deactivate`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return res.json();
};

export const getActiveBatchSensorData = async () => {
  try {
    const response = await fetch("http://localhost:5000/api/batches/active/current");
    if (!response.ok) return null;

    const batch = await response.json();

    return {
      time: new Date().toLocaleTimeString(),
      temperature: batch.temperature || 0,
      humidity: batch.humidity || 0,
    };
  } catch (err) {
    console.error("Failed to fetch sensor data", err);
    return null;
  }
};
