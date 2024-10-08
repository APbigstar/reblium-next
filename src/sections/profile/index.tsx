"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import withAuth from "@/components/withAuth";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export default withAuth(function ProfileView() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
    }
  }, [router]);

  return <p className="text-white">It's profile page</p>;
});
