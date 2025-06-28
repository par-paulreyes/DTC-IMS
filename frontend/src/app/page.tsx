"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./dashboard.module.css";
import { apiClient, getImageUrl } from "../config/api";

interface Item {
  id: number;
  property_no: string;
  qr_code?: string;
  article_type: string;
  image_url?: string;
  location?: string;
  status?: string;
  system_status?: string;
  has_pending_maintenance?: boolean;
  pending_maintenance_count?: number;
}

export default function DashboardPage() {
  const [totalItems, setTotalItems] = useState(0);
  const [neededMaintenance, setNeededMaintenance] = useState(0);
  const [totalMaintenance, setTotalMaintenance] = useState(0);
  const [recentlyAdded, setRecentlyAdded] = useState(0);
  const [totalArticles, setTotalArticles] = useState(0);
  const [recentItems, setRecentItems] = useState<Item[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

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
    setLoading(true);
    apiClient.get("/users/profile")
      .then(res => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [router, mounted]);

  useEffect(() => {
    if (!mounted) return;
    
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setLoading(true);
    setError("");
    
    Promise.all([
      apiClient.get("/items"),
      apiClient.get("/items/maintenance/needed"),
      apiClient.get("/logs"),
    ])
      .then(([itemsRes, neededMaintenanceRes, maintenanceLogsRes]) => {
        const items = itemsRes.data;
        const neededMaintenance = neededMaintenanceRes.data;
        const maintenanceLogs = maintenanceLogsRes.data;
        
        setTotalItems(items.length);
        setNeededMaintenance(neededMaintenance.length);
        setTotalMaintenance(maintenanceLogs.length);
        
        // Calculate recently added items (items created today)
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today
        const recentItems = items.filter((item: any) => {
          const createdAt = new Date(item.created_at);
          createdAt.setHours(0, 0, 0, 0); // Normalize to start of day
          return createdAt.getTime() === today.getTime();
        });
        setRecentlyAdded(recentItems.length);
        setRecentItems(recentItems);
        
        // Calculate total unique article types
        const uniqueArticleTypes = new Set(items.map((item: any) => item.article_type));
        setTotalArticles(uniqueArticleTypes.size);
        
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading dashboard stats:", err);
        setError("Error loading dashboard stats");
        setLoading(false);
      });
  }, [router, mounted]);

  const handleDiagnostic = async (id: string) => {
    try {
      await apiClient.get(`/diagnostics/item/${id}`);
      // Handle diagnostic response
    } catch (err) {
      console.error("Error running diagnostic:", err);
    }
  };

  const handleCardClick = (cardType: string) => {
    switch (cardType) {
      case 'needed-maintenance':
        router.push('/inventory?maintenance=pending');
        break;
      case 'total-maintenance':
        router.push('/logs');
        break;
      case 'total-articles':
        router.push('/inventory');
        break;
      case 'recently-added':
        router.push('/inventory');
        break;
      default:
        break;
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      {/* Dashboard Title */}
      <div className={styles.dashboardTitle}>Dashboard</div>
      
      {!mounted && (
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          fontSize: '1.1rem',
          color: '#6b7280'
        }}>
          Loading...
        </div>
      )}
      
      {mounted && loading && (
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          fontSize: '1.1rem',
          color: '#6b7280'
        }}>
          Loading dashboard data...
        </div>
      )}
      
      {mounted && error && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '0.5rem',
          padding: '1rem',
          marginBottom: '1rem',
          color: '#b91c1c'
        }}>
          {error}
        </div>
      )}
      
      {mounted && !loading && !error && (
        <>
          {/* Main Inventory Card */}
          <div className={styles.dashboardCard}>
            <Image
              src="/dtc-bg.png"
              alt="Inventory Background"
              className={styles.dashboardCardBg}
              fill
              priority
            />
            <div className={styles.dashboardCardContent}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>{totalItems} <span style={{ fontSize: '1.1rem', fontWeight: 500 }}>Items</span></div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: 2 }}>Inventory Total</div>
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, opacity: 0.8 }}>Inventory Management System</div>
              </div>
              <div style={{ fontSize: '0.85rem', marginTop: 18, opacity: 0.8 }}>Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
            </div>
          </div>
          {/* Stats Grid */}
          <div className={styles.dashboardStatsGrid}>
            <StatCard 
              label="Needed Maintenance" 
              value={neededMaintenance} 
              date={new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              priority={neededMaintenance > 0}
              description="Items with poor status or pending maintenance"
              onClick={() => handleCardClick('needed-maintenance')}
            />
            <StatCard 
              label="Total Maintenance" 
              value={totalMaintenance} 
              date={new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              onClick={() => handleCardClick('total-maintenance')}
            />
            <StatCard 
              label="Total Articles" 
              value={totalArticles} 
              date={new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              description="Unique article types in inventory"
              onClick={() => handleCardClick('total-articles')}
            />
            <StatCard 
              label="Recently Added" 
              value={recentlyAdded} 
              date={new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              onClick={() => handleCardClick('recently-added')}
            />
          </div>
          {/* Recent Section */}
          <div className={styles.dashboardRecent}>
            <div className={styles.dashboardRecentTitle}>Recently Added Items</div>
            <div className={styles.dashboardRecentList}>
              {recentItems.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '2rem',
                  color: '#6b7280',
                  fontSize: '0.9rem'
                }}>
                  No items added today
                </div>
              ) : (
                recentItems.map((item) => (
                  <div key={item.id} className={styles.dashboardRecentCard} onClick={() => router.push(`/inventory/${item.id}`)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {item.image_url ? (
                        <img
                          src={getImageUrl(item.image_url)}
                          alt={item.property_no}
                          style={{
                            width: 48,
                            height: 48,
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb'
                          }}
                        />
                      ) : (
                        <div style={{
                          width: 48,
                          height: 48,
                          backgroundColor: '#f3f4f6',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid #e5e7eb'
                        }}>
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
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: '#1f2937', fontSize: '0.9rem' }}>
                          {item.qr_code || item.property_no}
                        </div>
                        <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>
                          {item.article_type}
                        </div>
                        {item.has_pending_maintenance && (
                          <div style={{ color: '#dc2626', fontSize: '0.75rem', fontWeight: 500, marginTop: '2px' }}>
                            ⚠️ Pending Maintenance
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, date, priority = false, description, onClick }: { 
  label: string; 
  value: number; 
  date: string; 
  priority?: boolean; 
  description?: string;
  onClick?: () => void;
}) {
  return (
    <div 
      className={styles.dashboardStatCard} 
      style={{
        borderLeft: priority ? '4px solid #dc2626' : undefined,
        backgroundColor: priority ? '#fef2f2' : undefined,
      }}
      onClick={onClick}
    >
      <div className={styles.dashboardStatValue} style={{
        color: priority ? '#dc2626' : undefined,
        fontWeight: priority ? '700' : undefined
      }}>{value}</div>
      <div className={styles.dashboardStatLabel}>{label}</div>
      {description && (
        <div style={{
          fontSize: '0.75rem',
          color: '#6b7280',
          marginTop: '2px',
          fontStyle: 'italic',
          fontFamily: 'Poppins, sans-serif'
        }}>
          {description}
        </div>
      )}
      <div className={styles.dashboardStatDate}>Updated: {date}</div>
      {priority && (
        <div style={{
          fontSize: '0.75rem',
          color: '#dc2626',
          fontWeight: '600',
          marginTop: '4px',
          fontFamily: 'Poppins, sans-serif'
        }}>
          ⚠️ Requires Attention
        </div>
      )}
      {onClick && (
        <div style={{
          fontSize: '0.75rem',
          color: '#3b82f6',
          fontWeight: '500',
          marginTop: '4px',
          fontFamily: 'Poppins, sans-serif'
        }}>
          Click to view →
        </div>
      )}
    </div>
  );
}
