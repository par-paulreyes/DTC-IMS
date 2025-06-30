"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Webcam from "react-webcam";
import { apiClient, getImageUrl } from "../../config/api";
import imageCompression from 'browser-image-compression';
import { Camera, Upload, X } from "lucide-react";
import './profile.css';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string>("");
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imageCompressionInfo, setImageCompressionInfo] = useState<{originalSize: string, compressedSize: string, ratio: string} | null>(null);
  const [cameraError, setCameraError] = useState<string>("");
  const [cameraLoading, setCameraLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const webcamRef = useRef<Webcam>(null);
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

    apiClient.get("/users/profile")
      .then((response) => {
        setProfile(response.data);
        setForm({ ...response.data, password: "", confirmPassword: "" });
      })
      .catch((err) => setError("Error loading profile"))
      .finally(() => setLoading(false));
  }, [router, mounted]);

  // Cleanup object URLs when component unmounts or selectedImageFile changes
  useEffect(() => {
    return () => {
      if (selectedImageFile) {
        URL.revokeObjectURL(URL.createObjectURL(selectedImageFile));
      }
    };
  }, [selectedImageFile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError("");
    setSuccess("");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setForm({ ...profile, password: "", confirmPassword: "" });
    setError("");
    setSuccess("");
    // Clear any stored images
    setCapturedImage("");
    setSelectedImageFile(null);
    setImageCompressionInfo(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (form.password && form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setSaving(true);
    
    try {
      let profilePictureUrl = form.profile_picture;
      
      // Handle image upload if there's a captured image or selected file
      if (capturedImage || selectedImageFile) {
        setUploading(true);
        
        let fileToUpload: File;
        
        if (capturedImage) {
          // Convert captured image to file and compress it
          const response = await fetch(capturedImage);
          const blob = await response.blob();
          const originalFile = new File([blob], 'captured-profile.png', { type: 'image/png' });
          
          console.log('📸 Compressing captured image...', {
            originalSize: `${(originalFile.size / 1024 / 1024).toFixed(2)} MB`,
            originalType: originalFile.type
          });
          
          // Compress the captured image
          const compressionOptions = getCompressionOptions();
          fileToUpload = await imageCompression(originalFile, compressionOptions);
          
          console.log('✅ Captured image compressed successfully', {
            compressedSize: `${(fileToUpload.size / 1024 / 1024).toFixed(2)} MB`,
            compressionRatio: `${((1 - fileToUpload.size / originalFile.size) * 100).toFixed(1)}%`,
            compressedType: fileToUpload.type
          });
        } else {
          // Selected file is already compressed from handleProfilePicChange
          fileToUpload = selectedImageFile!;
        }
        
        // Additional compression check (in case selectedImageFile wasn't compressed)
        if (fileToUpload.size > 1024 * 1024) { // If still larger than 1MB
          console.log('🔄 Additional compression needed...', {
            currentSize: `${(fileToUpload.size / 1024 / 1024).toFixed(2)} MB`
          });
          
          const compressionOptions = getCompressionOptions();
          fileToUpload = await imageCompression(fileToUpload, compressionOptions);
          
          console.log('✅ Additional compression completed', {
            finalSize: `${(fileToUpload.size / 1024 / 1024).toFixed(2)} MB`
          });
        }
        
        const formData = new FormData();
        formData.append('profile_picture', fileToUpload, fileToUpload.name || 'profile.jpg');
        
        const uploadResponse = await apiClient.post("/users/profile-picture", formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        if (uploadResponse.data.url) {
          profilePictureUrl = uploadResponse.data.url;
        } else {
          throw new Error("Failed to upload profile picture");
        }
        
        setUploading(false);
      }
      
      // Prepare the data to send
      const dataToSend = form.password ? { ...form, password: form.password } : form;
      delete dataToSend.confirmPassword; // Remove confirmPassword from the request
      
      // Update profile picture URL if it was changed
      if (profilePictureUrl !== form.profile_picture) {
        dataToSend.profile_picture = profilePictureUrl;
      }
      
      console.log('📤 Sending profile update data:', dataToSend);
      
      const response = await apiClient.put("/users/profile", dataToSend);
      
      console.log('✅ Profile update successful:', response.data);
      setSuccess("Profile updated successfully!");
      setForm({ ...form, password: "", confirmPassword: "" });
      setIsEditing(false);
      
      // Clear image states
      setCapturedImage("");
      setSelectedImageFile(null);
      setImageCompressionInfo(null);
      
      // Refresh profile data
      const updatedResponse = await apiClient.get("/users/profile");
      setProfile(updatedResponse.data);
    } catch (err: any) {
      console.error('❌ Profile update failed:', err);
      setError(err.response?.data?.message || "Error updating profile");
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  // Handle profile picture selection (not upload)
  const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError("Please select a valid image file");
      return;
    }
    
    // Validate file size (max 10MB before compression)
    if (file.size > 10 * 1024 * 1024) {
      setError("Image file size must be less than 10MB");
      return;
    }

    try {
      // Compress the image for preview and storage
      const compressionOptions = getCompressionOptions();
      
      console.log('📸 Compressing image...', {
        originalSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        originalType: file.type
      });
      
      const compressedFile = await imageCompression(file, compressionOptions);
      
      console.log('✅ Image compressed successfully', {
        compressedSize: `${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`,
        compressionRatio: `${((1 - compressedFile.size / file.size) * 100).toFixed(1)}%`,
        compressedType: compressedFile.type
      });
      
      // Store compression info for UI display
      setImageCompressionInfo({
        originalSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        compressedSize: `${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`,
        ratio: `${((1 - compressedFile.size / file.size) * 100).toFixed(1)}%`
      });
      
      setSelectedImageFile(compressedFile);
      setCapturedImage(""); // Clear captured image when uploading
      setError(""); // Clear any previous errors
    } catch (err) {
      console.error('Image compression failed:', err);
      setError("Failed to process image. Please try again.");
    }
  };

  // Camera-related functions
  const capturePhoto = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCapturedImage(imageSrc);
        setShowCamera(false);
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage("");
    setShowCamera(true);
    setCameraError("");
  };

  const handleCameraError = (error: string) => {
    setCameraError(error);
    setCameraLoading(false);
    console.error('Camera error:', error);
  };

  const handleCameraReady = () => {
    setCameraLoading(false);
  };

  // Helper function for consistent image compression options
  const getCompressionOptions = () => ({
    maxSizeMB: 1, // Target max size in MB
    maxWidthOrHeight: 800, // Resize to max 800px width or height
    useWebWorker: true,
    fileType: 'image/jpeg', // Convert to JPEG for better compression
    quality: 0.8, // 80% quality for good balance
  });

  // Helper to get the correct image URL
  const imageUrl = getImageUrl(form.profile_picture);

  // Helper to get preview URL for selected or captured images
  const getPreviewUrl = () => {
    if (capturedImage) return capturedImage;
    if (selectedImageFile) return URL.createObjectURL(selectedImageFile);
    return null;
  };

  const previewUrl = getPreviewUrl();

  if (!mounted) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (mounted && loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (mounted && error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  if (mounted && !profile) return <div className="min-h-screen flex items-center justify-center text-gray-500">Profile not found.</div>;

  return (
    <div className="main-container">
      {/* Profile Picture Section */}
      <div className="top-card">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Show camera if active */}
          {showCamera ? (
            <div className="flex flex-col items-center w-full">
              <div className="profile-image-preview-box">
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/png"
                  videoConstraints={{
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: "environment"
                  }}
                  onUserMedia={() => handleCameraReady()}
                  onUserMediaError={(err) => handleCameraError(err instanceof Error ? err.name : 'Camera access denied')}
                  className="profile-webcam"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', background: '#fff' }}
                />
              </div>
              <div className="profile-image-upload-actions">
                <button
                  type="button"
                  onClick={() => {
                    capturePhoto();
                    setShowCamera(false);
                  }}
                  className="profile-capture-photo-btn"
                >
                  <Camera size={18} />
                  Capture Photo
                </button>
                <button
                  type="button"
                  onClick={() => setShowCamera(false)}
                  className="profile-cancel-btn"
                >
                  <X size={18} />
                  Cancel
                </button>
              </div>
            </div>
          ) : capturedImage || selectedImageFile ? (
            <div className="flex flex-col items-center w-full">
              <div className="profile-image-preview-box">
                <img
                  src={previewUrl!}
                  alt="Profile Preview"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    background: '#fff'
                  }}
                />
              </div>
              <div className="profile-image-upload-actions">
                <button
                  type="button"
                  onClick={retakePhoto}
                  className="profile-retake-btn"
                >
                  <Camera size={18} />
                  Retake
                </button>
                <button
                  type="button"
                  onClick={() => { setCapturedImage(""); setSelectedImageFile(null); setImageCompressionInfo(null); }}
                  className="profile-cancel-btn"
                >
                  <X size={18} />
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <>
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  style={{ marginBottom: 12, width: 96, height: 96 }}
                />
              ) : (
                <div 
                  className="w-24 h-24 rounded-full border-4 border-white shadow-lg flex items-center justify-center"
                  style={{ 
                    marginBottom: 12, 
                    width: 96, 
                    height: 96, 
                    backgroundColor: '#b91c1c',
                    border: '4px solid white'
                  }}
                >
                  <svg width="48" height="48" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
              )}
              {isEditing && !success && (
                <div className="profile-photo-options">
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleProfilePicChange}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="profile-upload-option-btn"
                    disabled={uploading}
                  >
                    <Upload size={16} />
                    Upload Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowCamera(true); setCameraError(""); setCameraLoading(true); }}
                    className="profile-camera-option-btn"
                    disabled={uploading}
                  >
                    <Camera size={16} />
                    Take Photo
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <div className="profile-header-card">
        <h3 className="text-2xl font-bold mb-4">Profile</h3>
      </div>
      <div className="profile-info-card">
        <form
          onSubmit={handleSubmit}
          className="max-w-md bg-white rounded shadow p-6"
          style={{ marginLeft: 0 }}
        >
          {error && <div className="mb-4 text-red-500">{error}</div>}
          {success && <div className="mb-4 text-green-600">{success}</div>}
          {(capturedImage || selectedImageFile) && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700 text-sm">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                  <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                </svg>
                New profile photo will be uploaded when you save changes
                {imageCompressionInfo && (
                  <span className="text-xs text-blue-600 ml-2">
                    (Compressed: {imageCompressionInfo.originalSize} → {imageCompressionInfo.compressedSize}, {imageCompressionInfo.ratio} smaller)
                  </span>
                )}
              </div>
            </div>
          )}
          <div className="mb-4">
            <label className="block mb-1 font-medium">Username</label>
            <input
              type="text"
              name="username"
              className="w-full border rounded px-3 py-2 bg-gray-100"
              value={form.username || ""}
              disabled
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-x medium">Full Name</label>
            <input
              type="text"
              name="full_name"
              className="w-full border rounded px-3 py-2"
              value={form.full_name || ""}
              onChange={handleChange}
              disabled={!isEditing}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              name="email"
              className="w-full border rounded px-3 py-2"
              value={form.email || ""}
              onChange={handleChange}
              disabled={!isEditing}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Role</label>
            <input
              type="text"
              name="role"
              className="w-full border rounded px-3 py-2 bg-gray-100"
              value={form.role || ""}
              disabled
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Company</label>
            <input
              type="text"
              name="company_name"
              className="w-full border rounded px-3 py-2 bg-gray-100"
              value={form.company_name || ""}
              disabled
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">New Password</label>
            <input
              type="password"
              name="password"
              className="w-full border rounded px-3 py-2"
              value={form.password || ""}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Leave blank to keep current password"
            />
          </div>
          <div className="mb-6">
            <label className="block mb-1 font-medium">Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              className="w-full border rounded px-3 py-2"
              value={form.confirmPassword || ""}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Leave blank to keep current password"
            />
          </div>
          {isEditing ? (
            <div className="profile-btn-row">
              <button
                type="submit"
                className="save-changes-btn"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="cancel-btn"
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleEdit}
              className="edit-btn"
            >
              Edit Profile
            </button>
          )}
        </form>
      </div>
      <div className="profile-btn-row">
          {/* Admin-only section */}
          {profile?.role === 'admin' && (
            <div className="max-w-md mx-auto bg-white rounded shadow p-6 mt-6">
              <button
                onClick={() => router.push("/register")}
                className="admin-register-btn"
              >
                Register New User
              </button>
            </div>
          )}
          {/* Logout button */}
          <div className="max-w-md mx-auto mt-6">
            <button
              onClick={handleLogout}
              className="logout-btn"
            >
              Logout
            </button>
          </div>
        </div>
    </div>
  );
} 