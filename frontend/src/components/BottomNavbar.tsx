"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNavbar() {
  const pathname = usePathname();

  return (
    <>
      {/* Spacer to prevent content from being hidden behind the navbar */}
      <div style={{ height: 80, width: '100%' }} />
      <div style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        zIndex: 50,
        pointerEvents: 'none',
        display: 'flex',
        justifyContent: 'center',
      }}>
        {/* Full-width background bar */}
        <div style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: 70,
          background: '#182848',
          borderRadius: '20px 20px 0 0',
          boxShadow: '0 0 16px rgba(0,0,0,0.12)',
          zIndex: 1,
        }} />
        {/* Centered nav content */}
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: 600,
          margin: '0 auto',
          height: 70,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          zIndex: 2,
          pointerEvents: 'auto',
        }}>
          {/* Left nav */}
          <div style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
            <NavItem href="/" label="Home" active={pathname === "/"} icon={
              <svg width="24" height="24" fill="none" stroke={pathname === "/" ? '#e11d48' : '#fff'} strokeWidth="2" viewBox="0 0 24 24"><path d="M3 12l9-9 9 9"/><path d="M9 21V9h6v12"/></svg>
            } />
            <NavItem href="/inventory" label="Inventory" active={pathname.startsWith("/inventory")} icon={
              <svg width="24" height="24" fill="none" stroke={pathname.startsWith("/inventory") ? '#e11d48' : '#fff'} strokeWidth="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
            } />
          </div>
          {/* Center cutout for QR button */}
          <div style={{ position: 'absolute', left: '50%', top: -36, transform: 'translateX(-50%)', zIndex: 3 }}>
            <Link href="/qr-scanner" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 72,
              height: 72,
              background: '#b91c1c',
              borderRadius: '50%',
              border: '7px solid #fff',
              boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
              color: '#fff',
              fontSize: 36,
              pointerEvents: 'auto',
              transition: 'box-shadow 0.2s',
            }}>
              <svg width="36" height="36" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="3" width="7" height="7" rx="2"/>
                <rect x="14" y="3" width="7" height="7" rx="2"/>
                <rect x="14" y="14" width="7" height="7" rx="2"/>
                <rect x="3" y="14" width="7" height="7" rx="2"/>
              </svg>
            </Link>
          </div>
          {/* Right nav */}
          <div style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
            <NavItem href="/logs" label="Logs" active={pathname.startsWith("/logs")} icon={
              <svg width="24" height="24" fill="none" stroke={pathname.startsWith("/logs") ? '#e11d48' : '#fff'} strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
            } />
            <NavItem href="/profile" label="Profile" active={pathname.startsWith("/profile")} icon={
              <svg width="24" height="24" fill="none" stroke={pathname.startsWith("/profile") ? '#e11d48' : '#fff'} strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20v-1a4 4 0 014-4h8a4 4 0 014 4v1"/></svg>
            } />
          </div>
        </div>
      </div>
      <style jsx>{`
        @media (max-width: 700px) {
          div[style*='max-width: 600px'] {
            max-width: 100vw !important;
            padding-left: 12px !important;
            padding-right: 12px !important;
          }
          div[style*='height: 70px'] {
            height: 60px !important;
          }
          a[style*='width: 72px'] {
            width: 56px !important;
            height: 56px !important;
            border-width: 5px !important;
          }
          svg[width='36'] {
            width: 28px !important;
            height: 28px !important;
          }
        }
      `}</style>
    </>
  );
}

function NavItem({ href, label, active, icon }: { href: string, label: string, active: boolean, icon: React.ReactNode }) {
  return (
    <Link href={href} style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: active ? '#e11d48' : '#fff',
      fontSize: 13,
      fontWeight: 500,
      textDecoration: 'none',
      gap: 2,
      minWidth: 48,
      pointerEvents: 'auto',
    }}>
      {icon}
      <span style={{ fontSize: 12, marginTop: 2 }}>{label}</span>
    </Link>
  );
} 