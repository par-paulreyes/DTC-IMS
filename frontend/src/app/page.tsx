"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import styles from "./page.module.css";
import { getApiUrl } from "../config/api";

export default function DashboardPage() {
  const [totalItems, setTotalItems] = useState(24); // demo value
  const [recentlyAdded, setRecentlyAdded] = useState(5);
  const [categoryCount, setCategoryCount] = useState(4);
  const [lastScan, setLastScan] = useState(2);
  const [locationCount, setLocationCount] = useState(5);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    setLoading(true);
    axios.get(getApiUrl("/users/profile"), { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [router]);

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
        setRecentlyAdded(itemsRes.data.length - itemsRes.data.filter((item: any) => item.createdAt).length);
        setCategoryCount(itemsRes.data.filter((item: any) => item.category).length);
        setLastScan(itemsRes.data.filter((item: any) => item.lastScan).length);
        setLocationCount(itemsRes.data.filter((item: any) => item.location).length);
        setLoading(false);
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
    <div className={styles.dashboardContainer}>
      {/* Dashboard Title */}
      <div className={styles.dashboardTitle}>Dashboard</div>
      {/* Main Inventory Card */}
      <div className={styles.dashboardCard}>
        <img
          src="/dtc-bg.png"
          alt="Inventory Background"
          className={styles.dashboardCardBg}
        />
        <div className={styles.dashboardCardContent}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>{totalItems} <span style={{ fontSize: '1.1rem', fontWeight: 500 }}>Items</span></div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: 2 }}>Inventory Total</div>
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, opacity: 0.8 }}>Inventory Management System</div>
          </div>
          <div style={{ fontSize: '0.85rem', marginTop: 18, opacity: 0.8 }}>Updated: June 14, 2025</div>
        </div>
      </div>
      {/* Stats Grid */}
      <div className={styles.dashboardStatsGrid}>
        <StatCard label="Recently Added" value={recentlyAdded} date="June 17, 2025" />
        <StatCard label="Category" value={categoryCount} date="June 17, 2025" />
        <StatCard label="Last Scan" value={lastScan} date="June 17, 2025" />
        <StatCard label="Location" value={locationCount} date="June 17, 2025" />
      </div>
      {/* Recent Section */}
      <div className={styles.dashboardRecent}>
        <div className={styles.dashboardRecentTitle}>Recent</div>
        <div className={styles.dashboardRecentList}>
          <div className={styles.dashboardRecentCard}></div>
          <div className={styles.dashboardRecentCard}></div>
          <div className={styles.dashboardRecentCard}></div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, date }: { label: string; value: number; date: string }) {
  const styles = require("./page.module.css");
  return (
    <div className={styles.dashboardStatCard}>
      <div className={styles.dashboardStatValue}>{value}</div>
      <div className={styles.dashboardStatLabel}>{label}</div>
      <div className={styles.dashboardStatDate}>Updated: {date}</div>
    </div>
  );
}
