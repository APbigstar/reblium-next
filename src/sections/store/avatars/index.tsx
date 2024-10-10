"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import BackgroundMask from "../components/BackgroundMask";
import ContentComponent from "../components/ContentComponent";

export default function StoreAvatarsView() {
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
      url: "/images/store/avatars/1.png",
    },
    {
      name: "",
      url: "/images/store/avatars/2.png",
    },
    {
      name: "",
      url: "/images/store/avatars/3.png",
    },
    {
      name: "",
      url: "/images/store/avatars/4.png",
    },
  ];

  return (
    <div className="h-full overflow-hidden">
      <BackgroundMask url="/images/store/avatars/bg.png" height="67%" maskWidth="30%" />
      <div className="flex flex-col justify-around items-start h-full">
        <ContentComponent
          title="Metahumans"
          description="High-fidelity digital humans made easy. <br /> <br /> MetaHuman is a complete framework that gives anyone the power to create, animate, and use highly realistic digital human characters in any way imaginable.Community"
          AvatarList={AvatarList}
          exploreUrl="/store"
          buttonText="Explore"
        />
      </div>
    </div>
  );
}
