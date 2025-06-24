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
    try {
      const response = await fetch(
        getApiUrl("/users/profile"),
        {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify(form.password ? { ...form, password: form.password } : form)
        }
      );
      
      if (response.ok) {
        setSuccess("Profile updated successfully!");
        setForm({ ...form, password: "", confirmPassword: "" });
      } else {
        const data = await response.json();
        setError(data.message || "Error updating profile");
      }
    } catch (err: any) {
      setError("Error updating profile");
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
    <div className="min-h-screen pt-8 pb-20 bg-gray-50">
      <h1 className="text-2xl font-bold mb-4 text-center">Profile</h1>
      <form
        onSubmit={handleSubmit}
        className="max-w-md mx-auto bg-white rounded shadow p-6"
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
            placeholder="Leave blank to keep current password"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          disabled={saving}
        >
          {saving ? "Saving..." : "Update Profile"}
        </button>
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
    </div>
  );
} 