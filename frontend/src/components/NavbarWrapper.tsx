"use client";
import { usePathname } from "next/navigation";
import BottomNavbar from "./BottomNavbar";

export default function NavbarWrapper() {
  const pathname = usePathname();
  
  // Hide navbar on login and register pages
  const hideNavbar = pathname === "/login" || pathname === "/register";

  if (hideNavbar) {
    return null;
  }

  return <BottomNavbar />;
} 