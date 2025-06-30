"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "../../config/api";
import "./logs.css";
import "../inventory/inventory.css";

interface Log {
  id: number;
  property_no: string;
  qr_code: string;
  article_type: string;
  maintenance_date: string;
  task_performed: string;
  maintained_by: string;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle clicking outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowExportDropdown(false);
      }
    };

    if (showExportDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportDropdown]);

  useEffect(() => {
    if (!mounted) return;
    
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    apiClient
      .get("/logs")
      .then((res) => setLogs(res.data))
      .catch((err) => setError("Error loading logs"))
      .finally(() => setLoading(false));
  }, [router, mounted]);

  const handleExport = async (format: string) => {
    setExporting(true);
    try {
      const response = await apiClient.get(`/logs/export?format=${format}`, {
        responseType: 'blob', // Important for file downloads
      });
      
      // Create a blob URL and trigger download
      const blob = new Blob([response.data], {
        type: format === 'pdf' ? 'application/pdf' : 'text/csv'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `maintenance_logs.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  // Filter logs by search
  const filteredLogs = logs.filter(
    (log) =>
      log.qr_code.toLowerCase().includes(search.toLowerCase()) ||
      log.article_type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="main-container">
      {/* Red Header Container */}
      <div className="logs-top-card">
        <div className="logs-header-content">
          <h1 className="logs-title">Maintenance Logs</h1>
          <div className="logs-controls">
            {/* Search Bar with Export Dropdown */}
            <div className="searchbar-row">
              <div className="searchbar-pill">
                <div className="searchbar-icon-bg">
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by QR code or article type..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="searchbar-input"
                />
                {/* Export Dropdown inside search bar */}
                <div className={`export-dropdown ${showExportDropdown ? 'open' : ''}`} ref={dropdownRef}>
                  <button
                    className="export-dropdown-btn"
                    onClick={() => setShowExportDropdown(!showExportDropdown)}
                    disabled={exporting}
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7,10 12,15 17,10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Export
                  </button>
                  {showExportDropdown && (
                    <div className="export-dropdown-menu">
                      <button
                        className="export-dropdown-item"
                        onClick={() => {
                          handleExport("csv");
                          setShowExportDropdown(false);
                        }}
                        disabled={exporting}
                      >
                        {exporting ? "Exporting..." : "Export CSV"}
                      </button>
                      <button
                        className="export-dropdown-item"
                        onClick={() => {
                          handleExport("pdf");
                          setShowExportDropdown(false);
                        }}
                        disabled={exporting}
                      >
                        {exporting ? "Exporting..." : "Export PDF"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content Container */}
      <div className="logs-content-card">
        {!mounted && <div className="loading">Loading...</div>}
        {mounted && loading && <div className="loading">Loading...</div>}
        {mounted && error && <div className="error">{error}</div>}
        
        {mounted && !loading && !error && (
          <div className="logs-container">
            {filteredLogs.length === 0 && (
              <div className="no-logs">No logs found.</div>
            )}
            {filteredLogs.map((log) => (
              <div key={log.id} className="log-card">
                <div className="log-card-main-row">
                  <div className="log-image">
                    {log.article_type.toLowerCase().includes('desktop') && (
                      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                        <line x1="8" y1="21" x2="16" y2="21"/>
                        <line x1="12" y1="17" x2="12" y2="21"/>
                      </svg>
                    )}
                    {log.article_type.toLowerCase().includes('laptop') && (
                      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                        <line x1="2" y1="10" x2="22" y2="10"/>
                      </svg>
                    )}
                    {log.article_type.toLowerCase().includes('printer') && (
                      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <polyline points="6,9 6,2 18,2 18,9"/>
                        <path d="M6,18H4a2,2 0 0,1 -2,-2v-5a2,2 0 0,1 2,-2h16a2,2 0 0,1 2,2v5a2,2 0 0,1 -2,2h-2"/>
                        <rect x="6" y="14" width="12" height="8"/>
                      </svg>
                    )}
                    {log.article_type.toLowerCase().includes('keyboard') && (
                      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <rect x="2" y="4" width="20" height="16" rx="2" ry="2"/>
                        <line x1="6" y1="8" x2="6" y2="8"/>
                        <line x1="10" y1="8" x2="10" y2="8"/>
                        <line x1="14" y1="8" x2="14" y2="8"/>
                        <line x1="18" y1="8" x2="18" y2="8"/>
                        <line x1="6" y1="12" x2="6" y2="12"/>
                        <line x1="10" y1="12" x2="10" y2="12"/>
                        <line x1="14" y1="12" x2="14" y2="12"/>
                        <line x1="18" y1="12" x2="18" y2="12"/>
                        <line x1="6" y1="16" x2="6" y2="16"/>
                        <line x1="10" y1="16" x2="10" y2="16"/>
                        <line x1="14" y1="16" x2="14" y2="16"/>
                        <line x1="18" y1="16" x2="18" y2="16"/>
                      </svg>
                    )}
                    {log.article_type.toLowerCase().includes('pc') && (
                      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                        <line x1="8" y1="21" x2="16" y2="21"/>
                        <line x1="12" y1="17" x2="12" y2="21"/>
                        <circle cx="12" cy="8" r="1"/>
                      </svg>
                    )}
                    {!log.article_type.toLowerCase().includes('desktop') && 
                     !log.article_type.toLowerCase().includes('laptop') && 
                     !log.article_type.toLowerCase().includes('printer') && 
                     !log.article_type.toLowerCase().includes('keyboard') && 
                     !log.article_type.toLowerCase().includes('pc') && (
                      <span className="text-xl">📷</span>
                    )}
                  </div>
                  <div className="log-main-info">
                    <div className="qr-code">{log.qr_code}</div>
                    <div className="article-type">{log.article_type}</div>
                  </div>
                </div>
                <div className="log-details">
                  <div className="maintenance-date">{log.maintenance_date}</div>
                  <hr className="divider" />
                  <div className="detail-row">
                    <span className="detail-label">Task:</span> {log.task_performed}
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Maintained By:</span> {log.maintained_by}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 