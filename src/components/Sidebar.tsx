"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaUser, FaBell, FaSearch, FaStore, FaDollarSign } from 'react-icons/fa';

import { useAuthAndUser } from "@/hooks/useAuthAndUser";

const Sidebar: React.FC = () => {
  const { logout } = useAuthAndUser();
  const { userInfo, isAuthenticated, loading, subscription } = useAuthAndUser();

  const [selected, setSelected] = useState<string>("profile");

  const DEV_ACCOUNT_ID = +(process.env.NEXT_PUBLIC_DEV_ACCOUNT_ID ?? 0);

  const getTierText = () => {
    if (!isAuthenticated || loading) return "Loading...";
    if (userInfo?.id === DEV_ACCOUNT_ID) return "Dev";
    if (subscription?.exists) return "Premium";
    return "Free";
  };

  return (
    <div className="overlay-menu">
      <div className="flex flex-col justify-center items-center gap-4">
        {userInfo?.profilePicture ? (
          <Image
            id="userImage"
            src={userInfo.profilePicture}
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
        <p className="text-blue-starndard">{getTierText()}</p>
      </div>
      <div className="icon-menu">
        <div id="newButton" className="menu">
          <Link href="/profile" className="flex items-center gap-2" onClick={() => setSelected("profile")}>
            <FaUser className={selected === "profile" ? "text-blue-starndard" : ""} />
          </Link>
          <Link href="/notification" className="flex items-center gap-2" onClick={() => setSelected("notification")}>
            <FaBell className={selected === "notification" ? "text-blue-starndard" : ""} />
          </Link>
          <Link href="/search" className="flex items-center gap-2" onClick={() => setSelected("search")}>
            <FaSearch className={selected === "search" ? "text-blue-starndard" : ""} />
          </Link>
          <Link href="/store" className="flex items-center gap-2" onClick={() => setSelected("store")}>
            <FaStore className={selected === "store" ? "text-blue-starndard" : ""} />
          </Link>
          <Link href="/pricing" className="flex items-center gap-2" onClick={() => setSelected("pricing")}>
            <FaDollarSign className={selected === "pricing" ? "text-blue-starndard" : ""} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
