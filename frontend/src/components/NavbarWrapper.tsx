"use client";
import { usePathname } from "next/navigation";
import BottomNavbar from "./BottomNavbar";

export default function NavbarWrapper() {
  const pathname = usePathname();
  
  // Hide navbar only on login page
  const hideNavbar = pathname === "/login";

  if (hideNavbar) {
    return null;
  }

  return <BottomNavbar />;
} 