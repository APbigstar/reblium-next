"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AvatarModeView() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
    }
  }, [router]);

  return <p className="text-white">It is avatar mode page</p>;
};
