"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BackgroundMask from "../components/BackgroundMask";
import ContentComponent from "../components/ContentComponent";

export default function StoreGamesView() {
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
      url: "/images/store/games/1.png",
    },
    {
      name: "",
      url: "/images/store/games/2.png",
    },
    {
      name: "",
        url: "/images/store/games/3.png",
    },
    {
      name: "",
      url: "/images/store/games/4.png",
    },
  ];

  return (
    <div className="h-full overflow-hidden">
      <BackgroundMask url="/images/store/games/bg.png" height="80%" maskWidth="0%" />
      <div className="flex flex-col justify-around items-start h-full">
        <ContentComponent
          title="The Fabricant"
          description="A premium digital fashion platform <br /> <br /> Fashion is about mixing and matching, customizing your garments and expressing your own unique identity. The Fabricant enables anybody to realize this potential. From passive consumers we become active creators, monetizing our craft and sharing our creativity. Royalties are equally split among all participants involved in the co-⁠creation of the digital fashion items. Community"
          AvatarList={AvatarList}
          exploreUrl="/store"
          buttonText="Play"
        />
      </div>
    </div>
  );
};
