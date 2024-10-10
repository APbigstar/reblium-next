"use client";

import React, { useContext } from "react";
import Image from "next/image";
import { UserContext } from "@/contexts/UserContext";

const Navbar: React.FC = () => {
  const { userInfo, credits, loading, isAuthenticated } = useContext(UserContext);

  const DEV_ACCOUNT_ID = +(process.env.NEXT_PUBLIC_DEV_ACCOUNT_ID ?? 0);

  const getCreditsText = () => {
    if (!isAuthenticated || loading) return "Loading...";
    if (userInfo?.id === DEV_ACCOUNT_ID) return "Unlimited";
    return credits.toString();
  };

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <nav className="navbar">
      <Image
        src="/images/white_logo.png"
        width={100}
        height={40}
        priority
        className="nav-logo"
        alt="Icon"
      />
      <div></div>

      <div className="border border-white rounded-full px-2 py-1">Early Access</div>

      <div className="flex items-center gap-2">
        <div style={{ paddingRight: "10px" }}>
          <a className="credits">
            <span id="exportCredits">{getCreditsText()}</span>
            &nbsp;credits
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
