"use client";

import React, { useState, useContext, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  FaUser,
  FaBell,
  FaSearch,
  FaStore,
  FaDollarSign,
} from "react-icons/fa";
import { useRouter } from "next/navigation";

import { UserContext } from "@/provider/UserContext";

const Sidebar: React.FC = () => {
  const router = useRouter();

  const { userInfo, isAuthenticated, loading, subscription, logout } =
    useContext(UserContext);
  const pathname = usePathname();

  const [selected, setSelected] = useState<string>(() => {
    // Initialize from localStorage if available, otherwise use "profile"
    if (typeof window !== "undefined") {
      return localStorage.getItem("selectedMenuItem") || "profile";
    }
    return "profile";
  });

  const DEV_ACCOUNT_ID = +(process.env.NEXT_PUBLIC_DEV_ACCOUNT_ID ?? 0);

  useEffect(() => {
    // Update selected based on current pathname
    const path = pathname.split("/")[1] || "profile";
    setSelected(path);
    localStorage.setItem("selectedMenuItem", path);
  }, [pathname]);

  const handleMenuItemClick = (item: string) => {
    setSelected(item);
    localStorage.setItem("selectedMenuItem", item);
  };

  const getTierText = () => {
    if (!isAuthenticated || loading) return "Loading...";
    if (userInfo?.id === DEV_ACCOUNT_ID) return "Dev";
    if (
      subscription?.plan_id ===
        Number(process.env.NEXT_PUBLIC_MONTHLY_PREMIUM_SUBSCRIPTION_ID) ||
      subscription?.plan_id ===
        Number(process.env.NEXT_PUBLIC_YEARLY_PREMIUM_SUBSCRIPTION_ID)
    )
      return "Premium";
    return "Free";
  };

  return (
    <div className="overlay-menu">
      <div className="flex flex-col justify-center items-center gap-2">
        <p className="text-white">{userInfo?.name?.split(" ")[0]}</p>
        {userInfo?.profile_picture ? (
          <Image
            id="userImage"
            src={`data:image/jpeg;base64,${userInfo.profile_picture}`}
            width={40}
            height={40}
            alt="User"
            onClick={() => logout()}
          />
        ) : (
          <Image
            id="userImage"
            src="/images/default_profile_picture.png"
            width={40}
            height={40}
            alt="Default User"
            onClick={() => logout()}
          />
        )}
        <p className="text-blue-starndard cursor-pointer" onClick={() => router.push('/pricing/detail')}>{getTierText()}</p>
      </div>
      <div className="icon-menu">
        <div id="newButton" className="menu">
          <Link
            href="/profile"
            className="flex items-center gap-2"
            onClick={() => handleMenuItemClick("profile")}
          >
            <FaUser
              className={selected === "profile" ? "text-blue-starndard" : ""}
            />
          </Link>
          <Link
            href="/notification"
            className="flex items-center gap-2"
            onClick={() => handleMenuItemClick("notification")}
          >
            <FaBell
              className={
                selected === "notification" ? "text-blue-starndard" : ""
              }
            />
          </Link>
          <Link
            href="/search"
            className="flex items-center gap-2"
            onClick={() => handleMenuItemClick("search")}
          >
            <FaSearch
              className={selected === "search" ? "text-blue-starndard" : ""}
            />
          </Link>
          <Link
            href="/store"
            className="flex items-center gap-2"
            onClick={() => handleMenuItemClick("store")}
          >
            <FaStore
              className={selected === "store" ? "text-blue-starndard" : ""}
            />
          </Link>
          <Link
            href="/pricing"
            className="flex items-center gap-2"
            onClick={() => handleMenuItemClick("pricing")}
          >
            <FaDollarSign
              className={selected === "pricing" ? "text-blue-starndard" : ""}
            />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
