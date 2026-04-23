export const getBatchById = async (id) => {
  const res = await fetch(`http://localhost:5000/api/batches/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  });




  return res.json();
};



export const getAlerts = async (batchId) => {
  const res = await fetch(`http://localhost:5000/api/alerts/${batchId}`);
  return res.json();
};



export const getActiveBatch = async () => {
  const res = await fetch(`http://localhost:5000/api/batches/active/current`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  });

  return res.json();
};



export const activateBatchTracking = async (id) => {
  const res = await fetch(`http://localhost:5000/api/batches/${id}/activate`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  });

  return res.json();
};




export const deactivateBatchTracking = async (id) => {
  const res = await fetch(`http://localhost:5000/api/batches/${id}/deactivate`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  });

  return res.json();
};