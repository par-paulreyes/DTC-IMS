"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { apiClient, getImageUrl } from "../../config/api";
import imageCompression from 'browser-image-compression';
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
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
  }, [router]);

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
    
    // Prepare the data to send
    const dataToSend = form.password ? { ...form, password: form.password } : form;
    delete dataToSend.confirmPassword; // Remove confirmPassword from the request
    
    console.log('📤 Sending profile update data:', dataToSend);
    
    try {
      const response = await apiClient.put("/users/profile", dataToSend);
      
      console.log('✅ Profile update successful:', response.data);
      setSuccess("Profile updated successfully!");
      setForm({ ...form, password: "", confirmPassword: "" });
      setIsEditing(false);
      
      // Refresh profile data
      const updatedResponse = await apiClient.get("/users/profile");
      setProfile(updatedResponse.data);
    } catch (err: any) {
      console.error('❌ Profile update failed:', err);
      setError(err.response?.data?.message || "Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  // Handle profile picture upload
  const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    // Compress the image
    const options = {
      maxSizeMB: 1, // Target max size in MB
      maxWidthOrHeight: 800, // Resize to max 800px width or height
      useWebWorker: true,
    };
    setUploading(true);
    setError("");
    setSuccess("");
    try {
      const compressedFile = await imageCompression(file, options);
      const formData = new FormData();
      formData.append('profile_picture', compressedFile, file.name || 'profile.png');
      const response = await apiClient.post("/users/profile-picture", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data.url) {
        setProfile((prev: any) => ({ ...prev, profile_picture: response.data.url }));
        setForm((prev: any) => ({ ...prev, profile_picture: response.data.url }));
        setSuccess("Profile picture updated!");
      } else {
        setError("Failed to upload profile picture");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Network error. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // Helper to get the correct image URL
  const imageUrl = getImageUrl(form.profile_picture);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  if (!profile) return <div className="min-h-screen flex items-center justify-center text-gray-500">Profile not found.</div>;

  return (
    <div className="main-container">
      {/* Profile Picture Section */}
      <div className="top-card">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              style={{ marginBottom: 12, width: 96, height: 96 }}
            />
          )}
          {isEditing && !success && (
            <>
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
                className="change-photo-btn"
                disabled={uploading}
                style={{ marginBottom: 4 }}
              >
                {uploading ? 'Uploading...' : 'Change Photo'}
              </button>
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