"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { getApiUrl, getImageUrl } from "../../config/api";

interface Item {
  id: number;
  property_no: string;
  article_type: string;
  image_url?: string;
  location?: string;
  status?: string;
  system_status?: string;
  has_pending_maintenance?: boolean;
  pending_maintenance_count?: number;
}

export default function InventoryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [articleType, setArticleType] = useState("");
  const [status, setStatus] = useState("");
  const [maintenanceFilter, setMaintenanceFilter] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    // Check for URL parameters to set initial filters
    const maintenanceParam = searchParams.get('maintenance');
    if (maintenanceParam) {
      setMaintenanceFilter(maintenanceParam);
    }

    axios
      .get(getApiUrl("/items"), {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        // Add maintenance status to items
        const itemsWithMaintenance = res.data.map((item: any) => ({
          ...item,
          has_pending_maintenance: item.maintenance_status === 'pending' || item.pending_maintenance_count > 0,
          pending_maintenance_count: item.pending_maintenance_count || 0
        }));
        setItems(itemsWithMaintenance);
      })
      .catch((err) => setError("Error loading items"))
      .finally(() => setLoading(false));
  }, [router, searchParams]);

  // Filter logic
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.property_no.toLowerCase().includes(search.toLowerCase()) ||
      item.article_type.toLowerCase().includes(search.toLowerCase());
    const matchesArticleType = articleType ? item.article_type === articleType : true;
    const itemSystemStatus = item.system_status ? item.system_status : "Unknown";
    const matchesStatus = status ? itemSystemStatus.toLowerCase() === status.toLowerCase() : true;
    
    // Maintenance filter logic
    let matchesMaintenance = true;
    if (maintenanceFilter === "pending") {
      matchesMaintenance = item.has_pending_maintenance === true;
    } else if (maintenanceFilter === "completed") {
      matchesMaintenance = item.has_pending_maintenance === false;
    }
    
    return matchesSearch && matchesArticleType && matchesStatus && matchesMaintenance;
  });

  // Get unique article types and system statuses for dropdowns
  const articleTypes = Array.from(new Set(items.map((item) => item.article_type)));
  const statuses = Array.from(
    new Set(
      items.map((item) => (item.system_status ? item.system_status : "Unknown")).map((s) => s || "Unknown")
    )
  );

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
      <h1 className="text-2xl font-bold mb-4">Inventory</h1>
      
      {/* Filter Status Display */}
      {maintenanceFilter === "pending" && (
        <div style={{
          backgroundColor: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: '0.5rem',
          padding: '0.75rem',
          marginBottom: '1rem',
          color: '#92400e'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>⚠️</span>
            <span style={{ fontWeight: '600' }}>Showing items with pending maintenance</span>
          </div>
          <button 
            onClick={() => setMaintenanceFilter("")}
            style={{
              marginTop: '0.5rem',
              color: '#92400e',
              textDecoration: 'underline',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            Clear filter
          </button>
        </div>
      )}
      
      {/* Search and Filter Controls */}
      <div className="max-w-xl mx-auto flex flex-col gap-2 mb-4">
        <div className="flex flex-col md:flex-row gap-2">
          <input
            type="text"
            placeholder="Search by property no or article type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={articleType}
            onChange={(e) => setArticleType(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            {articleTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col md:flex-row gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All System Statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={maintenanceFilter}
            onChange={(e) => setMaintenanceFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Maintenance Status</option>
            <option value="pending">Pending Maintenance</option>
            <option value="completed">Completed Maintenance</option>
          </select>
        </div>
      </div>
      {loading && <div className="text-center text-blue-600">Loading...</div>}
      {error && <div className="text-center text-red-500">{error}</div>}
      {!loading && !error && (
        <ul className="max-w-xl mx-auto divide-y divide-gray-200 bg-white rounded shadow">
          {filteredItems.length === 0 && (
            <li className="p-6 text-center text-gray-500">No items found.</li>
          )}
          {filteredItems.map((item) => (
            <li key={item.id} className="flex items-center p-4 hover:bg-gray-50 transition">
              <Link href={`/inventory/${item.id}`} className="flex items-center w-full">
                {item.image_url ? (
                  <img
                    src={getImageUrl(item.image_url)}
                    alt={item.property_no}
                    className="w-16 h-16 max-w-[64px] max-h-[64px] object-cover rounded-lg mr-4 border shadow-sm"
                    style={{ width: 64, height: 64 }}
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded-lg mr-4 flex items-center justify-center text-gray-400 border shadow-sm">
                    <span className="text-xl">📷</span>
                  </div>
                )}
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">{item.property_no}</div>
                  <div className="text-gray-500 text-sm">{item.article_type}</div>
                  <div className="text-gray-400 text-xs">System Status: {item.system_status ? item.system_status : "Unknown"}</div>
                  {item.has_pending_maintenance && (
                    <div className="text-red-500 text-xs font-medium mt-1">
                      ⚠️ Pending Maintenance ({item.pending_maintenance_count || 1} task{item.pending_maintenance_count > 1 ? 's' : ''})
                    </div>
                  )}
                </div>
              </Link>
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