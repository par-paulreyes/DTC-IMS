"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Webcam from "react-webcam";
import axios from "axios";
import { getApiUrl } from "../../../config/api";

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
      setImageFile(file);
      setCapturedImage(""); // Clear captured image when uploading
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
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    setCapturedImage("");
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
      formData.append('maintained_by', 'Current User'); // Will be set from backend
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

  const TabButton = ({ tab, label, icon }: { tab: string; label: string; icon: string }) => (
    <button
      type="button"
      onClick={() => setActiveTab(tab as any)}
      className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-colors duration-200 ${
        activeTab === tab
          ? 'bg-blue-600 text-white shadow-md'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      <span className="mr-2">{icon}</span>
      {label}
    </button>
  );

  return (
    <div className="min-h-screen pt-8 pb-20 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Add New Item</h1>
                <p className="text-blue-100 mt-2 text-lg">Register a new item in the inventory system</p>
              </div>
              <button
                onClick={handleCancel}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-colors duration-200 font-medium flex items-center gap-2 shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-3 p-6 bg-gray-50 border-b">
            <TabButton tab="details" label="Item Details" icon="📋" />
            <TabButton tab="maintenance" label="Maintenance Tasks" icon="🔧" />
            <TabButton tab="diagnostics" label="System Diagnostics" icon="💻" />
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {/* Item Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block mb-3 font-semibold text-gray-700">Property No. *</label>
          <input
            type="text"
            name="property_no"
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            value={form.property_no}
            onChange={handleChange}
            required
          />
        </div>
                  
                  <div>
                    <label className="block mb-3 font-semibold text-gray-700">Article Type *</label>
                    <select
            name="article_type"
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                    <label className="block mb-3 font-semibold text-gray-700">Date Acquired</label>
          <input
            type="date"
            name="date_acquired"
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            value={form.date_acquired}
            onChange={handleChange}
          />
        </div>

                  <div>
                    <label className="block mb-3 font-semibold text-gray-700">Price (₱)</label>
                    <input
                      type="number"
                      name="price"
                      step="0.01"
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      value={form.price}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block mb-3 font-semibold text-gray-700">End User</label>
          <input
            type="text"
            name="end_user"
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            value={form.end_user}
            onChange={handleChange}
          />
        </div>

                  <div>
                    <label className="block mb-3 font-semibold text-gray-700">Location</label>
          <input
            type="text"
            name="location"
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            value={form.location}
            onChange={handleChange}
          />
        </div>

                  <div>
                    <label className="block mb-3 font-semibold text-gray-700">Supply Officer</label>
          <input
            type="text"
            name="supply_officer"
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            value={form.supply_officer}
            onChange={handleChange}
          />
        </div>
                </div>

                <div>
                  <label className="block mb-3 font-semibold text-gray-700">Specifications</label>
                  <textarea
                    name="specifications"
                    rows={4}
                    placeholder="CPU, RAM, Storage, OS, etc."
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                    value={form.specifications}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block mb-4 font-semibold text-gray-700">Item Picture</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 bg-gray-50 hover:bg-gray-100 transition-colors">
                    {imagePreview || capturedImage ? (
                      <div className="space-y-6">
                        <div className="flex justify-center">
                          <img 
                            src={imagePreview || capturedImage} 
                            alt="Preview" 
                            className="w-80 h-80 max-w-[320px] max-h-[320px] object-cover rounded-lg shadow-lg border" 
                            style={{ width: 320, height: 320 }}
                          />
                        </div>
                        <div className="flex justify-center">
                          <button
                            type="button"
                            onClick={removeImage}
                            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-colors duration-200 font-medium flex items-center gap-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Remove Image
                          </button>
                        </div>
                      </div>
                    ) : showCamera ? (
                      <div className="space-y-6">
                        <div className="relative">
                          <div className="flex justify-center">
                            <div className="webcam-container relative rounded-lg overflow-hidden shadow-lg z-50">
                              <Webcam
                                ref={webcamRef}
                                screenshotFormat="image/png"
                                videoConstraints={{ facingMode: "environment" }}
                                className="w-80 h-80 max-w-[320px] max-h-[320px] object-cover"
                                style={{ width: 320, height: 320 }}
                              />
                              {/* Cancel button - top right corner */}
                              <div className="absolute top-4 right-4 z-50">
                                <button
                                  type="button"
                                  onClick={() => setShowCamera(false)}
                                  className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transition-colors duration-200"
                                >
                                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                              {/* Capture button overlay - positioned inside camera view */}
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
                                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 pointer-events-auto z-10">
                                  <button
                                    type="button"
                                    onClick={capturePhoto}
                                    className="bg-white p-4 rounded-full shadow-2xl hover:bg-gray-100 transition-all duration-200 hover:scale-110 border-4 border-white"
                                  >
                                    <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                      </svg>
                                    </div>
                                  </button>
                                </div>
                                {/* Camera frame overlay */}
                                <div className="absolute inset-4 border-2 border-white rounded-lg pointer-events-none opacity-50 z-5"></div>
                                {/* Capture instruction text */}
                                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 pointer-events-auto z-10">
                                  <div className="bg-black bg-opacity-70 text-white px-6 py-3 rounded-full text-base font-medium shadow-lg">
                                    📸 Tap the button above to capture
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center space-y-6">
                        <div className="flex justify-center gap-6">
                          <div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="hidden"
                              id="image-upload"
                            />
                            <label
                              htmlFor="image-upload"
                              className="cursor-pointer inline-flex items-center px-6 py-4 border-2 border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                            >
                              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                              Upload Image
                            </label>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowCamera(true)}
                            className="inline-flex items-center px-6 py-4 border-2 border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                          >
                            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Capture Photo
                          </button>
                        </div>
                        <p className="text-gray-500 text-lg">
                          Upload an image file or capture a photo using your camera
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Maintenance Tasks Tab */}
            {activeTab === 'maintenance' && (
              <div className="space-y-8">
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                  <h3 className="font-semibold text-blue-800 mb-3 text-lg flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Maintenance Information
                  </h3>
                  <p className="text-blue-700">
                    Maintenance date and maintainer will be automatically set to today's date and your user account.
                  </p>
                </div>

                {/* Maintenance Summary */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-green-800">Maintenance Summary</h4>
                      <p className="text-green-700 text-sm">
                        {maintenanceTasks.filter(task => task.completed).length} of {maintenanceTasks.length} tasks completed
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round((maintenanceTasks.filter(task => task.completed).length / maintenanceTasks.length) * 100)}%
                      </div>
                      <div className="text-xs text-green-600">Completion</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Maintenance Tasks Checklist
                  </h3>
                  <div className="space-y-4">
                    {maintenanceTasks.map((task) => (
                      <div key={task.id} className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={(e) => handleMaintenanceTaskChange(task.id, 'completed', e.target.checked)}
                              className="w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            />
                            <span className={`font-semibold text-lg ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                              {task.task}
                            </span>
                            {task.completed && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                                ✅ Completed
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeTask(task.id)}
                            className="text-red-600 hover:text-red-800 text-sm bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        <textarea
                          placeholder="Add notes for this task..."
                          value={task.notes}
                          onChange={(e) => handleMaintenanceTaskChange(task.id, 'notes', e.target.value)}
                          className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                          rows={3}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex gap-4">
                    <input
                      type="text"
                      placeholder="Add custom task..."
                      value={customTask}
                      onChange={(e) => setCustomTask(e.target.value)}
                      className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={addCustomTask}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 font-medium"
                    >
                      Add Task
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* System Diagnostics Tab */}
            {activeTab === 'diagnostics' && (
              <div className="space-y-8">
                <div>
                  <label className="block mb-3 font-semibold text-gray-700">System Status</label>
                  <div className="relative">
                    <select
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors z-10"
                      value={diagnostic.system_status}
                      onChange={(e) => setDiagnostic(prev => ({ ...prev, system_status: e.target.value }))}
                    >
                      <option value="Good">✅ Good</option>
                      <option value="Fair">⚠️ Fair</option>
                      <option value="Poor">❌ Poor</option>
                      <option value="Critical">🚨 Critical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-3 font-semibold text-gray-700">Findings</label>
                  <textarea
                    rows={4}
                    placeholder="Describe any issues or observations..."
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                    value={diagnostic.findings}
                    onChange={(e) => setDiagnostic(prev => ({ ...prev, findings: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block mb-3 font-semibold text-gray-700">Recommendations</label>
                  <textarea
                    rows={4}
                    placeholder="Suggest actions or improvements..."
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                    value={diagnostic.recommendations}
                    onChange={(e) => setDiagnostic(prev => ({ ...prev, recommendations: e.target.value }))}
                  />
                </div>
              </div>
            )}

            {/* Navigation and Submit */}
            <div className="flex justify-between items-center pt-8 border-t mt-8">
              <div className="flex gap-3">
                {activeTab === 'maintenance' && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('details')}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 font-medium flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Details
                  </button>
                )}
                {activeTab === 'diagnostics' && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('maintenance')}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 font-medium flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Maintenance
                  </button>
                )}
              </div>

              <div className="flex gap-3">
                {activeTab === 'details' && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('maintenance')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition-colors duration-200 font-medium flex items-center gap-2 shadow-lg"
                  >
                    Next: Maintenance
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
                {activeTab === 'maintenance' && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('diagnostics')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition-colors duration-200 font-medium flex items-center gap-2 shadow-lg"
                  >
                    Next: Diagnostics
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
                {activeTab === 'diagnostics' && (
        <button
          type="submit"
          disabled={loading}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg transition-colors duration-200 font-medium flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Save Item
                      </>
                    )}
        </button>
                )}
              </div>
            </div>
      </form>
        </div>
      </div>
    </div>
  );
} 