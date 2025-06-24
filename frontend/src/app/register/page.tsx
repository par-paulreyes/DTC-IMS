"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getApiUrl } from "../../config/api";

interface FormData {
  username: string;
  full_name: string;
  email: string;
  company_name: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    full_name: "",
    email: "",
    company_name: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

      const response = await fetch(getApiUrl("/users/profile"), {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        if (userData.role !== "admin") {
          setTimeout(() => router.push("/"), 2000);
        }
      } else {
        router.push("/login");
      }
    } catch (error) {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setSubmitting(true);
    setError("");
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(getApiUrl("/auth/register"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
        username: formData.username,
        full_name: formData.full_name,
        email: formData.email,
        company_name: formData.company_name,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("User created successfully!");
        setFormData({
          username: "",
          full_name: "",
          email: "",
          company_name: "",
          password: "",
          confirmPassword: ""
        });
      } else {
        setError(data.message || "Failed to create user");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
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
          backgroundColor: 'white',
          borderRadius: '10px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          border: '3px solid #fbbf24',
          padding: '1.25rem',
          textAlign: 'center',
          maxWidth: '320px'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '2.5rem',
            height: '2.5rem',
            backgroundColor: '#2563eb',
            borderRadius: '50%',
            marginBottom: '0.75rem'
          }}>
            <svg style={{
              animation: 'spin 1s linear infinite',
              height: '1.25rem',
              width: '1.25rem',
              color: 'white'
            }} fill="none" viewBox="0 0 24 24">
              <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h2 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '0.25rem'
          }}>Verifying Permissions</h2>
          <p style={{
            fontSize: '0.875rem',
            color: '#6b7280'
          }}>Please wait while we check your access...</p>
        </div>
      </div>
    );
  }

  // Show access denied message if not admin
  if (user?.role !== 'admin') {
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
          backgroundColor: 'white',
          borderRadius: '10px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          border: '3px solid #fbbf24',
          padding: '1.25rem',
          textAlign: 'center',
          maxWidth: '320px'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '3rem',
            height: '3rem',
            backgroundColor: '#fef2f2',
            borderRadius: '50%',
            marginBottom: '0.75rem'
          }}>
            <svg style={{
              width: '1.5rem',
              height: '1.5rem',
              color: '#dc2626'
            }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
            color: '#dc2626'
          }}>Access Denied</h2>
          <p style={{
            fontSize: '0.875rem',
            color: '#6b7280',
            marginBottom: '0.75rem'
          }}>Admin privileges required to access this page.</p>
          <p style={{
            fontSize: '0.75rem',
            color: '#9ca3af'
          }}>Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

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
          backgroundColor: '#16a34a',
          borderRadius: '50%',
          marginBottom: '0.75rem'
        }}>
          <svg style={{
            width: '1.5rem',
            height: '1.5rem',
            color: 'white'
          }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#111827',
          marginBottom: '0.25rem'
        }}>Register New User</h1>
        <p style={{
          fontSize: '0.875rem',
          color: '#6b7280'
        }}>Create a new user account for your organization</p>
      </div>
      {/* Registration Form */}
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
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
          name="username"
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
                    e.target.style.borderColor = '#16a34a';
                    e.target.style.boxShadow = '0 0 0 3px rgba(22, 163, 74, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Enter username"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
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
              Full Name
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
          name="full_name"
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
                    e.target.style.borderColor = '#16a34a';
                    e.target.style.boxShadow = '0 0 0 3px rgba(22, 163, 74, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Enter full name"
          value={formData.full_name}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          required
        />
      </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.25rem'
            }}>
              Email
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
        <input
          type="email"
          name="email"
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
                    e.target.style.borderColor = '#16a34a';
                    e.target.style.boxShadow = '0 0 0 3px rgba(22, 163, 74, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Enter email address"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
              Company Name
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
        <input
          type="text"
          name="company_name"
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
                    e.target.style.borderColor = '#16a34a';
                    e.target.style.boxShadow = '0 0 0 3px rgba(22, 163, 74, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="e.g., DTC"
          value={formData.company_name}
          onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
          required
        />
      </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
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
          name="password"
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
                    e.target.style.borderColor = '#16a34a';
                    e.target.style.boxShadow = '0 0 0 3px rgba(22, 163, 74, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Enter password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
              Confirm Password
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
          name="confirmPassword"
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
                    e.target.style.borderColor = '#16a34a';
                    e.target.style.boxShadow = '0 0 0 3px rgba(22, 163, 74, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Confirm password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          required
        />
      </div>
          </div>
        </div>

      <button
        type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              backgroundColor: '#16a34a',
              color: 'white',
              paddingTop: '0.375rem',
              paddingBottom: '0.375rem',
              paddingLeft: '1rem',
              paddingRight: '1rem',
              borderRadius: '0.5rem',
              fontWeight: '500',
              fontSize: '0.75rem',
              border: 'none',
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!submitting) {
                e.currentTarget.style.backgroundColor = '#15803d';
              }
            }}
            onMouseLeave={(e) => {
              if (!submitting) {
                e.currentTarget.style.backgroundColor = '#16a34a';
              }
            }}
          >
            {submitting ? (
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
                Creating User...
              </>
            ) : (
              "Create User Account"
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
        Only administrators can create new user accounts
      </p>
      <p style={{
        textAlign: 'center',
        fontSize: '0.75rem',
        color: '#9ca3af'
      }}>
        © 2024 DTC-IMS. All rights reserved.
      </p>
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
      div[style*="max-width: 384px"] {
        max-width: 448px !important;
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
      div[style*="grid-template-columns: 1fr"] {
        grid-template-columns: 1fr 1fr !important;
      }
    }
    
    @media (min-width: 768px) {
      div[style*="max-width: 384px"] {
        max-width: 576px !important;
      }
      div[style*="padding: 1.25rem"] {
        padding: 2rem !important;
      }
    }
    
    @media (min-width: 1024px) {
      div[style*="max-width: 384px"] {
        max-width: 640px !important;
      }
    }

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