"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHome, FaClipboardList, FaHistory, FaUser } from "react-icons/fa";

export default function BottomNavbar() {
  const pathname = usePathname();

  // Define nav items, with QR scanner in the center
  const navItems = [
    {
      href: "/",
      label: "Home",
      icon: <FaHome size={24} color={pathname === "/" ? '#e11d48' : '#fff'} />,
      active: pathname === "/"
    },
    {
      href: "/inventory",
      label: "Inventory",
      icon: <FaClipboardList size={24} color={pathname.startsWith("/inventory") ? '#e11d48' : '#fff'} />,
      active: pathname.startsWith("/inventory")
    },
    {
      href: "/qr-scanner",
      label: "Scan",
      isQR: true
    },
    {
      href: "/logs",
      label: "Logs",
      icon: <FaHistory size={24} color={pathname.startsWith("/logs") ? '#e11d48' : '#fff'} />,
      active: pathname.startsWith("/logs")
    },
    {
      href: "/profile",
      label: "Profile",
      icon: <FaUser size={24} color={pathname.startsWith("/profile") ? '#e11d48' : '#fff'} />,
      active: pathname.startsWith("/profile")
    }
  ];

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
        {/* Evenly spaced nav content */}
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: 600,
          margin: '0 auto',
          height: 70,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-evenly',
          zIndex: 2,
          pointerEvents: 'auto',
        }}>
          {navItems.map((item, idx) =>
            item.isQR ? (
              <Link
                key={item.href}
                href={item.href}
                style={{
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
                  marginTop: -36,
                  transition: 'box-shadow 0.2s',
                }}
              >
                <svg width="36" height="36" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="7" height="7" rx="2" />
                  <rect x="14" y="3" width="7" height="7" rx="2" />
                  <rect x="14" y="14" width="7" height="7" rx="2" />
                  <rect x="3" y="14" width="7" height="7" rx="2" />
                </svg>
              </Link>
            ) : (
              <NavItem key={item.href} href={item.href} label={item.label} active={item.active} icon={item.icon} />
            )
          )}
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
      fontFamily: 'Poppins, sans-serif',
      textDecoration: 'none',
      gap: 2,
      minWidth: 48,
      pointerEvents: 'auto',
    }}>
      {icon}
      <span style={{ fontSize: 12, marginTop: 2, fontFamily: 'Poppins, sans-serif' }}>{label}</span>
    </Link>
  );
} 