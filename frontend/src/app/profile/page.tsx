"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getApiUrl, getImageUrl } from "../../config/api";
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

    fetch(getApiUrl("/users/profile"), { 
      headers: { 
        Authorization: `Bearer ${token}` 
      } 
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error('Failed to load profile');
        }
      })
      .then((data) => {
        setProfile(data);
        setForm({ ...data, password: "", confirmPassword: "" });
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
    const token = localStorage.getItem("token");
    
    // Prepare the data to send
    const dataToSend = form.password ? { ...form, password: form.password } : form;
    delete dataToSend.confirmPassword; // Remove confirmPassword from the request
    
    console.log('📤 Sending profile update data:', dataToSend);
    
    try {
      const response = await fetch(
        getApiUrl("/users/profile"),
        {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify(dataToSend)
        }
      );
      
      console.log('📥 Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Profile update successful:', result);
        setSuccess("Profile updated successfully!");
        setForm({ ...form, password: "", confirmPassword: "" });
        setIsEditing(false);
        // Refresh profile data
        const updatedResponse = await fetch(getApiUrl("/users/profile"), { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        if (updatedResponse.ok) {
          const updatedData = await updatedResponse.json();
          setProfile(updatedData);
        }
      } else {
        const errorData = await response.json();
        console.error('❌ Profile update failed:', errorData);
        setError(errorData.message || "Error updating profile");
      }
    } catch (err: any) {
      console.error('❌ Network error:', err);
      setError("Network error. Please try again.");
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
      const token = localStorage.getItem("token");
      const response = await fetch(getApiUrl("/users/profile-picture"), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      } as any); // as any to allow FormData
      if (response.ok) {
        const data = await response.json();
        setProfile((prev: any) => ({ ...prev, profile_picture: data.url }));
        setForm((prev: any) => ({ ...prev, profile_picture: data.url }));
        setSuccess("Profile picture updated!");
      } else {
        setError("Failed to upload profile picture");
      }
    } catch (err) {
      setError("Network error. Please try again.");
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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
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
                className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition"
                disabled={uploading}
                style={{ marginBottom: 4 }}
              >
                {uploading ? 'Uploading...' : 'Change Photo'}
              </button>
            </>
          )}
        </div>
        {/* Logout button */}
        <div className="max-w-md mx-auto mt-6">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
        {/* Admin-only section */}
        {profile?.role === 'admin' && (
          <div className="max-w-md mx-auto bg-white rounded shadow p-6 mt-6">
            <button
              onClick={() => router.push("/register")}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
            >
              Register New User
            </button>
          </div>
        )}
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