"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { getApiUrl, getImageUrl } from "../../../config/api";
import imageCompression from 'browser-image-compression';

// Helper to format date for <input type="date">
function formatDateForInput(dateString: string) {
  if (!dateString) return "";
  return dateString.split("T")[0];
}

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<any>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [diagnostics, setDiagnostics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [loadingDiagnostics, setLoadingDiagnostics] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [logsError, setLogsError] = useState("");
  const [diagnosticsError, setDiagnosticsError] = useState("");
  const [editingDiagnostics, setEditingDiagnostics] = useState<any[]>([]);
  const [editingLogs, setEditingLogs] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (!id) return;
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    
    setLoading(true);
    setLoadingLogs(true);
    setLoadingDiagnostics(true);
    setError("");
    setLogsError("");
    setDiagnosticsError("");
    
    // Fetch item details
    const fetchItem = async () => {
      try {
        const response = await axios.get(getApiUrl(`/items/${id}`), { 
          headers: { Authorization: token } 
        });
        setItem(response.data);
        setEditingItem(response.data);
        console.log('Item data loaded:', response.data);
      } catch (err: any) {
        console.error('Error fetching item:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
        } else if (err.response?.status === 404) {
          setError("Item not found");
        } else {
          setError("Error loading item details: " + (err.response?.data?.message || err.message));
        }
      } finally {
        setLoading(false);
      }
    };

    // Fetch maintenance logs
    const fetchLogs = async () => {
      try {
        const response = await axios.get(getApiUrl(`/logs/item/${id}`), { 
          headers: { Authorization: token } 
        });
        setLogs(response.data);
        console.log('Maintenance logs loaded:', response.data);
      } catch (err: any) {
        console.error('Error fetching maintenance logs:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
        } else {
          setLogsError("Error loading maintenance logs: " + (err.response?.data?.message || err.message));
        }
      } finally {
        setLoadingLogs(false);
      }
    };

    // Fetch diagnostics
    const fetchDiagnostics = async () => {
      try {
        const response = await axios.get(getApiUrl(`/diagnostics/item/${id}`), { 
          headers: { Authorization: token } 
        });
        setDiagnostics(response.data);
        console.log('Diagnostics loaded:', response.data);
      } catch (err: any) {
        console.error('Error fetching diagnostics:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
        } else {
          setDiagnosticsError("Error loading diagnostics: " + (err.response?.data?.message || err.message));
        }
      } finally {
        setLoadingDiagnostics(false);
      }
    };

    // Fetch all data
    fetchItem();
    fetchLogs();
    fetchDiagnostics();
  }, [id, router]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditingItem({ ...item });
    setEditingDiagnostics(diagnostics.map(d => ({ ...d })));
    setEditingLogs(logs.map(l => ({ ...l })));
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingItem(item);
    setError("");
  };

  const handleSave = async () => {
    if (!editingItem) return;
    setSaving(true);
    setError("");
    const token = localStorage.getItem("token");
    
    // Debug: Log what we're about to send
    console.log('Sending item update with data:', editingItem);
    
    try {
      await axios.put(getApiUrl(`/items/${id}`), editingItem, {
        headers: { Authorization: token },
      });
      // Save diagnostics (send all required fields)
      await Promise.all(editingDiagnostics.map(diag =>
        axios.put(getApiUrl(`/diagnostics/${diag.id}`), {
          item_id: diag.item_id,
          diagnostics_date: diag.diagnostics_date,
          system_status: diag.system_status,
          findings: diag.findings,
          recommendations: diag.recommendations,
        }, { headers: { Authorization: token } })
      ));
      // Save maintenance logs (send all required fields)
      await Promise.all(editingLogs.map(log =>
        axios.put(getApiUrl(`/logs/${log.id}`), {
          item_id: log.item_id,
          maintenance_date: log.maintenance_date,
          task_performed: log.task_performed,
          maintained_by: log.maintained_by,
          notes: log.notes,
          status: log.status,
        }, { headers: { Authorization: token } })
      ));
      setItem(editingItem);
      setDiagnostics(editingDiagnostics);
      setLogs(editingLogs);
      setIsEditing(false);
    } catch (err: any) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
      } else {
        setError("Error updating item: " + (err.response?.data?.message || err.message));
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this item? This action cannot be undone.")) {
      return;
    }
    
    setDeleting(true);
    setError("");
    const token = localStorage.getItem("token");
    
    try {
      await axios.delete(getApiUrl(`/items/${id}`), {
        headers: { Authorization: token },
      });
      router.push("/inventory");
    } catch (err: any) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
      } else {
        setError("Error deleting item: " + (err.response?.data?.message || err.message));
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setEditingItem({ ...editingItem, [field]: value });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Good': return '✅';
      case 'Fair': return '⚠️';
      case 'Poor': return '❌';
      case 'Critical': return '🚨';
      default: return '❓';
    }
  };

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'pending': return '⏳';
      default: return '❓';
    }
  };

  const getTaskStatusClass = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDiagnosticChange = (index: number, field: string, value: any) => {
    setEditingDiagnostics(prev => prev.map((d, i) => i === index ? { ...d, [field]: value, diagnostics_date: new Date().toISOString().split('T')[0] } : d));
  };

  const handleLogChange = (index: number, field: string, value: any) => {
    setEditingLogs(prev => prev.map((l, i) => i === index ? { ...l, [field]: value, maintenance_date: new Date().toISOString().split('T')[0] } : l));
  };

  // Handle image upload for inventory item
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 800,
      useWebWorker: true,
    };
    setUploadingImage(true);
    try {
      const compressedFile = await imageCompression(file, options);
      const formData = new FormData();
      formData.append('image', compressedFile, file.name || 'item.png');
      const token = localStorage.getItem('token');
      const response = await axios.post(getApiUrl(`/items/${id}/image`), formData, {
        headers: {
          Authorization: token,
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data.url) {
        setEditingItem((prev: any) => ({ ...prev, image_url: response.data.url }));
      }
    } catch (err) {
      alert('Failed to upload image.');
    } finally {
      setUploadingImage(false);
    }
  };

  const imgSrc = isEditing
    ? (editingItem && getImageUrl(editingItem.image_url))
    : (item && getImageUrl(item.image_url));

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">Loading...</div>
  );
  
  if (error) return (
    <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>
  );
  
  if (!item) return (
    <div className="min-h-screen flex items-center justify-center text-gray-500">Item not found.</div>
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
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/inventory")}
                className="bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <h1 className="text-2xl font-bold">
                {isEditing ? "Edit Item" : `${item.property_no} (${item.article_type})`}
              </h1>
            </div>
            <div className="flex gap-2">
              {!isEditing ? (
                <>
                  <button
                    onClick={handleEdit}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>

          {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>}

          {/* Item Image */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-3">Item Image</h3>
            <div className="flex flex-col items-center gap-2">
              {imgSrc && (
                <img
                  src={imgSrc}
                  alt={item?.property_no || 'Item'}
                  className="w-80 h-80 max-w-[320px] max-h-[320px] object-cover rounded-lg border shadow-lg hover:shadow-xl transition-shadow"
                  style={{ width: 320, height: 320 }}
                  title="Item image"
                />
              )}
              {isEditing && (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleImageChange}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition"
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? 'Uploading...' : 'Change Picture'}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Item Details */}
          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-semibold mb-2 text-gray-700">Property No:</label>
                <div className="relative">
                  <input
                    type="text"
                    value={editingItem.property_no || ""}
                    onChange={(e) => handleInputChange("property_no", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-2 text-gray-700">Article Type:</label>
                <div className="relative">
                  <input
                    type="text"
                    value={editingItem.article_type || ""}
                    onChange={(e) => handleInputChange("article_type", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-2 text-gray-700">Location:</label>
                <div className="relative">
                  <input
                    type="text"
                    value={editingItem.location || ""}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-2 text-gray-700">End User:</label>
                <div className="relative">
                  <input
                    type="text"
                    value={editingItem.end_user || ""}
                    onChange={(e) => handleInputChange("end_user", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-2 text-gray-700">Date Acquired:</label>
                <div className="relative">
                  <input
                    type="date"
                    value={formatDateForInput(editingItem.date_acquired) || ""}
                    onChange={(e) => handleInputChange("date_acquired", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-2 text-gray-700">Price (₱):</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={editingItem.price || ""}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-2 text-gray-700">Supply Officer:</label>
                <div className="relative">
                  <input
                    type="text"
                    value={editingItem.supply_officer || ""}
                    onChange={(e) => handleInputChange("supply_officer", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block font-semibold mb-2 text-gray-700">Specifications:</label>
                <div className="relative">
                  <textarea
                    value={editingItem.specifications || ""}
                    onChange={(e) => handleInputChange("specifications", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 h-24 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="CPU, RAM, Storage, OS, etc."
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Property No:</span>
                  <span className="text-gray-900">{item.property_no}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Article Type:</span>
                  <span className="text-gray-900">{item.article_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Location:</span>
                  <span className="text-gray-900">{item.location || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">End User:</span>
                  <span className="text-gray-900">{item.end_user || 'N/A'}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Date Acquired:</span>
                  <span className="text-gray-900">{item.date_acquired || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Price:</span>
                  <span className="text-gray-900">₱{item.price || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Supply Officer:</span>
                  <span className="text-gray-900">{item.supply_officer || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Company:</span>
                  <span className="text-gray-900">{item.company_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Maintenance Status:</span>
                  <span className={`font-medium ${item.maintenance_status === 'pending' ? 'text-red-600' : 'text-green-600'}`}>
                    {item.maintenance_status === 'pending' ? '⚠️ Pending' : '✅ Up to Date'}
                  </span>
                </div>
                {item.pending_maintenance_count > 0 && (
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Pending Tasks:</span>
                    <span className="text-red-600 font-medium">{item.pending_maintenance_count} task{item.pending_maintenance_count > 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
              {item.specifications && (
                <div className="md:col-span-2">
                  <span className="font-semibold text-gray-700">Specifications:</span>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <span className="whitespace-pre-wrap break-words">{item.specifications}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* System Diagnostics */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            💻 System Diagnostics
          </h2>
          
          {loadingDiagnostics ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading diagnostics...</p>
            </div>
          ) : diagnosticsError ? (
            <div className="text-center py-8">
              <div className="text-red-500 text-4xl mb-3">⚠️</div>
              <p className="text-red-600 mb-2">Error loading diagnostics</p>
              <p className="text-sm text-gray-500">{diagnosticsError}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {isEditing ? (
                editingDiagnostics.length > 0 ? editingDiagnostics.map((diag, i) => (
                  <div key={diag.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getStatusIcon(diag.system_status)}</span>
                        <label htmlFor={`diag-status-${diag.id}`} className="sr-only">System Status</label>
                        <div className="relative">
                          <select
                            id={`diag-status-${diag.id}`}
                            className="border rounded px-2 py-1"
                            value={diag.system_status}
                            aria-label="System Status"
                            onChange={e => handleDiagnosticChange(i, 'system_status', e.target.value)}
                          >
                            <option value="Good">Good</option>
                            <option value="Fair">Fair</option>
                            <option value="Poor">Poor</option>
                            <option value="Critical">Critical</option>
                          </select>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{diag.diagnostics_date}</span>
                    </div>
                    <div className="mb-1 text-xs text-gray-400">Select the current system status.</div>
                    <div className="mb-3">
                      <label htmlFor={`diag-findings-${diag.id}`} className="font-semibold text-gray-700">Findings:</label>
                      <textarea
                        id={`diag-findings-${diag.id}`}
                        className="w-full border rounded p-2 mt-1"
                        value={diag.findings || ''}
                        aria-label="Findings"
                        onChange={e => handleDiagnosticChange(i, 'findings', e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor={`diag-recommendations-${diag.id}`} className="font-semibold text-gray-700">Recommendations:</label>
                      <textarea
                        id={`diag-recommendations-${diag.id}`}
                        className="w-full border rounded p-2 mt-1"
                        value={diag.recommendations || ''}
                        aria-label="Recommendations"
                        onChange={e => handleDiagnosticChange(i, 'recommendations', e.target.value)}
                      />
                    </div>
                  </div>
                )) : <div className="text-gray-500 italic text-center py-4">No diagnostics found.</div>
              ) : (
                diagnostics.length > 0 ? diagnostics.map((diag, i) => (
                  <div key={diag.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getStatusIcon(diag.system_status)}</span>
                        <span className="font-semibold text-lg">{diag.system_status}</span>
                      </div>
                      <span className="text-sm text-gray-500">{diag.diagnostics_date}</span>
                    </div>
                    {diag.findings && (
                      <div className="mb-3">
                        <span className="font-semibold text-gray-700">Findings:</span>
                        <div className="mt-1 p-2 bg-gray-50 rounded text-sm">{diag.findings}</div>
                      </div>
                    )}
                    {diag.recommendations && (
                      <div>
                        <span className="font-semibold text-gray-700">Recommendations:</span>
                        <div className="mt-1 p-2 bg-blue-50 rounded text-sm">{diag.recommendations}</div>
                      </div>
                    )}
                  </div>
                )) : <div className="text-gray-500 italic text-center py-4">No diagnostics found.</div>
              )}
            </div>
          )}
        </div>

        {/* Maintenance Logs */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            🔧 Maintenance Tasks & Logs
          </h2>
          
          {loadingLogs ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading maintenance logs...</p>
            </div>
          ) : logsError ? (
            <div className="text-center py-8">
              <div className="text-red-500 text-4xl mb-3">⚠️</div>
              <p className="text-red-600 mb-2">Error loading maintenance logs</p>
              <p className="text-sm text-gray-500">{logsError}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {isEditing ? (
                editingLogs.length > 0 ? editingLogs.map((log, i) => (
                  <div key={log.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="flex items-center mt-1">
                          <input
                            type="checkbox"
                            checked={log.status === 'completed'}
                            onChange={e => handleLogChange(i, 'status', e.target.checked ? 'completed' : 'pending')}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`font-semibold text-lg ${log.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-800'}`}>{log.task_performed}</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getTaskStatusClass(log.status)}`}>{log.status === 'completed' ? '✅ Completed' : '⏳ Pending'}</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                            <div>
                              <span className="font-medium">Maintained By:</span>
                              <span className="ml-2">{log.maintained_by}</span>
                            </div>
                            <div>
                              <span className="font-medium">Status:</span>
                              <span className="ml-2">{log.status === 'completed' ? 'Completed' : 'Pending'}</span>
                            </div>
                            <div>
                              <span className="font-medium">Date:</span>
                              <span className="ml-2">{log.maintenance_date}</span>
                            </div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <span className="font-medium text-gray-700">Notes:</span>
                            <textarea
                              className="w-full border rounded p-2 mt-1"
                              value={log.notes || ''}
                              onChange={e => handleLogChange(i, 'notes', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )) : <div className="text-gray-500">No maintenance logs found.</div>
              ) : (
                logs.length > 0 ? logs.map((log, i) => (
                  <div key={log.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="flex items-center mt-1">
                          <input
                            type="checkbox"
                            checked={log.status === 'completed'}
                            disabled
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`font-semibold text-lg ${log.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-800'}`}>{log.task_performed}</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getTaskStatusClass(log.status)}`}>{log.status === 'completed' ? '✅ Completed' : '⏳ Pending'}</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                            <div>
                              <span className="font-medium">Maintained By:</span>
                              <span className="ml-2">{log.maintained_by}</span>
                            </div>
                            <div>
                              <span className="font-medium">Status:</span>
                              <span className="ml-2">{log.status === 'completed' ? 'Completed' : 'Pending'}</span>
                            </div>
                            <div>
                              <span className="font-medium">Date:</span>
                              <span className="ml-2">{log.maintenance_date}</span>
                            </div>
                          </div>
                          {log.notes && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <span className="font-medium text-gray-700">Notes:</span>
                              <div className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">
                                {log.notes}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )) : <div className="text-gray-500">No maintenance logs found.</div>
              )}
            </div>
          )}
        </div>
      </div>
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