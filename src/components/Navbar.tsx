import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";

const Navbar: React.FC = () => {
  const router = useRouter();
  const { userInfo, credits, subscription, loading } = useUser();

  const DEV_ACCOUNT_ID = +(process.env.NEXT_PUBLIC_DEV_ACCOUNT_ID ?? 0);

  console.log(DEV_ACCOUNT_ID);

  const getTierText = () => {
    console.log(userInfo.id, DEV_ACCOUNT_ID);
    if (loading) return "Loading...";
    if (userInfo?.id === DEV_ACCOUNT_ID) return "Dev";
    if (subscription?.exists) return "Premium";
    return "Free";
  };

  const getCreditsText = () => {
    if (loading) return "Loading...";
    if (userInfo?.id === DEV_ACCOUNT_ID) return "Unlimited";
    return credits.toString();
  };

  const toggleSection = (sectionId: string): void => {
    // Implement section toggle logic
    console.log(`Toggling section: ${sectionId}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <nav className="navbar">
      <Image
        src="/images/reblium_logo.png"
        width={100}
        height={40}
        className="nav-logo"
        alt="Icon"
      />

      <div className="nav-user">
        <div className="beta-text">Early Access</div>
        <div
          id="tier"
          style={{ color: "#00cdff", marginRight: "10px", cursor: "pointer" }}
          onClick={() => toggleSection("tier-section")}
        >
          {getTierText()}
        </div>

        <div style={{ paddingRight: "10px" }}>
          <a className="credits">
            <span id="exportCredits">{getCreditsText()}</span>
            &nbsp;credits
          </a>
        </div>
        <div>
          {userInfo?.profilePicture ? (
            <Image
              id="userImage"
              src={userInfo.profilePicture}
              width={40}
              height={40}
              alt="User"
            />
          ) : (
            <Image
              id="userImage"
              src="/images/default_profile_picture.png"
              width={40}
              height={40}
              alt="Default User"
            />
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
