"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getApiUrl } from "../../config/api";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);
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

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  if (!profile) return <div className="min-h-screen flex items-center justify-center text-gray-500">Profile not found.</div>;

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
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
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
          <label className="block mb-1 font-medium">Full Name</label>
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
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600 transition"
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleEdit}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
          >
            Edit Profile
          </button>
        )}
      </form>

      {/* Admin-only section */}
      {profile?.role === 'admin' && (
        <div className="max-w-md mx-auto bg-white rounded shadow p-6 mt-6">
          <h2 className="text-lg font-bold mb-4 text-center">Admin Actions</h2>
          <button
            onClick={() => router.push("/register")}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
          >
            Register New User
          </button>
        </div>
      )}

      {/* Logout button */}
      <div className="max-w-md mx-auto mt-6">
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
        >
          Logout
        </button>
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