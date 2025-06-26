"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getApiUrl } from "../config/api";

export default function TopNavbar() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    if (!token) return;
    fetch(getApiUrl("/users/profile"), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch(() => setUser(null));
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      width: '100vw',
      zIndex: 50,
      pointerEvents: 'none',
    }}>
      {/* Full-width background bar */}
      <div style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        width: '100vw',
        height: 64,
        background: '#182848',
        borderRadius: '0 0 20px 20px',
        boxShadow: '0 2px 16px rgba(0,0,0,0.10)',
        zIndex: 1,
      }} />
      {/* Nav content flush left */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: 600,
        margin: '0',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        padding: '0 0 0 32px',
        zIndex: 2,
        pointerEvents: 'auto',
      }}>
        {/* Left-aligned logo and greeting */}
        <div style={{ display: 'flex', alignItems: 'center', height: '100%', minWidth: 0 }}>
          <Image src="/dtc-logo.png" alt="DTC Logo" width={40} height={40} style={{ objectFit: 'contain', flexShrink: 0 }} priority />
          <div style={{ 
            marginLeft: 14, 
            color: '#fff', 
            fontWeight: 600, 
            fontSize: '1.1rem', 
            whiteSpace: 'nowrap', 
            textOverflow: 'ellipsis', 
            overflow: 'hidden', 
            minWidth: 0,
            fontFamily: 'Poppins, sans-serif'
          }}>
            Hello{user ? `! ` : '!' }
            {user && <span style={{ color: '#e11d48', fontWeight: 700 }}>{user.full_name || user.username}</span>}
          </div>
        </div>
        {/* Right side empty for now */}
      </div>
      <style jsx>{`
        @media (max-width: 700px) {
          div[style*='max-width: 600px'] {
            max-width: 100vw !important;
            padding-left: 8px !important;
            padding-right: 8px !important;
          }
          div[style*='height: 64px'] {
            height: 54px !important;
          }
          img[alt='DTC Logo'] {
            width: 32px !important;
            height: 32px !important;
          }
          div[style*='font-size: 1.1rem'] {
            font-size: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
} 