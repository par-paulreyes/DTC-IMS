"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getApiUrl } from "../../config/api";

interface Log {
  id: number;
  property_no: string;
  article_type: string;
  maintenance_date: string;
  task_performed: string;
  maintained_by: string;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    axios
      .get(getApiUrl("/logs"), { headers: { Authorization: token } })
      .then((res) => setLogs(res.data))
      .catch((err) => setError("Error loading logs"))
      .finally(() => setLoading(false));
  }, [router]);

  const handleExport = (format: string) => {
    const token = localStorage.getItem("token");
    window.open(`${getApiUrl("/logs/export")}?format=${format}&token=${token}`, "_blank");
  };

  return (
    <div style={{
      maxWidth: 700,
      margin: '40px auto 0 auto',
      background: '#fff',
      borderRadius: 24,
      boxShadow: '0 4px 32px rgba(0,0,0,0.10)',
      padding: '32px 32px 40px 32px',
      display: 'flex',
      flexDirection: 'column',
      gap: 32,
      minHeight: 'calc(100vh - 120px)'
    }}>
      <h1 className="text-2xl font-bold mb-4">Maintenance Logs</h1>
      <div className="flex justify-center gap-4 mb-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          onClick={() => handleExport("csv")}
        >
          Export CSV
        </button>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          onClick={() => handleExport("pdf")}
        >
          Export PDF
        </button>
      </div>
      {loading && <div className="text-center text-blue-600">Loading...</div>}
      {error && <div className="text-center text-red-500">{error}</div>}
      {!loading && !error && (
        <ul className="max-w-2xl mx-auto divide-y divide-gray-200 bg-white rounded shadow">
          {logs.length === 0 && (
            <li className="p-6 text-center text-gray-500">No logs found.</li>
          )}
          {logs.map((log) => (
            <li key={log.id} className="p-4">
              <div className="font-semibold text-gray-800">
                {log.property_no} ({log.article_type})
              </div>
              <div className="text-gray-500 text-sm">{log.maintenance_date}</div>
              <div className="text-gray-600">Task: {log.task_performed}</div>
              <div className="text-gray-400 text-xs">Maintained By: {log.maintained_by}</div>
            </li>
          ))}
        </ul>
      )}
      <style jsx>{`
        @media (max-width: 700px) {
          div[style] {
            max-width: 98vw !important;
            padding-left: 4vw !important;
            padding-right: 4vw !important;
          }
        }
      `}</style>
    </div>
  );
} 