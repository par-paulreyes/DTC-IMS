"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getApiUrl } from '../../config/api';

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

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 50%, #eef2ff 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '320px'
      }}>
        {/* Unified Container - Matching Navbar Style */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '10px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          border: '3px solid #fbbf24',
          padding: '1.25rem'
        }}>
          {/* Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '3rem',
              height: '3rem',
              backgroundColor: '#2563eb',
              borderRadius: '50%',
              marginBottom: '0.75rem'
            }}>
              <svg style={{
                width: '1.5rem',
                height: '1.5rem',
                color: 'white'
              }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: '0.25rem'
            }}>Welcome Back</h1>
            <p style={{
              fontSize: '0.875rem',
              color: '#6b7280'
            }}>Sign in to your DTC-IMS account</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {error && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '0.5rem',
                padding: '0.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <svg style={{
                    width: '1rem',
                    height: '1rem',
                    color: '#f87171',
                    marginRight: '0.5rem'
                  }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span style={{
                    color: '#b91c1c',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}>{error}</span>
                </div>
              </div>
            )}

            <div>
              <label style={{
                display: 'block',
                fontSize: '0.75rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.25rem'
              }}>
                Username
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '0.5rem',
                  transform: 'translateY(-50%)',
                  display: 'flex',
                  alignItems: 'center',
                  pointerEvents: 'none'
                }}>
                  <svg style={{
                    height: '0.75rem',
                    width: '0.75rem',
                    color: '#9ca3af'
                  }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  style={{
                    display: 'block',
                    width: '100%',
                    paddingLeft: '1.5rem',
                    paddingRight: '0.75rem',
                    paddingTop: '0.375rem',
                    paddingBottom: '0.375rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '0.75rem',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Enter your username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '0.75rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.25rem'
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '0.5rem',
                  transform: 'translateY(-50%)',
                  display: 'flex',
                  alignItems: 'center',
                  pointerEvents: 'none'
                }}>
                  <svg style={{
                    height: '0.75rem',
                    width: '0.75rem',
                    color: '#9ca3af'
                  }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  style={{
                    display: 'block',
                    width: '100%',
                    paddingLeft: '1.5rem',
                    paddingRight: '0.75rem',
                    paddingTop: '0.375rem',
                    paddingBottom: '0.375rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '0.75rem',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
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
                backgroundColor: '#2563eb',
                color: 'white',
                paddingTop: '0.375rem',
                paddingBottom: '0.375rem',
                paddingLeft: '1rem',
                paddingRight: '1rem',
                borderRadius: '0.5rem',
                fontWeight: '500',
                fontSize: '0.75rem',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#1d4ed8';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                }
              }}
            >
              {loading ? (
                <>
                  <svg style={{
                    animation: 'spin 1s linear infinite',
                    marginRight: '0.5rem',
                    height: '0.75rem',
                    width: '0.75rem',
                    color: 'white'
                  }} fill="none" viewBox="0 0 24 24">
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Footer */}
          <div style={{
            marginTop: '1.5rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid #e5e7eb'
          }}>
            <p style={{
              textAlign: 'center',
              fontSize: '0.75rem',
              color: '#6b7280',
              marginBottom: '1rem'
            }}>
              Need help? Contact your system administrator
            </p>
            <p style={{
              textAlign: 'center',
              fontSize: '0.75rem',
              color: '#9ca3af'
            }}>
              © 2024 DTC-IMS. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @media (min-width: 640px) {
          div[style*="max-width: 320px"] {
            max-width: 384px !important;
          }
          div[style*="padding: 1.25rem"] {
            padding: 1.5rem !important;
          }
          h1[style*="font-size: 1.5rem"] {
            font-size: 1.875rem !important;
          }
          p[style*="font-size: 0.875rem"] {
            font-size: 1rem !important;
          }
          div[style*="width: 3rem"] {
            width: 3.5rem !important;
            height: 3.5rem !important;
          }
          svg[style*="width: 1.5rem"] {
            width: 1.75rem !important;
            height: 1.75rem !important;
          }
        }
        
        @media (min-width: 768px) {
          div[style*="max-width: 320px"] {
            max-width: 448px !important;
          }
          div[style*="padding: 1.25rem"] {
            padding: 2rem !important;
          }
        }
        
        @media (min-width: 1024px) {
          div[style*="max-width: 320px"] {
            max-width: 512px !important;
          }
        }
      `}</style>
    </div>
  );
}