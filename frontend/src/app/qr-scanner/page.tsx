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
      <div className="bg-white rounded-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">QR Scanner</h1>
              <p className="text-blue-100 mt-2 text-lg">Scan QR codes to view or add items</p>
            </div>
          </div>
        </div>

        {/* Scanner Content */}
        <div className="p-8">
          <div className="flex flex-col items-center">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/png"
              videoConstraints={{ facingMode: "environment" }}
              className="w-80 h-80 rounded-lg border-4 border-blue-500 shadow-lg"
            />
            
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                {error}
              </div>
            )}
            
            {scanned && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold">Scanned QR:</span> {scanned}
              </div>
            )}
            
            {loading && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </div>
            )}
            
            {success && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-semibold">Item found! Redirecting to details...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 