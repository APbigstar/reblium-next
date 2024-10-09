"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PricingView() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
    }
  }, [router]);

  return <p className="text-white">It's pricing page</p>;
};
