"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { apiClient, getImageUrl } from "../../config/api";
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
  qr_code?: string;
}

function InventoryPageContent() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [articleType, setArticleType] = useState("");
  const [status, setStatus] = useState("");
  const [maintenanceFilter, setMaintenanceFilter] = useState("");
  const [mounted, setMounted] = useState(false);
  const [itemImageUrls, setItemImageUrls] = useState<{[key: string]: string}>({});
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
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

    apiClient
      .get("/items")
      .then((res) => {
        // Add maintenance status to items
        const itemsWithMaintenance = res.data.map((item: any) => ({
          ...item,
          has_pending_maintenance: item.maintenance_status === 'pending' || item.pending_maintenance_count > 0,
          pending_maintenance_count: item.pending_maintenance_count || 0
        }));
        setItems(itemsWithMaintenance);
        // Load image URLs for items
        loadItemImageUrls(itemsWithMaintenance);
      })
      .catch((err) => setError("Error loading items"))
      .finally(() => setLoading(false));
  }, [router, searchParams, mounted]);

  // Filter logic
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.property_no.toLowerCase().includes(search.toLowerCase()) ||
      (item.qr_code && item.qr_code.toLowerCase().includes(search.toLowerCase())) ||
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

  // Load image URLs for items
  const loadItemImageUrls = async (items: Item[]) => {
    const imageUrls: {[key: string]: string} = {};
    for (const item of items) {
      if (item.image_url) {
        try {
          const url = await getImageUrl(item.image_url);
          imageUrls[item.id] = url;
        } catch (err) {
          console.error('Error loading image URL for item:', item.id, err);
        }
      }
    }
    setItemImageUrls(imageUrls);
  };

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
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>Inventory</h1>
        <p style={{ margin: '8px 0 0 0', opacity: 0.9, textAlign: 'center' }}>
          View and manage inventory items here
        </p>
      </div>
      <div className="body-container">
        {/* Search Bar */}
        <div
          className="inventory-search-container"
          style={{
            background: '#fff',
            border: '1.5px solid #d1d5db',
            borderRadius: '12px',
            marginBottom: '18px',
            marginTop: '15px',
            padding: '0 10px',
            boxSizing: 'border-box',
            height: '48px',
            boxShadow: 'none',
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            width: '100%'
          }}
        >
          <div className="search-icon">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <input
            type="text"
            className="search-input"
            placeholder="Search with article id, QR code, or type"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
        {!mounted && <div className="text-center text-blue-600">Loading...</div>}
        {mounted && loading && <div className="text-center text-blue-600">Loading...</div>}
        {mounted && error && <div className="text-center text-red-500">{error}</div>}
        {mounted && !loading && !error && (
          <div>
            {filteredItems.length === 0 && (
              <div className="text-center text-gray-500 p-6">No items found.</div>
            )}
            {filteredItems.map((item) => (
              <div key={item.id} className="inventory-card">
                <Link href={`/inventory/${item.id}`} className="flex items-center w-full">
                  {/* Remove image display */}
                  {/* {itemImageUrls[item.id] ? (
                    <img
                      src={itemImageUrls[item.id]}
                      alt={item.qr_code || item.property_no}
                      className="inventory-icon"
                      style={{ objectFit: 'cover' }}
                    />
                  ) : ( */}
                    <div className="inventory-icon">
                      {item.article_type.toLowerCase().includes('desktop') && (
                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                          <line x1="8" y1="21" x2="16" y2="21"/>
                          <line x1="12" y1="17" x2="12" y2="21"/>
                        </svg>
                      )}
                      {item.article_type.toLowerCase().includes('laptop') && (
                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                          <line x1="2" y1="10" x2="22" y2="10"/>
                        </svg>
                      )}
                      {item.article_type.toLowerCase().includes('printer') && (
                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <polyline points="6,9 6,2 18,2 18,9"/>
                          <path d="M6,18H4a2,2 0 0,1 -2,-2v-5a2,2 0 0,1 2,-2h16a2,2 0 0,1 2,2v5a2,2 0 0,1 -2,2h-2"/>
                          <rect x="6" y="14" width="12" height="8"/>
                        </svg>
                      )}
                      {item.article_type.toLowerCase().includes('monitor') && (
                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                          <line x1="8" y1="21" x2="16" y2="21"/>
                          <line x1="12" y1="17" x2="12" y2="21"/>
                        </svg>
                      )}
                      {item.article_type.toLowerCase().includes('scanner') && (
                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                          <line x1="8" y1="21" x2="16" y2="21"/>
                          <line x1="12" y1="17" x2="12" y2="21"/>
                          <line x1="6" y1="8" x2="18" y2="8"/>
                          <line x1="6" y1="12" x2="18" y2="12"/>
                        </svg>
                      )}
                      {item.article_type.toLowerCase().includes('server') && (
                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/>
                          <rect x="2" y="14" width="20" height="8" rx="2" ry="2"/>
                          <line x1="6" y1="6" x2="6" y2="6"/>
                          <line x1="6" y1="18" x2="6" y2="18"/>
                        </svg>
                      )}
                      {item.article_type.toLowerCase().includes('network') && (
                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="3"/>
                          <path d="M12 1v6m0 6v6"/>
                          <path d="M21 12h-6m-6 0H3"/>
                          <path d="M19.78 4.22l-4.24 4.24m-6.36 6.36l-4.24 4.24"/>
                          <path d="M4.22 4.22l4.24 4.24m6.36 6.36l4.24 4.24"/>
                        </svg>
                      )}
                      {!item.article_type.toLowerCase().includes('desktop') && 
                      !item.article_type.toLowerCase().includes('laptop') && 
                      !item.article_type.toLowerCase().includes('printer') && 
                      !item.article_type.toLowerCase().includes('monitor') && 
                      !item.article_type.toLowerCase().includes('scanner') && 
                      !item.article_type.toLowerCase().includes('server') && 
                      !item.article_type.toLowerCase().includes('network') && (
                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21,15 16,10 5,21"/>
                        </svg>
                      )}
                    </div>
                  {/* )} */}
                  <div className="inventory-info">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                      <div className="inventory-propno">
                        {item.qr_code ? (
                          <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1f2937' }}>
                            {item.qr_code}
                          </span>
                        ) : (
                          <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1f2937' }}>
                            {item.property_no}
                          </span>
                        )}
                      </div>
                      <div className="inventory-borrowing-status" style={{ marginTop: 0, fontSize: '0.97em' }}>
                        <span style={{ fontWeight: 500, color: '#117636' }}>Available</span>
                      </div>
                    </div>
                    <div className="inventory-type">{item.article_type}</div>
                    <div className={`inventory-status ${
                      item.system_status?.toLowerCase() === 'poor' ? 'status-poor' :
                      item.system_status?.toLowerCase() === 'fair' ? 'status-fair' :
                      item.system_status?.toLowerCase() === 'good' ? 'status-good' : ''
                    }`}>
                      System Status: {item.system_status ? item.system_status : "Unknown"}
                    </div>
                    {item.has_pending_maintenance && (
                      <div className="text-yellow-500 text-xs font-medium mt-1">
                        {(() => {
                          const count = item.pending_maintenance_count ?? 1;
                          return (
                            <>⚠️ <span style={{ color: '#92400e' }}>Pending Maintenance ({count} task{count > 1 ? 's' : ''})</span></>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function InventoryPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InventoryPageContent />
    </Suspense>
  );
} 