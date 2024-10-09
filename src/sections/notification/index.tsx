"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NotificationView() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
    }
  }, [router]);

  useEffect(() => {
    async function fetchNotifications() {
      const token = localStorage.getItem("token");
      const response = await fetch('/api/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    }

    fetchNotifications();
  }, []);

  return <p className="text-white">It's notification page</p>;
};
