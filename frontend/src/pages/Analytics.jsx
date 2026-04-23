import { useEffect, useState, useMemo } from "react";
import { getBatches} from "../services/api/batch";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import StatCard from "../components/StatCard";

function Analytics() {
  const [batches, setBatches] = useState([]);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    const data = await getBatches();
    setBatches(data);
  };

  const stats = useMemo(() => {
    const data = {
      total: batches.length,
      delivered: 0,
      active: 0,
      spoiled: 0,
      stages: {
        Farmer: 0,
        Distributor: 0,
        Warehouse: 0,
        Retailer: 0,
        Delivered: 0
      }
    };

    batches.forEach(b => {
      if (b.stage === "Delivered") data.delivered++;
      else data.active++;

      if (b.freshness === "Spoiled") data.spoiled++;

      if (data.stages[b.stage] !== undefined) {
        data.stages[b.stage]++;
      }
    });

    return data;
  }, [batches]);

  const stageData = Object.entries(stats.stages).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ["#16a34a", "#2563eb", "#f59e0b", "#8b5cf6", "#10b981"];

  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-bold">
        Supply Chain Analytics
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard title="Total Batches" value={stats.total} />
        <StatCard title="Delivered" value={stats.delivered} />
        <StatCard title="Active" value={stats.active} />
        <StatCard title="Spoiled" value={stats.spoiled} />
      </div>

      {/* Bar Chart */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-6">
          Batch Stage Distribution
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stageData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-6">
          Delivery Status
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={stageData} dataKey="value" outerRadius={120} label>
              {stageData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default Analytics;