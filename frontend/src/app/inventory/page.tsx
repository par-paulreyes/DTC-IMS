"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { getApiUrl, getImageUrl } from "../../config/api";

interface Item {
  id: number;
  property_no: string;
  article_type: string;
  image_url?: string;
  location?: string;
  status?: string;
  system_status?: string;
}

export default function InventoryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [articleType, setArticleType] = useState("");
  const [status, setStatus] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    axios
      .get(getApiUrl("/items"), {
        headers: { Authorization: token },
      })
      .then((res) => setItems(res.data))
      .catch((err) => setError("Error loading items"))
      .finally(() => setLoading(false));
  }, [router]);

  // Filter logic
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.property_no.toLowerCase().includes(search.toLowerCase()) ||
      item.article_type.toLowerCase().includes(search.toLowerCase());
    const matchesArticleType = articleType ? item.article_type === articleType : true;
    const itemSystemStatus = item.system_status ? item.system_status : "Unknown";
    const matchesStatus = status ? itemSystemStatus.toLowerCase() === status.toLowerCase() : true;
    return matchesSearch && matchesArticleType && matchesStatus;
  });

  // Get unique article types and system statuses for dropdowns
  const articleTypes = Array.from(new Set(items.map((item) => item.article_type)));
  const statuses = Array.from(
    new Set(
      items.map((item) => (item.system_status ? item.system_status : "Unknown")).map((s) => s || "Unknown")
    )
  );

  return (
    <div className="min-h-screen pt-8 pb-20 bg-gray-50">
      <h1 className="text-2xl font-bold mb-4 text-center">Inventory</h1>
      {/* Search and Filter Controls */}
      <div className="max-w-xl mx-auto flex flex-col md:flex-row gap-2 mb-4">
        <input
          type="text"
          placeholder="Search by property no or article type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <select
          value={articleType}
          onChange={(e) => setArticleType(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Types</option>
          {articleTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All System Statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      {loading && <div className="text-center text-blue-600">Loading...</div>}
      {error && <div className="text-center text-red-500">{error}</div>}
      {!loading && !error && (
        <ul className="max-w-xl mx-auto divide-y divide-gray-200 bg-white rounded shadow">
          {filteredItems.length === 0 && (
            <li className="p-6 text-center text-gray-500">No items found.</li>
          )}
          {filteredItems.map((item) => (
            <li key={item.id} className="flex items-center p-4 hover:bg-gray-50 transition">
              <Link href={`/inventory/${item.id}`} className="flex items-center w-full">
                {item.image_url ? (
                  <img
                    src={getImageUrl(item.image_url)}
                    alt={item.property_no}
                    className="w-16 h-16 max-w-[64px] max-h-[64px] object-cover rounded-lg mr-4 border shadow-sm"
                    style={{ width: 64, height: 64 }}
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded-lg mr-4 flex items-center justify-center text-gray-400 border shadow-sm">
                    <span className="text-xl">📷</span>
                  </div>
                )}
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">{item.property_no}</div>
                  <div className="text-gray-500 text-sm">{item.article_type}</div>
                  <div className="text-gray-400 text-xs">System Status: {item.system_status ? item.system_status : "Unknown"}</div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 