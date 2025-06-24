"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getApiUrl } from '../../config/api';
import Image from "next/image";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(getApiUrl('/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        router.push('/');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
    };
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      height: '100%',
      width: '100%',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 50%, #eef2ff 100%)',
    }}>
      {/* Unified Login Box with Top Design and Form */}
      <div style={{
        width: '100%',
        maxWidth: 420,
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 4px 32px rgba(0,0,0,0.10)',
        background: '#14213d',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
      }}>
        {/* Top with background, logo, and text */}
        <div style={{
          width: '100%',
          minHeight: 210,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <img src="/dtc-bg.png" alt="DTC Background" style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 1,
            filter: 'brightness(0.7)'
          }} />
          <Image src="/dtc-logo.png" alt="DTC Logo" width={160} height={80} style={{
            width: 160,
            height: 'auto',
            marginTop: 24,
            zIndex: 2,
            position: 'relative'
          }} priority />
          <div style={{
            color: 'white',
            fontSize: 18,
            fontWeight: 400,
            letterSpacing: 1,
            marginTop: 10,
            marginBottom: 18,
            fontFamily: 'Montserrat, Arial, sans-serif',
            textAlign: 'center',
            zIndex: 2,
            position: 'relative',
            textShadow: '0 2px 8px rgba(0,0,0,0.25)'
          }}>
            DIGITAL TRANSFORMATION CENTER
          </div>
        </div>
        {/* Login Form Section (with semi-transparent overlay for readability) */}
        <div style={{
          width: '100%',
          padding: '32px 20px 28px 20px',
          background: 'rgba(20,33,61,0.97)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{ width: '100%', maxWidth: 320, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ textAlign: 'center', marginBottom: 8, width: '100%' }}>
              <h2 style={{ color: 'white', fontWeight: 700, fontSize: 22, marginBottom: 4 }}>Welcome back!</h2>
              <div style={{ color: '#e5e7eb', fontSize: 12, marginBottom: 8 }}>
                Login to your account to get started.
              </div>
            </div>
            <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
              {error && (
                <div style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  marginBottom: 0,
                  width: '100%'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <svg style={{ width: '1rem', height: '1rem', color: '#f87171', marginRight: '0.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span style={{ color: '#b91c1c', fontSize: '0.85rem', fontWeight: 500 }}>{error}</span>
                  </div>
                </div>
              )}
              <div style={{ width: '100%', position: 'relative', marginBottom: 0 }}>
                <label style={{ color: 'white', fontWeight: 500, fontSize: 14, marginBottom: 4, display: 'block' }}>Username</label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    pointerEvents: 'none',
                    color: '#9ca3af',
                  }}>
                    {/* User Icon */}
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    style={{
                      width: '90%',
                      padding: '12px 0 12px 32px',
                      borderRadius: 8,
                      border: 'none',
                      fontSize: 14,
                      marginTop: 2,
                      background: 'white',
                      color: '#22223b',
                      outline: 'none',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                    }}
                    placeholder="Enter your username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div style={{ width: '100%', position: 'relative', marginBottom: 0 }}>
                <label style={{ color: 'white', fontWeight: 500, fontSize: 14, marginBottom: 4, display: 'block' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    pointerEvents: 'none',
                    color: '#9ca3af',
                  }}>
                    {/* Lock Icon */}
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    type="password"
                    style={{
                      width: '90%',
                      padding: '12px 0 12px 32px',
                      borderRadius: 8,
                      border: 'none',
                      fontSize: 14,
                      marginTop: 2,
                      background: 'white',
                      color: '#22223b',
                      outline: 'none',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                    }}
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  backgroundColor: '#c1121f',
                  color: 'white',
                  padding: '12px 0',
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: 17,
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  marginTop: 0,
                  marginBottom: 0,
                  transition: 'background 0.2s'
                }}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
            <div style={{ textAlign: 'center', marginTop: 8, width: '100%' }}>
              <span style={{ color: '#e5e7eb', fontSize: 12 }}>Forgot password? </span>
              <a href="#" style={{ color: '#c1121f', fontSize: 12, textDecoration: 'underline', cursor: 'pointer' }}>Click here</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}