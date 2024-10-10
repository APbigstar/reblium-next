"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StoreWhatsNewView() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
    }
  }, [router]);

  return <p className="text-white">It's store whats new page</p>;
};
