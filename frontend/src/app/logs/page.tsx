"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient, getApiUrl } from "../../config/api";
import "./logs.css";
import "../inventory/inventory.css";

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
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
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
  }, [router]);

  const handleExport = (format: string) => {
    const token = localStorage.getItem("token");
    window.open(`${getApiUrl("/logs/export")}?format=${format}&token=${token}`, "_blank");
  };

  // Filter logs by search
  const filteredLogs = logs.filter(
    (log) =>
      log.property_no.toLowerCase().includes(search.toLowerCase()) ||
      log.article_type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="main-container">
      <div className="header">
        <h1 className="title">Maintenance Logs</h1>
        <div className="export-buttons">
          <button
            className="export-btn export-btn-csv"
            onClick={() => handleExport("csv")}
          >
            Export CSV
          </button>
          <button
            className="export-btn export-btn-pdf"
            onClick={() => handleExport("pdf")}
          >
            Export PDF
          </button>
        </div>
      </div>
      {/* Search Bar */}
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
            placeholder="Search by property no or article type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="searchbar-input"
          />
        </div>
      </div>
      
      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error">{error}</div>}
      
      {!loading && !error && (
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
                  <div className="property-no">{log.property_no}</div>
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
  );
} 