"use client";
import TopNavbar from "./TopNavbar";
import { usePathname } from "next/navigation";

export default function ConditionalTopNavbar() {
  const pathname = usePathname();
  if (pathname === "/login") return null;
  return <TopNavbar />;
} 