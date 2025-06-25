"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { getApiUrl, getImageUrl } from "../../config/api";
import './inventory.css';

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
    <div className="main-container">
      <div className="inventory-header-row">
        <h1 className="inventory-title">Inventory</h1>
      </div>
      {/* Search Bar */}
      <div className="searchbar-row">
        <div className="searchbar-pill">
          <div className="searchbar-icon-bg">
            🔍
          </div>
          <input
            type="text"
            placeholder="Search by property no or article type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="searchbar-input"
          />
        </div>
      </div>
      {/* Filter Bar */}
      <div className="filterbar-row">
        <select
          value={articleType}
          onChange={(e) => setArticleType(e.target.value)}
          className="filterbar-select"
        >
          <option value="">All Types</option>
          {articleTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="filterbar-select"
        >
          <option value="">All System Statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={maintenanceFilter}
          onChange={(e) => setMaintenanceFilter(e.target.value)}
          className="filterbar-select"
        >
          <option value="">All Maintenance Status</option>
          <option value="pending">Pending Maintenance</option>
          <option value="completed">Completed Maintenance</option>
        </select>
      </div>
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
      {loading && <div className="text-center text-blue-600">Loading...</div>}
      {error && <div className="text-center text-red-500">{error}</div>}
      {!loading && !error && (
        <div>
          {filteredItems.length === 0 && (
            <div className="text-center text-gray-500 p-6">No items found.</div>
          )}
          {filteredItems.map((item) => (
            <div key={item.id} className="inventory-card">
              <Link href={`/inventory/${item.id}`} className="flex items-center w-full">
                {item.image_url ? (
                  <img
                    src={getImageUrl(item.image_url)}
                    alt={item.property_no}
                    className="inventory-icon"
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div className="inventory-icon">
                    📷
                  </div>
                )}
                <div className="inventory-info">
                  <div className="inventory-propno">{item.property_no}</div>
                  <div className="inventory-type">{item.article_type}</div>
                  <div className="inventory-status">System Status: {item.system_status ? item.system_status : "Unknown"}</div>
                  {item.has_pending_maintenance && (
                    <div className="text-red-500 text-xs font-medium mt-1">
                      ⚠️ Pending Maintenance ({item.pending_maintenance_count || 1} task{item.pending_maintenance_count > 1 ? 's' : ''})
                    </div>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 