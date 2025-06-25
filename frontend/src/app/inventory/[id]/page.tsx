"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { getApiUrl, getImageUrl } from "../../../config/api";
import imageCompression from 'browser-image-compression';
import styles from "./page.module.css";
import { FaEdit, FaSave, FaTrash, FaTimes, FaClipboardList, FaStethoscope, FaInfoCircle, FaCog, FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaHeartbeat, FaClock, FaRegSquare, FaRegCheckSquare } from "react-icons/fa";


// Helper to format date for <input type="date">
function formatDateForInput(dateString: string) {
  if (!dateString) return "";
  return dateString.split("T")[0];
}


function formatDisplayDate(dateString: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
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
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [activeTab, setActiveTab] = useState<'diagnostics' | 'logs'>('diagnostics');
  const [diagnosticsFilter, setDiagnosticsFilter] = useState('all');


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
      case 'Good': return <FaCheckCircle className={styles.statusIcon} style={{color:'#22c55e'}} title="Good"/>;
      case 'Fair': return <FaExclamationTriangle className={styles.statusIcon} style={{color:'#f59e42'}} title="Fair"/>;
      case 'Poor': return <FaTimesCircle className={styles.statusIcon} style={{color:'#ef4444'}} title="Poor"/>;
      case 'Critical': return <FaHeartbeat className={styles.statusIcon} style={{color:'#c1121f'}} title="Critical"/>;
      default: return <FaClock className={styles.statusIcon} style={{color:'#888'}} title="Unknown"/>;
    }
  };


  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <FaCheckCircle className={styles.taskIcon} style={{color:'#22c55e'}} title="Completed"/>;
      case 'pending': return <FaClock className={styles.taskIcon} style={{color:'#f59e42'}} title="Pending"/>;
      default: return <FaClock className={styles.taskIcon} style={{color:'#888'}} title="Unknown"/>;
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


  // Use editingDiagnostics/logs in edit mode, diagnostics/logs in view mode
  const diagnosticsToShow = isEditing ? editingDiagnostics : diagnostics;
  const logsToShow = isEditing ? editingLogs : logs;


  // Diagnostics filter logic
  const filteredDiagnostics = diagnosticsToShow.filter(d =>
    diagnosticsFilter === 'all' ? true : d.system_status === diagnosticsFilter
  );


  // Checklist for logs
  const checklist = logsToShow.map((log, i) => ({
    ...log,
    completed: log.status === 'completed',
  }));


  const handleImageButtonClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };


  // Checklist toggle logic (checkbox only)
  const handleChecklistToggle = (i: number) => {
    if (!isEditing) return;
    setEditingLogs(prev => prev.map((log, idx) => idx === i ? { ...log, status: log.status === 'completed' ? 'pending' : 'completed' } : log));
  };


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
    <div className={styles.detailContainer}>
      {/* Top Section */}
      <div className={styles.topCard}>
        <div className={styles.topImageBox} style={{position:'relative'}}>
          {item.image_url || (isEditing && editingItem.image_url) ? (
            <img src={isEditing ? getImageUrl(editingItem.image_url) : getImageUrl(item.image_url)} alt="item" className={styles.topImage} />
          ) : (
            isEditing ? null : <span>image</span>
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
              <button className={styles.changeImageBtn} onClick={handleImageButtonClick} disabled={uploadingImage} style={{position:'absolute',bottom:12,left:'50%',transform:'translateX(-50%)',zIndex:2}}>
                {uploadingImage ? 'Uploading...' : 'Change Image'}
              </button>
            </>
          )}
        </div>
        <div className={styles.topMain}>
          <div className={styles.centeredTitle}>{(isEditing ? editingItem.property_no : item.property_no)?.toUpperCase()}</div>
          <div className={styles.centeredSubtitle}>{isEditing ? editingItem.article_type : item.article_type}</div>
          <div className={styles.topButtonRow}>
            {!isEditing ? (
              <>
                <button className={styles.editBtn} onClick={handleEdit}><FaEdit style={{marginRight: 8}}/>Edit</button>
                <button className={styles.deleteBtn} onClick={handleDelete} disabled={deleting}><FaTrash style={{marginRight: 8}}/>{deleting ? 'Deleting...' : 'Delete'}</button>
              </>
            ) : (
              <>
                <button className={styles.saveBtn} onClick={async () => {
                  setSaving(true);
                  setError("");
                  const token = localStorage.getItem("token");
                  try {
                    await axios.put(getApiUrl(`/items/${id}`), editingItem, {
                      headers: { Authorization: token },
                    });
                    await Promise.all(editingDiagnostics.map(diag =>
                      axios.put(getApiUrl(`/diagnostics/${diag.id}`), {
                        item_id: diag.item_id,
                        diagnostics_date: diag.diagnostics_date,
                        system_status: diag.system_status,
                        findings: diag.findings,
                        recommendations: diag.recommendations,
                      }, { headers: { Authorization: token } })
                    ));
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
                  } catch (err) {
                    setError("Error updating item. Please try again.");
                  } finally {
                    setSaving(false);
                  }
                }} disabled={saving}><FaSave style={{marginRight: 8}}/>{saving ? 'Saving...' : 'Save'}</button>
                <button className={styles.cancelBtn} onClick={handleCancel}><FaTimes style={{marginRight: 8}}/>Cancel</button>
              </>
            )}
          </div>
                </div>
              </div>
      {/* Middle Section: General Info & Specifications */}
      <div className={styles.middleSection}>
        <div className={styles.infoCard}>
          <div className={styles.blueHeader}><FaInfoCircle style={{marginRight: 8}}/>GENERAL INFO</div>
          <div className={styles.cardContent}>
            {isEditing ? (
              <>
                <div className={styles.grayRect} style={{marginBottom:'18px'}}><span>Location:</span><input value={editingItem.location || ''} onChange={e => handleInputChange('location', e.target.value)} /></div>
                <div className={styles.grayRect} style={{marginBottom:'18px'}}><span>End User:</span><input value={editingItem.end_user || ''} onChange={e => handleInputChange('end_user', e.target.value)} /></div>
                <div className={styles.grayRect} style={{marginBottom:'18px'}}><span>Date Acquired:</span><input type="date" value={formatDateForInput(editingItem.date_acquired)} onChange={e => handleInputChange('date_acquired', e.target.value)} /></div>
                <div className={styles.grayRect} style={{marginBottom:'18px'}}><span>Price:</span><input type="number" value={editingItem.price || ''} onChange={e => handleInputChange('price', e.target.value)} /></div>
                <div className={styles.grayRect} style={{marginBottom:'18px'}}><span>Supply Officer:</span><input value={editingItem.supply_officer || ''} onChange={e => handleInputChange('supply_officer', e.target.value)} /></div>
                <div className={styles.grayRect} style={{marginBottom:'18px'}}><span>Company:</span><input value={editingItem.company_name || ''} onChange={e => handleInputChange('company_name', e.target.value)} /></div>
                <div className={styles.grayRect} style={{marginBottom:'18px'}}><span>Maintenance Status:</span><input value={editingItem.maintenance_status || ''} onChange={e => handleInputChange('maintenance_status', e.target.value)} /></div>
                <div className={styles.grayRect} style={{marginBottom:'18px'}}><span>Pending Tasks:</span><input value={editingItem.pending_maintenance_count || ''} onChange={e => handleInputChange('pending_maintenance_count', e.target.value)} /></div>
              </>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:'20px',alignItems:'flex-start'}}>
                <div style={{display:'flex',justifyContent:'space-between',width:'100%'}}><span>Property No:</span> <b style={{fontWeight:700,textAlign:'right',minWidth:120,display:'inline-block'}}>{item.property_no}</b></div>
                <div style={{display:'flex',justifyContent:'space-between',width:'100%'}}><span>Article Type:</span> <b style={{fontWeight:700,textAlign:'right',minWidth:120,display:'inline-block'}}>{item.article_type}</b></div>
                <div style={{display:'flex',justifyContent:'space-between',width:'100%'}}><span>Location:</span> <b style={{fontWeight:700,textAlign:'right',minWidth:120,display:'inline-block'}}>{item.location || 'N/A'}</b></div>
                <div style={{display:'flex',justifyContent:'space-between',width:'100%'}}><span>End User:</span> <b style={{fontWeight:700,textAlign:'right',minWidth:120,display:'inline-block'}}>{item.end_user || 'N/A'}</b></div>
                <div style={{display:'flex',justifyContent:'space-between',width:'100%'}}><span>Date Acquired:</span> <b style={{fontWeight:700,textAlign:'right',minWidth:120,display:'inline-block'}}>{formatDisplayDate(item.date_acquired) || 'N/A'}</b></div>
                <div style={{display:'flex',justifyContent:'space-between',width:'100%'}}><span>Price:</span> <b style={{fontWeight:700,textAlign:'right',minWidth:120,display:'inline-block'}}>₱{item.price || 'N/A'}</b></div>
                <div style={{display:'flex',justifyContent:'space-between',width:'100%'}}><span>Supply Officer:</span> <b style={{fontWeight:700,textAlign:'right',minWidth:120,display:'inline-block'}}>{item.supply_officer || 'N/A'}</b></div>
                <div style={{display:'flex',justifyContent:'space-between',width:'100%'}}><span>Company:</span> <b style={{fontWeight:700,textAlign:'right',minWidth:120,display:'inline-block'}}>{item.company_name || 'N/A'}</b></div>
                <div style={{display:'flex',justifyContent:'space-between',width:'100%'}}><span>Maintenance Status:</span> <b style={{fontWeight:700,textAlign:'right',minWidth:120,display:'inline-block'}}>{item.maintenance_status === 'pending' ? <span style={{color:'#f59e42',marginLeft:4}}>&#9888; Pending</span> : <span style={{color:'#22c55e',marginLeft:4}}>&#10003; Up to Date</span>}</b></div>
                <div style={{display:'flex',justifyContent:'space-between',width:'100%'}}><span>Pending Tasks:</span> <b style={{fontWeight:700,textAlign:'right',minWidth:120,display:'inline-block'}}>{item.pending_maintenance_count > 0 ? <span style={{color:'#f59e42',marginLeft:4}}>&#9888; {item.pending_maintenance_count} task{item.pending_maintenance_count > 1 ? 's' : ''}</span> : <span style={{color:'#22c55e',marginLeft:4}}>&#10003; None</span>}</b></div>
              </div>
            )}
                </div>
              </div>
        <div className={styles.infoCard}>
          <div className={styles.blueHeader}><FaCog style={{marginRight: 8}}/>SPECIFICATIONS</div>
          <div className={styles.cardContent}>
            {isEditing ? (
              <div className={styles.grayRect}><textarea value={editingItem.specifications || ''} onChange={e => handleInputChange('specifications', e.target.value)} className={styles.specInput} /></div>
          ) : (
              <div style={{fontWeight:700,color:'#222',whiteSpace:'pre-wrap'}}>{item.specifications || <span style={{color: '#888'}}>No specifications</span>}</div>
                )}
              </div>
                  </div>
                </div>
      {/* Bottom Section: Diagnostics & Logs as Tabs */}
      <div className={styles.bottomSection}>
        <div className={styles.tabBar}>
          <button className={activeTab === 'diagnostics' ? styles.tabBtnActive : styles.tabBtn} onClick={() => setActiveTab('diagnostics')}><FaStethoscope style={{marginRight: 8}}/>Diagnostics</button>
          <button className={activeTab === 'logs' ? styles.tabBtnActive : styles.tabBtn} onClick={() => setActiveTab('logs')}><FaClipboardList style={{marginRight: 8}}/>Logs</button>
        </div>
        <div className={styles.tabsContent}>
          {activeTab === 'diagnostics' && (
            <>
              <div className={styles.solidBlueHeader}><FaStethoscope style={{marginRight: 8}}/>System Diagnostics</div>
              {loadingDiagnostics ? (
                <div>Loading diagnostics...</div>
              ) : diagnosticsError ? (
                <div className="text-red-600">{diagnosticsError}</div>
              ) : filteredDiagnostics.length > 0 ? filteredDiagnostics.map((diag, i) => (
                isEditing ? (
                  <div key={diag.id} className={styles.diagnosticEditBox}>
                    <div className={styles.diagnosticEditHeader}>
                      {getStatusIcon(diag.system_status)}
                      <select value={diag.system_status} onChange={e => handleDiagnosticChange(i, 'system_status', e.target.value)} className={styles.editHighlight + ' ' + styles.diagnosticEditStatus}>
                        <option value="Good">Good</option>
                        <option value="Fair">Fair</option>
                        <option value="Poor">Poor</option>
                        <option value="Critical">Critical</option>
                      </select>
                      <span className={styles.diagnosticEditStatus}>{diag.system_status}</span>
                      <span className={styles.diagnosticEditDate}>{formatDisplayDate(diag.diagnostics_date)}</span>
                      <span className={styles.diagnosticEditLabel}>Select the current system status.</span>
                    </div>
                    <div style={{marginTop:8}}>
                      <span>Findings:</span>
                      <input value={diag.findings || ''} onChange={e => handleDiagnosticChange(i, 'findings', e.target.value)} className={styles.editHighlight} />
                    </div>
                    <div style={{marginTop:8}}>
                      <span>Recommendations:</span>
                      <input value={diag.recommendations || ''} onChange={e => handleDiagnosticChange(i, 'recommendations', e.target.value)} className={styles.editHighlight} />
                    </div>
                  </div>
                ) : (
                  <div style={{
                    borderRadius:'16px',
                    background:'#eaf0ff',
                    padding:'18px 20px',
                    marginTop:24,
                    boxShadow:'0 2px 8px #0001',
                    maxWidth:700,
                    border:'2px solid #e0e7ef',
                    transition:'box-shadow 0.2s, border 0.2s',
                    cursor:'pointer'
                  }}
                    onMouseOver={e=>{e.currentTarget.style.boxShadow='0 4px 16px #182c4c22';e.currentTarget.style.border='2px solid #182c4c'}}
                    onMouseOut={e=>{e.currentTarget.style.boxShadow='0 2px 8px #0001';e.currentTarget.style.border='2px solid #e0e7ef'}}
                  >
                    <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
                      {diag.system_status === 'Good' ? (
                        <span style={{color:'#22c55e',fontSize:22}}>&#10003;</span>
                      ) : (
                        <span style={{color:'#f59e42',fontSize:22}}>&#9888;</span>
                      )}
                      <span style={{fontWeight:700,fontSize:18}}>{diag.system_status}</span>
                      <span style={{marginLeft:16,color:'#888',fontWeight:500}}>{formatDisplayDate(diag.diagnostics_date)}</span>
                      <span style={{marginLeft:16,color:'#aaa',fontSize:15}}>Select the current system status.</span>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}>
                      <span style={{fontWeight:500}}>Findings:</span>
                      <span style={{background:'#fff',border:'1.5px solid #bbb',borderRadius:7,padding:'2px 12px',fontWeight:500}}>{diag.findings}</span>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:12}}>
                      <span style={{fontWeight:500}}>Recommendations:</span>
                      <span style={{background:'#fff',border:'1.5px solid #bbb',borderRadius:7,padding:'2px 12px',fontWeight:500}}>{diag.recommendations}</span>
                    </div>
                  </div>
                )
              )) : <div style={{color: '#888'}}>No diagnostics found.</div>}
            </>
          )}
          {activeTab === 'logs' && (
            <>
              <div className={styles.solidBlueHeaderLogs} style={{textAlign:'center'}}><FaClipboardList style={{marginRight: 8}}/>Maintenance Tasks & Logs</div>
              <div className={styles.checklist}>
                {checklist.length > 0 ? checklist.map((log, i) => (
                  <div key={log.id} className={styles.checklistItem + ' ' + (log.completed ? 'completed' : 'pending') + (isEditing ? ' ' + styles.editable : '')} style={{flexDirection:'column',alignItems:'flex-start',marginBottom:16}}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      {isEditing ? (
                        <input
                          type="checkbox"
                          checked={log.completed}
                          onChange={() => handleChecklistToggle(i)}
                          style={{width:18,height:18,cursor:'pointer'}}
                        />
                      ) : (
                        log.completed ? <FaRegCheckSquare style={{color:'#22c55e'}}/> : <FaRegSquare style={{color:'#f59e42'}}/>
                      )}
                      {getTaskStatusIcon(log.status)}
                      <span style={{fontWeight:600,textDecoration:log.completed?'line-through':'none'}}>{log.task_performed}</span>
                      <span style={{fontSize:12,color:'#888',marginLeft:8}}>{log.status === 'completed' ? 'Completed' : 'Pending'}</span>
                    </div>
                    <div style={{marginLeft:28}}>
                      <div>Maintained By: {log.maintained_by}</div>
                      <div>Status: {log.status.charAt(0).toUpperCase() + log.status.slice(1)}</div>
                      <div>Date: {formatDisplayDate(log.maintenance_date)}</div>
                      <div>
                        Notes: {isEditing ? (
                          <input value={log.notes || ''} onChange={e => handleLogChange(i, 'notes', e.target.value)} className={styles.editHighlight} />
                        ) : (
                          <span>{log.notes}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )) : <div style={{color: '#888'}}>No logs found.</div>}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

