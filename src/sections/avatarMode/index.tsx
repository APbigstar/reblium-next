"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AvatarModeView() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
    }
  }, [router]);

  return <p className="text-white">It's avatar mode page</p>;
};