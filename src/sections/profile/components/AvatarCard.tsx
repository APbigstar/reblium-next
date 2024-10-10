// components/AvatarCard.tsx

import React, { useState } from "react";
import Image from "next/image";
import { AvatarCardProps } from '@/types/type';

const AvatarCard: React.FC<AvatarCardProps> = ({ avatar, onSetProfileAvatar }) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);


  // const avatarSrc = avatar.image
  //   ? `data:image/jpeg;base64,${avatar.image}`
  //   : "/images/default_avatar.png";


  const avatarSrc = avatar.avatar
    ? `/images/Avatars/${avatar.image}`
    : "/images/default_avatar.png";


  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="preset-avatar">
        <div className="relative w-[180px] h-[180px]">
          <Image
            src={avatarSrc}
            alt={`Avatar ${avatar.id}`}
            fill
            style={{ objectFit: "cover" }}
            className="rounded-lg"
          />
          {isHovered && (
            <div className="absolute top-0 right-0 flex flex-col gap-1">
              <button className="bg-blue-500 text-white px-2 py-1 rounded text-sm">
                Edit
              </button>
              <button className="bg-red-500 text-white px-2 py-1 rounded text-sm">
                Delete
              </button>
              <button className="bg-green-500 text-white px-2 py-1 rounded text-sm">
                Rename
              </button>
              <button
                className="bg-purple-500 text-white px-2 py-1 rounded text-sm"
                onClick={() => onSetProfileAvatar(avatar.image)}
              >
                Set Profile
              </button>
            </div>
          )}
        </div>
        <span className="avatar-name">{avatar.name}</span>
      </div>
    </div>
  );
};

export default AvatarCard;