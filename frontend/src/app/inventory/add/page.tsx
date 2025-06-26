"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Webcam from "react-webcam";
import axios from "axios";
import { getApiUrl, getImageUrl } from "../../../config/api";
import { Camera, Upload, X, Check, Plus, Trash2, ArrowRight, ArrowLeft, Info, Settings, CheckCircle } from "lucide-react";
import styles from './page.module.css';

interface MaintenanceTask {
  id: string;
  task: string;
  completed: boolean;
  notes: string;
}

interface Diagnostic {
  system_status: string;
  findings: string;
  recommendations: string;
}

export default function AddItemPage() {
  const [form, setForm] = useState({
    property_no: "",
    article_type: "",
    location: "",
    end_user: "",
    date_acquired: "",
    price: "",
    supply_officer: "",
    specifications: "",
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [capturedImage, setCapturedImage] = useState<string>("");
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string>("");
  const [cameraLoading, setCameraLoading] = useState(false);
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>([
    { id: '1', task: 'Antivirus Check', completed: false, notes: '' },
    { id: '2', task: 'Uninstalled Programs', completed: false, notes: '' },
    { id: '3', task: 'Software Updates', completed: false, notes: '' },
    { id: '4', task: 'Hardware Failures', completed: false, notes: '' },
  ]);
  const [customTask, setCustomTask] = useState("");
  const [diagnostic, setDiagnostic] = useState<Diagnostic>({
    system_status: 'Good',
    findings: '',
    recommendations: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<'details' | 'maintenance' | 'diagnostics'>('details');
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const webcamRef = useRef<Webcam>(null);

  // Check for QR code parameter and auto-fill property_no
  useEffect(() => {
    const qrCode = searchParams.get('qr');
    if (qrCode) {
      setForm(prev => ({ ...prev, property_no: qrCode }));
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError("Please select a valid image file");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image file size must be less than 5MB");
        return;
      }
      
      setImageFile(file);
      setCapturedImage(""); // Clear captured image when uploading
      setError(""); // Clear any previous errors
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const capturePhoto = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCapturedImage(imageSrc);
        setImageFile(null); // Clear uploaded file when capturing
        setImagePreview(""); // Clear uploaded preview
        setShowCamera(false);
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage("");
    setShowCamera(true);
    setCameraError("");
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    setCapturedImage("");
    setCameraError("");
  };

  const handleCameraError = (error: string) => {
    setCameraError(error);
    setCameraLoading(false);
    console.error('Camera error:', error);
  };

  const handleCameraStart = () => {
    setCameraError("");
    setCameraLoading(true);
    setShowCamera(true);
  };

  const handleCameraReady = () => {
    setCameraLoading(false);
  };

  const handleMaintenanceTaskChange = (id: string, field: keyof MaintenanceTask, value: string | boolean) => {
    setMaintenanceTasks(prev => 
      prev.map(task => 
        task.id === id ? { ...task, [field]: value } : task
      )
    );
  };

  const addCustomTask = () => {
    if (customTask.trim()) {
      const newTask: MaintenanceTask = {
        id: Date.now().toString(),
        task: customTask.trim(),
        completed: false,
        notes: ''
      };
      setMaintenanceTasks(prev => [...prev, newTask]);
      setCustomTask("");
    }
  };

  const removeTask = (id: string) => {
    setMaintenanceTasks(prev => prev.filter(task => task.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      // Validate required fields
      if (!form.property_no.trim()) {
        setError("Property No. is required");
        setLoading(false);
        return;
      }

      if (!form.article_type) {
        setError("Article Type is required");
        setLoading(false);
        return;
      }

      // Validate maintenance tasks
      if (maintenanceTasks.length === 0) {
        setError("Please add at least one maintenance task");
        setLoading(false);
        return;
      }

      // Validate that all tasks have required fields
      const invalidTasks = maintenanceTasks.filter(task => !task.task.trim());
      if (invalidTasks.length > 0) {
        setError("All maintenance tasks must have a task description");
        setLoading(false);
        return;
      }

      // Validate diagnostic data
      if (!diagnostic.system_status) {
        setError("System status is required");
        setLoading(false);
        return;
      }

      // Debug: Log maintenance tasks before sending
      console.log('Maintenance tasks before submission:', maintenanceTasks);
      console.log('Maintenance tasks JSON:', JSON.stringify(maintenanceTasks));
      console.log('Diagnostic data:', diagnostic);

      // Create FormData for image upload
      const formData = new FormData();
      
      // Add item data (only the fields that belong in items table)
      Object.entries(form).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, value);
        }
      });

      // Add image if selected (either uploaded or captured)
      if (imageFile) {
        formData.append('image', imageFile);
      } else if (capturedImage) {
        // Convert captured image to file
        const base64Data = capturedImage.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/png' });
        const capturedFile = new File([blob], `captured-${Date.now()}.png`, { type: 'image/png' });
        formData.append('image', capturedFile);
      }

      // Add maintenance data with automatic date and user info
      const maintenanceDate = new Date().toISOString().split('T')[0];
      formData.append('maintenance_date', maintenanceDate);
      formData.append('maintenance_tasks', JSON.stringify(maintenanceTasks));
      formData.append('diagnostic', JSON.stringify(diagnostic));

      // Debug: Log FormData contents
      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await axios.post(getApiUrl("/items"), formData, {
        headers: { 
          Authorization: token,
          'Content-Type': 'multipart/form-data'
        },
      });

      console.log('Item created successfully:', response.data);
      
      // Show success message with details
      const successMessage = `Item created successfully! 
        - Item ID: ${response.data.id}
        - Maintenance logs: ${response.data.maintenance_logs_created || 0}
        - Diagnostic: ${response.data.diagnostic_created ? 'Yes' : 'No'}`;
      
      alert(successMessage);
      router.push(`/inventory/${response.data.id}`);
    } catch (err: any) {
      console.error('Error creating item:', err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || "Error adding item";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (confirm("Are you sure you want to cancel? All entered data will be lost.")) {
      router.push("/inventory");
    }
  };

  const TabButton = ({ tab, label, icon: Icon, isActive, className }: { tab: string; label: string; icon: any; isActive: boolean; className: string }) => (
    <button
      type="button"
      onClick={() => setActiveTab(tab as any)}
      className={`${className}`}
    >
      <Icon size={18} />
      {label}
    </button>
  );

  const completedTasks = maintenanceTasks.filter(task => task.completed).length;
  const completionPercentage = maintenanceTasks.length > 0 ? Math.round((completedTasks / maintenanceTasks.length) * 100) : 0;

  const previewSrc = getImageUrl(imagePreview || capturedImage);

  return (
    <div className={styles.container}>
      {/* Header Card */}
      <div className={styles.headerCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
          <div>
            <h1 className={styles.headerTitle}>Add New Item</h1>
            <p className={styles.headerSubtitle}>Register a new item in the inventory system</p>
          </div>
          <button
            onClick={handleCancel}
            className={styles.cancelBtnHeader}
          >
            <X size={18} />
            Cancel
          </button>
        </div>
      </div>

      {/* Main Content Card */}
      <div className={styles.mainCard}>
        {/* Tab Navigation */}
        <div className={styles.tabNav}>
          <TabButton 
            tab="details" 
            label="Item Details" 
            icon={Info} 
            isActive={activeTab === 'details'} 
            className={activeTab === 'details' ? styles.tabBtnActive : styles.tabBtn}
          />
          <TabButton 
            tab="maintenance" 
            label="Maintenance Tasks" 
            icon={Settings} 
            isActive={activeTab === 'maintenance'} 
            className={activeTab === 'maintenance' ? styles.tabBtnActive : styles.tabBtn}
          />
          <TabButton 
            tab="diagnostics" 
            label="System Diagnostics" 
            icon={CheckCircle} 
            isActive={activeTab === 'diagnostics'} 
            className={activeTab === 'diagnostics' ? styles.tabBtnActive : styles.tabBtn}
          />
        </div>

        {/* Main Form Content */}
        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
              <div className="flex items-center">
                <X className="text-red-500 mr-3" size={20} />
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Camera/Capture UI Placeholder */}
          {showCamera && (
            <div className="mb-8 p-6 bg-gray-100 rounded-xl flex flex-col items-center justify-center">
              <p className="mb-4 text-gray-700">[Camera capture UI goes here]</p>
              <button type="button" onClick={() => setShowCamera(false)} className="bg-red-500 text-white px-4 py-2 rounded-lg">Close Camera</button>
            </div>
          )}

          {/* Item Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-8">
              <div className={styles.formGrid}>
                <div>
                  <label className={styles.label}>Property No. *</label>
                  <input
                    type="text"
                    name="property_no"
                    className={styles.input}
                    value={form.property_no}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div>
                  <label className={styles.label}>Article Type *</label>
                  <select
                    name="article_type"
                    className={styles.select}
                    value={form.article_type}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Article Type</option>
                    <option value="Desktop Computer">Desktop Computer</option>
                    <option value="Laptop">Laptop</option>
                    <option value="Monitor">Monitor</option>
                    <option value="Printer">Printer</option>
                    <option value="Scanner">Scanner</option>
                    <option value="Network Equipment">Network Equipment</option>
                    <option value="Server">Server</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className={styles.label}>Date Acquired</label>
                  <input
                    type="date"
                    name="date_acquired"
                    className={styles.input}
                    value={form.date_acquired}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className={styles.label}>Price (₱)</label>
                  <input
                    type="number"
                    name="price"
                    step="0.01"
                    className={styles.input}
                    value={form.price}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className={styles.label}>End User</label>
                  <input
                    type="text"
                    name="end_user"
                    className={styles.input}
                    value={form.end_user}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className={styles.label}>Location</label>
                  <input
                    type="text"
                    name="location"
                    className={styles.input}
                    value={form.location}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className={styles.label}>Supply Officer</label>
                  <input
                    type="text"
                    name="supply_officer"
                    className={styles.input}
                    value={form.supply_officer}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className={styles.specsLabel}>Specifications</label>
                <textarea
                  name="specifications"
                  rows={4}
                  placeholder="CPU, RAM, Storage, OS, etc."
                  className={styles.textarea}
                  value={form.specifications}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className={styles.itemPictureLabel}>Item Picture</label>
                <div className={styles.imageUpload}>
                  <div className={styles.imageUploadIcon}>
                    <Camera size={40} />
                  </div>
                  <div className={styles.imageUploadTitle}>Add Item Picture</div>
                  <div className={styles.imageUploadDesc}>Capture or upload an image to help identify this item</div>
                  <div className={styles.imageUploadActions}>
                    <label className={styles.uploadLabel}>
                      <Upload size={18} style={{marginRight: 6}} />
                      Upload Image
                      <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
                    </label>
                    <button type="button" className={styles.takePhotoBtn} onClick={handleCameraStart}>
                      <Camera size={18} style={{marginRight: 6}} />
                      Capture Photo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Maintenance Tasks Tab */}
          {activeTab === 'maintenance' && (
            <div className="space-y-8">
              {/* Info Card */}
              <div style={{ background: '#e8f0fe', borderRadius: 16, padding: 24, display: 'flex', alignItems: 'center', gap: 16, border: '1.5px solid #b6d0fe', color: '#264072', fontWeight: 600, fontSize: 18, boxShadow: '0 1px 4px rgba(38,64,114,0.04)' }}>
                <Info size={24} style={{ color: '#264072', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 18 }}>Maintenance Information</div>
                  <div style={{ fontWeight: 400, fontSize: 15, color: '#264072', marginTop: 2 }}>
                    Maintenance date and maintainer will be automatically set to today's date and your user account.
                  </div>
                </div>
              </div>

              {/* Progress Card */}
              <div style={{ background: '#e6fbe8', borderRadius: 16, padding: 24, border: '1.5px solid #a7f3d0', boxShadow: '0 1px 4px rgba(16,185,129,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 20, color: '#166534' }}>Progress Overview</div>
                  <div style={{ fontWeight: 400, fontSize: 15, color: '#166534', marginTop: 2 }}>{completedTasks} of {maintenanceTasks.length} tasks completed</div>
                  <div style={{ marginTop: 16, width: 320, maxWidth: '100%' }}>
                    <div style={{ background: '#fff', borderRadius: 8, height: 10, width: '100%', overflow: 'hidden', boxShadow: '0 1px 2px rgba(16,185,129,0.06)' }}>
                      <div style={{ background: '#22c55e', height: '100%', width: `${completionPercentage}%`, borderRadius: 8, transition: 'width 0.3s' }} />
                    </div>
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 32, color: '#22c55e', minWidth: 80, textAlign: 'right' }}>{completionPercentage}%</div>
              </div>

              {/* Checklist Title */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 22, color: '#222b3a', marginBottom: 8 }}>
                <Settings size={22} style={{ color: '#222b3a' }} />
                Maintenance Tasks Checklist
              </div>

              {/* Checklist Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {maintenanceTasks.map((task, idx) => (
                  <div key={task.id} style={{ background: task.completed ? '#e6fbe8' : '#fff', border: `1.5px solid ${task.completed ? '#a7f3d0' : '#e5e7eb'}`, borderRadius: 16, boxShadow: '0 1px 4px rgba(16,185,129,0.04)', padding: 18, marginBottom: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f3f4f6', color: '#222b3a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16 }}>{idx + 1}</div>
                        <span style={{ fontWeight: 700, fontSize: 18, color: task.completed ? '#166534' : '#222b3a', textDecoration: task.completed ? 'line-through' : 'none' }}>{task.task}</span>
                        {task.completed && (
                          <span style={{ display: 'flex', alignItems: 'center', background: '#bbf7d0', color: '#16a34a', borderRadius: 12, fontWeight: 600, fontSize: 13, padding: '2px 10px', marginLeft: 6 }}>
                            <Check size={16} style={{ marginRight: 4 }} /> Completed
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={e => handleMaintenanceTaskChange(task.id, 'completed', e.target.checked)}
                          style={{ width: 22, height: 22, accentColor: '#22c55e', borderRadius: 6, border: '2px solid #a7f3d0', background: '#fff' }}
                        />
                        <button type="button" onClick={() => removeTask(task.id)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: 0 }}>
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                    <textarea
                      placeholder="Add notes for this task..."
                      value={task.notes}
                      onChange={e => handleMaintenanceTaskChange(task.id, 'notes', e.target.value)}
                      className={styles.notesInput}
                      rows={2}
                      style={{ width: '100%', minHeight: 38, borderRadius: 10, border: '1.5px solid #cbd5e1', fontSize: 15, marginTop: 0, marginBottom: 0, background: '#f8fafc', color: '#222', padding: 10, fontFamily: 'Poppins, sans-serif', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}
                    />
                  </div>
                ))}
              </div>

              {/* Add Custom Task */}
              <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                <input
                  type="text"
                  placeholder="Add custom task..."
                  value={customTask}
                  onChange={e => setCustomTask(e.target.value)}
                  style={{ flex: 1, borderRadius: 10, border: '1.5px solid #cbd5e1', fontSize: 15, padding: 12, fontFamily: 'Poppins, sans-serif', background: '#fff', color: '#222', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}
                />
                <button
                  type="button"
                  onClick={addCustomTask}
                  style={{ background: 'linear-gradient(90deg, #d32d23 0%, #c02425 100%)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15, padding: '0 22px', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 2px 8px rgba(211,45,35,0.10)', cursor: 'pointer' }}
                >
                  <Plus size={18} /> Add Task
                </button>
              </div>
            </div>
          )}

          {/* System Diagnostics Tab */}
          {activeTab === 'diagnostics' && (
            <div className="space-y-8">
              <div>
                <label className={styles.label}>System Status</label>
                <div className="relative">
                  <select
                    className={styles.select}
                    value={diagnostic.system_status}
                    onChange={(e) => setDiagnostic(prev => ({ ...prev, system_status: e.target.value }))}
                  >
                    <option value="Good">✅ Good</option>
                    <option value="Fair">⚠️ Fair</option>
                    <option value="Poor">❌ Poor</option>
                    <option value="Critical">�� Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={styles.label}>Findings</label>
                <textarea
                  rows={4}
                  placeholder="Describe any issues or observations..."
                  className={styles.textarea}
                  value={diagnostic.findings}
                  onChange={(e) => setDiagnostic(prev => ({ ...prev, findings: e.target.value }))}
                />
              </div>

              <div>
                <label className={styles.label}>Recommendations</label>
                <textarea
                  rows={4}
                  placeholder="Suggest actions or improvements..."
                  className={styles.textarea}
                  value={diagnostic.recommendations}
                  onChange={(e) => setDiagnostic(prev => ({ ...prev, recommendations: e.target.value }))}
                />
              </div>
            </div>
          )}

          {/* Navigation Footer */}
          <div className={styles.footerNav}>
            <div className="flex gap-3">
              {activeTab === 'maintenance' && (
                <button
                  type="button"
                  onClick={() => setActiveTab('details')}
                  className={styles.backBtn}
                >
                  <ArrowLeft size={18} />
                  Back to Details
                </button>
              )}
              {activeTab === 'diagnostics' && (
                <button
                  type="button"
                  onClick={() => setActiveTab('maintenance')}
                  className={styles.backBtn}
                >
                  <ArrowLeft size={18} />
                  Back to Maintenance
                </button>
              )}
            </div>

            <div className="flex gap-3">
              {activeTab === 'details' && (
                <button
                  type="button"
                  onClick={() => setActiveTab('maintenance')}
                  className={styles.nextBtn}
                >
                  Next: Maintenance
                  <ArrowRight size={18} />
                </button>
              )}
              {activeTab === 'maintenance' && (
                <button
                  type="button"
                  onClick={() => setActiveTab('diagnostics')}
                  className={styles.nextBtn}
                >
                  Next: Diagnostics
                  <ArrowRight size={18} />
                </button>
              )}
              {activeTab === 'diagnostics' && (
                <button
                  type="submit"
                  disabled={loading}
                  className={styles.submitBtn}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      Save Item
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 