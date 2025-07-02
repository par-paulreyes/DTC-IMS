"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./dashboard.module.css";
import { apiClient, getImageUrl } from "../config/api";
import { FaHome, FaClipboardList, FaHistory, FaUser, FaSync, FaSyncAlt, FaTools, FaChartBar, FaBoxes, FaPlus } from "react-icons/fa";


interface Item {
  id: number;
  property_no: string;
  qr_code: string;
  article_type: string; // This is the actual name field in the database
  specifications?: string;
  date_acquired?: string;
  end_user?: string;
  price?: number;
  location?: string;
  supply_officer?: string;
  company_name: string;
  image_url?: string;
  next_maintenance_date?: string;
  pending_maintenance_count?: number;
  maintenance_status?: string;
  status?: string;
  system_status?: string;
  created_at: string;
  updated_at?: string;
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
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [itemImageUrls, setItemImageUrls] = useState<{[key: string]: string}>({});
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [criticalItems, setCriticalItems] = useState(0);
  const [completedMaintenance, setCompletedMaintenance] = useState(0);
  const [pendingMaintenance, setPendingMaintenance] = useState(0);
  const [topCategory, setTopCategory] = useState('');
  const [topCategoryCount, setTopCategoryCount] = useState(0);
  const [secondCategory, setSecondCategory] = useState('');
  const [secondCategoryCount, setSecondCategoryCount] = useState(0);
  const [todayAdded, setTodayAdded] = useState(0);
  const [yesterdayAdded, setYesterdayAdded] = useState(0);
  const [goodStatusCount, setGoodStatusCount] = useState(0);
  const [belowGoodCount, setBelowGoodCount] = useState(0);
  const [othersAddedThisWeek, setOthersAddedThisWeek] = useState(0);
  const [mostRecentOtherArticle, setMostRecentOtherArticle] = useState('');
  const router = useRouter();


  // Function to fetch dashboard data
  const fetchDashboardData = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    setError("");
   
    try {
      const [itemsRes, neededMaintenanceRes, maintenanceLogsRes] = await Promise.all([
        apiClient.get("/items"),
        apiClient.get("/items/maintenance/needed"),
        apiClient.get("/logs"),
      ]);


      const items = itemsRes.data;
      const neededMaintenance = neededMaintenanceRes.data;
      const maintenanceLogs = maintenanceLogsRes.data;
     
      // Calculate statistics
      const totalItems = items.length;
      const criticalItemsCount = items.filter((item: Item) => item.system_status === 'Poor' || item.system_status === 'Critical' || item.system_status === 'Fair' || item.system_status === 'Needs Repair' || item.system_status === 'Out of Order').length;
      const completedMaintenanceCount = maintenanceLogs.filter((log: any) => log.status === 'completed').length;
      const pendingMaintenanceCount = maintenanceLogs.filter((log: any) => log.status === 'pending').length;
      const totalMaintenanceCount = maintenanceLogs.length;
     
      // Calculate items needing maintenance (system_status below 'Good')
      const itemsNeedingMaintenance = items.filter((item: Item) =>
        item.system_status &&
        ['Poor', 'Critical', 'Fair', 'Needs Repair', 'Out of Order'].includes(item.system_status)
      ).length;
     
      // Calculate items with Good status
      const itemsWithGoodStatus = items.filter((item: Item) =>
        item.system_status &&
        item.system_status === 'Good'
      ).length;
     
      // Calculate category statistics (using article_type instead of category)
      const categoryCounts: { [key: string]: number } = {};
      items.forEach((item: Item) => {
        const category = item.article_type || 'Uncategorized';
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      });
     
      const sortedCategories = Object.entries(categoryCounts)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 2);
     
      const topCategoryName = sortedCategories[0]?.[0] || 'None';
      const topCategoryCount = sortedCategories[0]?.[1] as number || 0;
      const secondCategoryName = sortedCategories[1]?.[0] || 'None';
      const secondCategoryCount = sortedCategories[1]?.[1] as number || 0;
     
      // Calculate today and yesterday added items
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const todayAddedCount = items.filter((item: Item) => {
        if (!item || !item.created_at) return false;
        const itemDate = new Date(item.created_at);
        return itemDate.toDateString() === today.toDateString();
      }).length;

      const yesterdayAddedCount = items.filter((item: Item) => {
        if (!item || !item.created_at) return false;
        const itemDate = new Date(item.created_at);
        return itemDate.toDateString() === yesterday.toDateString();
      }).length;

      // Get recently added items (last 5 items)
      const recentItemsList = items
        .filter((item: Item) => item && item.created_at) // Filter out items without creation date
        .sort((a: Item, b: Item) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);

      // Calculate recently added count (items added in last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentlyAddedCount = items.filter((item: Item) => {
        if (!item || !item.created_at) return false;
        const itemDate = new Date(item.created_at);
        return itemDate >= sevenDaysAgo;
      }).length;

      // Calculate recently added articles this week
      const recentlyAddedArticles = items.filter((item: Item) => {
        if (!item || !item.created_at) return false;
        const itemDate = new Date(item.created_at);
        return itemDate >= sevenDaysAgo;
      });
      const recentlyAddedArticlesCount = recentlyAddedArticles.length;

      // Calculate 'other' articles (not Desktop or Printer) added this week
      const recentlyAddedOthers = recentlyAddedArticles.filter((item: Item) => {
        const type = (item.article_type || '').toLowerCase();
        return type !== 'desktop' && type !== 'printer';
      });
      const recentlyAddedOthersCount = recentlyAddedOthers.length;

      // Find the most recently added article type this week (excluding Desktop and Printer)
      let mostRecentOtherArticle = '';
      if (recentlyAddedOthers.length > 0) {
        mostRecentOtherArticle = recentlyAddedOthers[0].article_type || '';
      }
      setMostRecentOtherArticle(mostRecentOtherArticle);

      // Set all state variables
      setTotalItems(totalItems);
      setNeededMaintenance(itemsNeedingMaintenance);
      setTotalMaintenance(totalMaintenanceCount);
      setTotalArticles(totalItems); // Total articles is the same as total items
      setRecentlyAdded(recentlyAddedCount);
      setRecentItems(recentItemsList);
      // Load image URLs for recent items
      loadItemImageUrls(recentItemsList);
      setCriticalItems(criticalItemsCount);
      setCompletedMaintenance(completedMaintenanceCount);
      setPendingMaintenance(pendingMaintenanceCount);
      setTopCategory(topCategoryName);
      setTopCategoryCount(topCategoryCount);
      setSecondCategory(secondCategoryName);
      setSecondCategoryCount(secondCategoryCount);
      setTodayAdded(todayAddedCount);
      setYesterdayAdded(yesterdayAddedCount);
      setGoodStatusCount(itemsWithGoodStatus);
      setBelowGoodCount(itemsNeedingMaintenance);
      setOthersAddedThisWeek(recentlyAddedOthersCount);
     
      setLastUpdated(new Date());
     
      // Log the fetched data for debugging
      console.log('Dashboard data updated:', {
        totalItems: totalItems,
        neededMaintenance: itemsNeedingMaintenance,
        goodStatusCount: itemsWithGoodStatus,
        belowGoodCount: itemsNeedingMaintenance,
        totalMaintenance: totalMaintenanceCount,
        recentlyAdded: recentlyAddedCount,
        totalArticles: totalItems,
        criticalItems: criticalItemsCount,
        completedMaintenance: completedMaintenanceCount,
        pendingMaintenance: pendingMaintenanceCount,
        recentItems: recentItemsList.length
      });
     
    } catch (err: any) {
      console.error("Error loading dashboard stats:", err);
      setError("Error loading dashboard stats");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);


  // Manual refresh function
  const handleManualRefresh = () => {
    fetchDashboardData(false);
  };


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


    // Initial data fetch
    fetchDashboardData();


    // Set up automatic refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      fetchDashboardData(false);
    }, 30000); // 30 seconds


    // Set up focus refresh (refresh when user returns to tab)
    const handleFocus = () => {
      fetchDashboardData(false);
    };


    // Set up visibility change refresh (refresh when user returns to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchDashboardData(false);
      }
    };


    // Set up route change refresh (refresh when user navigates back to dashboard)
    const handleRouteChange = () => {
      // Check if we're on the dashboard page
      if (window.location.pathname === '/') {
        fetchDashboardData(false);
      }
    };


    // Check for maintenance update triggers
    const checkMaintenanceUpdates = () => {
      const refreshTrigger = localStorage.getItem('dashboard_refresh_trigger');
      if (refreshTrigger) {
        const triggerTime = parseInt(refreshTrigger);
        const currentTime = Date.now();
        // If trigger is less than 5 seconds old, refresh dashboard
        if (currentTime - triggerTime < 5000) {
          fetchDashboardData(false);
          localStorage.removeItem('dashboard_refresh_trigger');
        }
      }
    };


    // Check for maintenance updates every 2 seconds
    const maintenanceCheckInterval = setInterval(checkMaintenanceUpdates, 2000);


    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('popstate', handleRouteChange);


    // Cleanup
    return () => {
      clearInterval(refreshInterval);
      clearInterval(maintenanceCheckInterval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [router, mounted, fetchDashboardData]);


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
        router.push('/inventory?needs_maintenance=true');
        break;
      case 'total-maintenance':
        router.push('/inventory?maintenance=pending');
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


  return (
    <div className={styles.dashboardContainer}>
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
        <div className={styles.dashboardCardsWrapper}>
          <div className={styles.dashboardCard}>
            <Image
              src="/dtc.svg"
              alt="Inventory Background"
              className={styles.dashboardCardBg}
              fill
              priority
            />
            <div className={styles.dashboardCardContent}>
              <div className={styles.dashboardCardTitle}>Dashboard</div>
              <div className={styles.dashboardCardRow}>
                <div className={styles.dashboardCardStatBlock}>
                  <div className={styles.dashboardCardNumberRow}>
                    <span className={styles.dashboardCardNumber}>{totalItems}</span>
                    <span className={styles.dashboardCardItemsLabel}>items</span>
                  </div>
                  <div className={styles.dashboardCardDetailsRow}>
                    <span className={styles.dashboardCardBadge} style={{ background: 'none', borderRadius: 0, padding: 0, fontWeight: 400 }}>Inventory Total</span>
                  </div>
                </div>
                <div className={styles.dashboardCardInfoBlock}>
                  <div className={styles.dashboardCardInfoTextBlock}>
                    <span>Inventory System</span>
                    <div className={styles.dashboardCardDetailsRow}>
                      <span>Updated: {lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                      <button
                        onClick={handleManualRefresh}
                        disabled={refreshing}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '4px',
                          opacity: refreshing ? 0.5 : 0.8,
                          transition: 'all 0.2s ease',
                          marginLeft: '8px'
                        }}
                        title="Refresh data"
                      >
                        <FaSyncAlt
                          size={14}
                          style={{
                            color: '#fff',
                            animation: refreshing ? 'spin 1s linear infinite' : 'none'
                          }}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>


          <div className={styles.dashboardInfoGrid}>
            {/* Needed Maintenance */}
            <div
              className={`${styles.infoCard} ${styles.infoCardTopBorder}`}
              onClick={() => handleCardClick('needed-maintenance')}
              style={{ cursor: 'pointer' }}
              title="Click to view all items except those with Good status"
            >
              <div className={styles.cardTopRow}>
                <span className={styles.cardNumber} style={{ color: 'var(--primary-red-dark)' }}>{belowGoodCount}</span>
                <span className={styles.cardIcon} style={{ background: 'var(--neutral-gray-200)' }}>
                  <FaTools size={28} style={{ color: 'var(--primary-red-dark)' }} />
                </span>
              </div>
              <div className={styles.cardTitle} style={{ color: 'var(--neutral-gray-900)' }}>Needs Action</div>
              <div className={`${styles.cardChange} ${belowGoodCount > 0 ? styles['cardChange--red'] : styles['cardChange--green']}`}>
                {belowGoodCount > 0 ? 'Items below Good status' : 'All items in good condition'}
              </div>
              <div className={styles.cardStatsRow}>
                <div>
                  <span className={`${styles.cardStatValue} ${styles['stat--green']}`}>{goodStatusCount}</span> <span className={styles.cardStatLabel} style={{ color: 'var(--neutral-gray-900)' }}>GOOD</span>
                </div>
                <div>
                  <span className={`${styles.cardStatValue} ${styles['stat--red']}`}>{belowGoodCount}</span> <span className={styles.cardStatLabel} style={{ color: 'var(--neutral-gray-900)' }}>URGENT</span>
                </div>
              </div>
              <div className={styles.cardFooterRow}>
                <span className={styles.cardDate} style={{ color: 'var(--neutral-gray-900)' }}>Updated: {lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
            {/* Total Maintenance */}
            <div
              className={`${styles.infoCard} ${styles.infoCardTopBorder}`}
              onClick={() => handleCardClick('total-maintenance')}
              style={{ cursor: 'pointer' }}
              title="Click to view items with pending maintenance"
            >
              <div className={styles.cardTopRow}>
                <span className={styles.cardNumber} style={{ color: 'var(--primary-red-dark)' }}>{totalMaintenance}</span>
                <span className={styles.cardIcon} style={{ background: 'var(--neutral-gray-200)' }}>
                  <FaChartBar size={28} style={{ color: 'var(--primary-red-dark)' }} />
                </span>
              </div>
              <div className={styles.cardTitle} style={{ color: 'var(--neutral-gray-900)' }}>Total Maintenance</div>
              <div className={`${styles.cardChange} ${pendingMaintenance > 0 ? styles['cardChange--red'] : styles['cardChange--green']}`}>
                {pendingMaintenance > 0 ? `${pendingMaintenance} pending` : `${completedMaintenance} completed`}
              </div>
              <div className={styles.cardProgressBar} title={
                totalMaintenance === 0
                  ? 'No maintenance logs yet'
                  : completedMaintenance === totalMaintenance
                    ? 'All maintenance completed'
                    : `${completedMaintenance} of ${totalMaintenance} completed`
              }>
                <div
                  className={
                    completedMaintenance === totalMaintenance && totalMaintenance > 0
                      ? styles['cardProgress--green']
                      : styles['cardProgress--red']
                  }
                  style={{ width: `${totalMaintenance > 0 ? (completedMaintenance / totalMaintenance) * 100 : 0}%` }}
                />
              </div>
              <div className={styles.cardStatsRow}>
                <div>
                  <span className={`${styles.cardStatValue} ${styles['stat--green']}`}>{completedMaintenance}</span> <span className={styles.cardStatLabel} style={{ color: 'var(--neutral-gray-900)' }}>COMPLETED</span>
                </div>
                <div>
                  <span className={`${styles.cardStatValue} ${pendingMaintenance > 0 ? styles['stat--red'] : styles['stat--green']}`}>{pendingMaintenance}</span> <span className={styles.cardStatLabel} style={{ color: 'var(--neutral-gray-900)' }}>PENDING</span>
                </div>
              </div>
              <div className={styles.cardFooterRow}>
                <span className={styles.cardDate} style={{ color: 'var(--neutral-gray-900)' }}>Updated: {lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
            {/* Total Articles */}
            <div
              className={`${styles.infoCard} ${styles.infoCardTopBorder}`}
              onClick={() => handleCardClick('total-articles')}
              style={{ cursor: 'pointer' }}
              title="Click to view all inventory items"
            >
              <div className={styles.cardTopRow}>
                <span className={styles.cardNumber} style={{ color: 'var(--primary-red-dark)' }}>{totalArticles}</span>
                <span className={styles.cardIcon} style={{ background: 'var(--neutral-gray-200)' }}>
                  <FaBoxes size={28} style={{ color: 'var(--primary-red-dark)' }} />
                </span>
              </div>
              <div className={styles.cardTitle} style={{ color: 'var(--neutral-gray-900)' }}>Total Articles</div>
              {/* Show 'New {article} added' under the title if a new other article was added this week */}
              {mostRecentOtherArticle && (
                <div className={`${styles.cardChange} ${styles['cardChange--green']}`} style={{ marginBottom: '10px' }}>
                  New {mostRecentOtherArticle} added
                </div>
              )}
              {recentlyAdded === 0 && !mostRecentOtherArticle ? (
                <div className={`${styles.cardChange} ${styles['cardChange--neutral']}`}>No change</div>
              ) : null}
              <div className={styles.cardStatsRow}>
                <div>
                  <span className={`${styles.cardStatValue} ${styles['stat--green']}`}>{topCategoryCount}</span> <span className={styles.cardStatLabel} style={{ color: 'var(--neutral-gray-900)' }}>{(topCategory || 'NONE').toUpperCase()}</span>
                </div>
                <div>
                  <span className={`${styles.cardStatValue} ${styles['stat--green']}`}>{secondCategoryCount}</span> <span className={styles.cardStatLabel} style={{ color: 'var(--neutral-gray-900)' }}>{(secondCategory || 'NONE').toUpperCase()}</span>
                </div>
              </div>
              <div className={styles.cardFooterRow}>
                <span className={styles.cardDate} style={{ color: 'var(--neutral-gray-900)' }}>Updated: {lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
            {/* Recently Added */}
            <div
              className={`${styles.infoCard} ${styles.infoCardTopBorder}`}
              onClick={() => handleCardClick('recently-added')}
              style={{ cursor: 'pointer' }}
              title="Click to view all inventory items"
            >
              <div className={styles.cardTopRow}>
                <span className={styles.cardNumber} style={{ color: 'var(--primary-red-dark)' }}>{recentlyAdded}</span>
                <span className={styles.cardIcon} style={{ background: 'var(--neutral-gray-200)' }}>
                  <FaPlus size={28} style={{ color: 'var(--primary-red-dark)' }} />
                </span>
              </div>
              <div className={styles.cardTitle} style={{ color: 'var(--neutral-gray-900)' }}>Recently Added</div>
              <div className={`${styles.cardChange} ${styles['cardChange--green']}`}>+{recentlyAdded} this week</div>
              <div className={styles.cardStatsRow}>
                <div>
                  <span className={`${styles.cardStatValue} ${styles['stat--green']}`}>{todayAdded}</span> <span className={styles.cardStatLabel} style={{ color: 'var(--neutral-gray-900)' }}>TODAY</span>
                </div>
                <div>
                  <span className={styles.cardStatValue} style={{ color: '#111' }}>{yesterdayAdded}</span> <span className={styles.cardStatLabel} style={{ color: 'var(--neutral-gray-900)' }}>YESTERDAY</span>
                </div>
              </div>
              <div className={styles.cardFooterRow}>
                <span className={styles.cardDate} style={{ color: 'var(--neutral-gray-900)' }}>Updated: {lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
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
                  {totalItems === 0 ? 'No items in inventory yet' : 'No recent items to display'}
                  {totalItems > 0 && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                      Total items: {totalItems}
                    </div>
                  )}
                </div>
              ) : (
                recentItems.map((item) => (
                  <div
                    key={item.id}
                    className={styles.dashboardRecentCard}
                    onClick={() => router.push(`/inventory/${item.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {/* Remove image display */}
                      {/* {itemImageUrls[item.id] ? (
                        <img
                          src={itemImageUrls[item.id]}
                          alt={item.article_type}
                          style={{
                            width: 48,
                            height: 48,
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb'
                          }}
                        />
                      ) : ( */}
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
                          {(item.article_type || '').toLowerCase().includes('desktop') && (
                            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                              <line x1="8" y1="21" x2="16" y2="21"/>
                              <line x1="12" y1="17" x2="12" y2="21"/>
                            </svg>
                          )}
                          {(item.article_type || '').toLowerCase().includes('laptop') && (
                            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                              <line x1="2" y1="10" x2="22" y2="10"/>
                            </svg>
                          )}
                          {(item.article_type || '').toLowerCase().includes('printer') && (
                            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <polyline points="6,9 6,2 18,2 18,9"/>
                              <path d="M6,18H4a2,2 0 0,1 -2,-2v-5a2,2 0 0,1 2,-2h16a2,2 0 0,1 2,2v5a2,2 0 0,1 -2,2h-2"/>
                              <rect x="6" y="14" width="12" height="8"/>
                            </svg>
                          )}
                          {(item.article_type || '').toLowerCase().includes('monitor') && (
                            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                              <line x1="8" y1="21" x2="16" y2="21"/>
                              <line x1="12" y1="17" x2="12" y2="21"/>
                            </svg>
                          )}
                          {(item.article_type || '').toLowerCase().includes('scanner') && (
                            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                              <line x1="8" y1="21" x2="16" y2="21"/>
                              <line x1="12" y1="17" x2="12" y2="21"/>
                              <line x1="6" y1="8" x2="18" y2="8"/>
                              <line x1="6" y1="12" x2="18" y2="12"/>
                            </svg>
                          )}
                          {(item.article_type || '').toLowerCase().includes('server') && (
                            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/>
                              <rect x="2" y="14" width="20" height="8" rx="2" ry="2"/>
                              <line x1="6" y1="6" x2="6" y2="6"/>
                              <line x1="6" y1="18" x2="6" y2="18"/>
                            </svg>
                          )}
                          {(item.article_type || '').toLowerCase().includes('network') && (
                            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="3"/>
                              <path d="M12 1v6m0 6v6"/>
                              <path d="M21 12h-6m-6 0H3"/>
                              <path d="M19.78 4.22l-4.24 4.24m-6.36 6.36l-4.24 4.24"/>
                              <path d="M4.22 4.22l4.24 4.24m6.36 6.36l4.24 4.24"/>
                            </svg>
                          )}
                          {!(item.article_type || '').toLowerCase().includes('desktop') &&
                           !(item.article_type || '').toLowerCase().includes('laptop') &&
                           !(item.article_type || '').toLowerCase().includes('printer') &&
                           !(item.article_type || '').toLowerCase().includes('monitor') &&
                           !(item.article_type || '').toLowerCase().includes('scanner') &&
                           !(item.article_type || '').toLowerCase().includes('server') &&
                           !(item.article_type || '').toLowerCase().includes('network') && (
                            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                              <circle cx="8.5" cy="8.5" r="1.5"/>
                              <polyline points="21,15 16,10 5,21"/>
                            </svg>
                          )}
                        </div>
                      {/* )} */}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: '#1f2937', fontSize: '0.9rem' }}>
                          {item.article_type || 'Unnamed Item'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>
                          QR: {item.qr_code}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>
                          Added: {new Date(item.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}


      {/* Add CSS for spinning animation */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}



