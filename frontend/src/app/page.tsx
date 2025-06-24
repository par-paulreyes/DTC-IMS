"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import styles from "./page.module.css";
import { getApiUrl } from "../config/api";

export default function DashboardPage() {
  const [totalItems, setTotalItems] = useState(0);
  const [maintenanceItems, setMaintenanceItems] = useState(0);
  const [issueItems, setIssueItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setLoading(true);
    setError("");
    Promise.all([
      axios.get(getApiUrl("/items"), { headers: { Authorization: token } }),
      axios.get(getApiUrl("/items/maintenance/upcoming"), { headers: { Authorization: token } }),
    ])
      .then(([itemsRes, maintRes]) => {
        setTotalItems(itemsRes.data.length);
        setMaintenanceItems(maintRes.data.length);
        // For items with issues, count diagnostics with 'fail' or 'issue' in system_status
        const itemIds = itemsRes.data.map((item: any) => item.id);
        if (itemIds.length === 0) {
          setIssueItems(0);
          setLoading(false);
          return;
        }
        // Fetch diagnostics for all items
        Promise.all(
          itemIds.map((id: number) =>
            axios.get(getApiUrl(`/diagnostics/item/${id}`), { headers: { Authorization: token } })
          )
        )
          .then((diagResArr) => {
            const issues = diagResArr.reduce((acc, res) => {
              return (
                acc +
                res.data.filter((d: any) =>
                  d.system_status &&
                  (d.system_status.toLowerCase().includes("fail") ||
                    d.system_status.toLowerCase().includes("issue") ||
                    d.system_status.toLowerCase().includes("problem"))
                ).length
              );
            }, 0);
            setIssueItems(issues);
          })
          .catch(() => setIssueItems(0))
          .finally(() => setLoading(false));
      })
      .catch((err) => {
        setError("Error loading dashboard stats");
        setLoading(false);
      });
  }, [router]);

  const handleDiagnostic = async (id: string) => {
    const token = localStorage.getItem("token");
    try {
      await axios.get(getApiUrl(`/diagnostics/item/${id}`), { headers: { Authorization: token } });
      // Handle diagnostic response
    } catch (err) {
      console.error("Error running diagnostic:", err);
    }
  };

  return (
    <div className="min-h-screen pt-8 pb-20 bg-gray-50">
      <h1 className="text-2xl font-bold mb-6 text-center">Dashboard</h1>
      {loading && <div className="text-center text-blue-600">Loading...</div>}
      {error && <div className="text-center text-red-500">{error}</div>}
      {!loading && !error && (
        <div className="max-w-xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded shadow p-6 flex flex-col items-center">
            <div className="text-3xl font-bold text-blue-600">{totalItems}</div>
            <div className="text-gray-600 mt-2 text-center">Total Items</div>
          </div>
          <div className="bg-white rounded shadow p-6 flex flex-col items-center">
            <div className="text-3xl font-bold text-yellow-500">{maintenanceItems}</div>
            <div className="text-gray-600 mt-2 text-center">Needing Maintenance</div>
          </div>
          <div className="bg-white rounded shadow p-6 flex flex-col items-center">
            <div className="text-3xl font-bold text-red-500">{issueItems}</div>
            <div className="text-gray-600 mt-2 text-center">Items with Issues</div>
          </div>
        </div>
      )}
    </div>
  );
}
