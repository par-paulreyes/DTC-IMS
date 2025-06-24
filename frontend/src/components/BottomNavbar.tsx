"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNavbar() {
  const pathname = usePathname();
  
  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: 'red',
      color: 'white',
      padding: '20px',
      borderRadius: '10px',
      zIndex: 9999,
      border: '3px solid yellow',
      fontSize: '16px',
      fontWeight: 'bold'
    }}>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <Link href="/" style={{ color: 'white', textDecoration: 'none' }}>
          Home
        </Link>
        <Link href="/inventory" style={{ color: 'white', textDecoration: 'none' }}>
          Inventory
        </Link>
        <Link href="/qr-scanner" style={{ color: 'white', textDecoration: 'none' }}>
          QR Scanner
          </Link>
        <Link href="/logs" style={{ color: 'white', textDecoration: 'none' }}>
          Logs
        </Link>
        <Link href="/profile" style={{ color: 'white', textDecoration: 'none' }}>
          Profile
        </Link>
      </div>
    </div>
  );
} 