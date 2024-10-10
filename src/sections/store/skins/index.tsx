"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BackgroundMask from "../components/BackgroundMask";
import ContentComponent from "../components/ContentComponent";

export default function StoreSkinsView() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
    }
  }, [router]);

  const AvatarList = [
    {
      name: "",
      url: "/images/store/skins/1.png",
    },
    {
      name: "",
      url: "/images/store/skins/2.png",
    },
    {
      name: "",
        url: "/images/store/skins/3.png",
    },
    {
      name: "",
      url: "/images/store/skins/4.png",
    },
  ];

  return (
    <div className="h-full overflow-hidden">
      <BackgroundMask url="/images/store/skins/bg.png" height="67%" maskWidth="30%" />
      <div className="flex flex-col justify-around items-start h-full">
        <ContentComponent
          title="The Fabricant"
          description="A premium digital fashion platform <br /> <br /> Fashion is about mixing and matching, customizing your garments and expressing your own unique identity. The Fabricant enables anybody to realize this potential. From passive consumers we become active creators, monetizing our craft and sharing our creativity. Royalties are equally split among all participants involved in the co-⁠creation of the digital fashion items. Community"
          AvatarList={AvatarList}
          exploreUrl="/store"
          buttonText="Explore"
        />
      </div>
    </div>
  );
};
