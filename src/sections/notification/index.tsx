"use client";

import {  useEffect } from "react";
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
      console.log(response);
    }

    fetchNotifications();
  }, []);

  return <p className="text-white">It is notification page</p>;
};
