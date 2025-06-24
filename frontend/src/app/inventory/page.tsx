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
}

export default function InventoryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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

  return (
    <div className="min-h-screen pt-8 pb-20 bg-gray-50">
      <h1 className="text-2xl font-bold mb-4 text-center">Inventory</h1>
      {loading && <div className="text-center text-blue-600">Loading...</div>}
      {error && <div className="text-center text-red-500">{error}</div>}
      {!loading && !error && (
        <ul className="max-w-xl mx-auto divide-y divide-gray-200 bg-white rounded shadow">
          {items.length === 0 && (
            <li className="p-6 text-center text-gray-500">No items found.</li>
          )}
          {items.map((item) => (
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
                  {item.location && <div className="text-gray-400 text-xs">{item.location}</div>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 