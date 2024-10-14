import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Avatar } from '@/types/type';

export interface AvatarCardProps {
  avatar: Avatar;
  onSetProfileAvatar: (avatarImage: string) => Promise<void>;
  onRenameAvatar: (avatarId: number, newName: string) => Promise<void>;
  onDeleteAvatar: (avatarId: number) => Promise<void>;
}

const AvatarCard: React.FC<AvatarCardProps> = ({ avatar, onSetProfileAvatar, onRenameAvatar, onDeleteAvatar }) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isRenaming, setIsRenaming] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>(avatar.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isRenaming]);

  const handleRename = () => {
    if (isRenaming) {
      if (newName !== avatar.name) {
        onRenameAvatar(avatar.id, newName);
      }
      setIsRenaming(false);
    } else {
      setIsRenaming(true);
    }
  };

  const handleInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleRename();
    }
  };

  // const avatarSrc = avatar.image
  //   ? `data:image/jpeg;base64,${avatar.image}`
  //   : "/images/default_avatar.png";

  const avatarSrc = avatar.avatar
    ? `/images/Avatars/${avatar.image}`
    : "/images/default_avatar.png";

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${avatar.name}?`)) {
      onDeleteAvatar(avatar.id);
    }
  };

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
              <button 
                className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                onClick={handleDelete}
              >
                Delete
              </button>
              <button 
                className="bg-green-500 text-white px-2 py-1 rounded text-sm"
                onClick={handleRename}
              >
                {isRenaming ? "Save" : "Rename"}
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
        {isRenaming ? (
          <input
            ref={inputRef}
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleInputKeyPress}
            className="mt-2 p-1 text-black rounded w-full"
          />
        ) : (
          <span className="avatar-name">{avatar.name}</span>
        )}
      </div>
    </div>
  );
};

export default AvatarCard;



