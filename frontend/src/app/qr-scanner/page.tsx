"use client";
import React, { useRef, useState, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import jsQR from "jsqr";
import axios from "axios";
import { useRouter } from "next/navigation";
import { getApiUrl } from "../../config/api";

export default function QRScannerPage() {
  const webcamRef = useRef<Webcam>(null);
  const [scanned, setScanned] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  // Check authentication on page load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  const capture = useCallback(() => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;
    try {
      const base64 = imageSrc.split(",")[1];
      const binary = atob(base64);
      const len = binary.length;
      const buffer = new Uint8ClampedArray(len);
      for (let i = 0; i < len; i++) buffer[i] = binary.charCodeAt(i);
      // Create ImageData
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const img = new window.Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imageData.data, img.width, img.height);
        if (code) setScanned(code.data);
      };
      img.src = imageSrc;
    } catch (e) {
      setError("Camera or decoding error");
    }
  }, []);

  useEffect(() => {
    if (scanned) return;
    const interval = setInterval(capture, 1000);
    return () => clearInterval(interval);
  }, [capture, scanned]);

  useEffect(() => {
    if (!scanned) return;
    setLoading(true);
    setError("");
    setSuccess(false);
    const token = localStorage.getItem("token");
    
    if (!token) {
      setError("Please log in to scan QR codes");
      setLoading(false);
      router.push("/login");
      return;
    }
    
    axios
      .get(getApiUrl(`/items/qr/${encodeURIComponent(scanned)}`), {
        headers: { Authorization: token },
      })
      .then((res) => {
        // Show success message briefly before redirecting
        setLoading(false);
        setError("");
        setSuccess(true);
        setTimeout(() => {
          router.push(`/inventory/${res.data.id}`);
        }, 1000);
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          // Automatically redirect to add item page with QR code
          router.push(`/inventory/add?qr=${encodeURIComponent(scanned)}`);
        } else if (err.response?.status === 401) {
          setError("Authentication failed. Please log in again.");
          localStorage.removeItem("token");
          router.push("/login");
        } else {
          setError("Error fetching item: " + (err.response?.data?.message || err.message));
        }
      })
      .finally(() => setLoading(false));
  }, [scanned, router]);

  return (
    <div className="min-h-screen pt-8 pb-20 flex flex-col items-center bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">QR Scanner</h1>
      
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/png"
        videoConstraints={{ facingMode: "environment" }}
        className="w-80 h-80 rounded border-4 border-blue-500"
      />
      
      {error && <div className="text-red-500 mt-2">{error}</div>}
      {scanned && (
        <div className="mt-4 text-green-600 font-bold">
          Scanned QR: {scanned}
        </div>
      )}
      {loading && <div className="mt-4 text-blue-600">Loading...</div>}
      {success && (
        <div className="mt-4 text-green-600 font-bold">
          Item found! Redirecting to details...
        </div>
      )}
    </div>
  );
} 