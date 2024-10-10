// components/ProfileView.tsx

"use client";

import React, { useState, useEffect, useCallback, useContext } from "react";
import Image from "next/image";
import { UserContext } from '@/contexts/UserContext';
import AvatarCard from './components/AvatarCard';
import { Avatar } from '@/types/type';
import { useRouter } from "next/navigation";
import { useCreateModeStore } from "@/store/createModeStore";

const ProfileView: React.FC = () => {
  const router = useRouter();
  const { userInfo, loading, isAuthenticated, refetchUserData } = useContext(UserContext);
  const { isCreateMode } = useCreateModeStore();
  const setCreateMode = useCreateModeStore((state) => state.setCreateMode);
  const [isEditingBio, setIsEditingBio] = useState<boolean>(false);
  const [localBio, setLocalBio] = useState<string>("");
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [updating, setUpdating] = useState<boolean>(false);
  const [avatarsLoading, setAvatarsLoading] = useState(true);

  useEffect(() => {
    if (userInfo) {
      setLocalBio(userInfo.bio || "");
    }
  }, [userInfo]);

  const fetchAvatars = useCallback(async () => {
    setAvatarsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }
      const response = await fetch("/api/avatars", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch avatars");
      }
      const data: Avatar[] = await response.json();
      setAvatars(data);
    } catch (err) {
      console.error("Error fetching avatars:", err);
    } finally {
      setAvatarsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (avatarsLoading) {
      fetchAvatars();
    }
  }, [fetchAvatars, avatarsLoading]);

  const handleUpdateBio = async (newBio: string): Promise<void> => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bio: newBio })
      });

      if (!response.ok) {
        throw new Error('Failed to update user data');
      }

      setLocalBio(newBio);
      setIsEditingBio(false);
      refetchUserData();
    } catch (err) {
      console.error("Failed to update bio:", err);
    } finally {
      setUpdating(false);
    }
  };

  const handleSetProfileAvatar = async (avatarImage: string): Promise<void> => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ profile_image: avatarImage })
      });

      if (!response.ok) {
        throw new Error('Failed to update user data');
      }

      refetchUserData();
    } catch (err) {
      console.error("Failed to update profile image:", err);
    } finally {
      setUpdating(false);
    }
  };

  const handleCreateNewAvatar = () => {
    setCreateMode(true);
    router.push("/avatar");
  };

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Not authenticated</div>;
  if (!userInfo) return <div>No user data available</div>;

  return (
    <div>
      <h1 className="text-white text-4xl font-bold mb-8">My Profile</h1>
      <div className="w-full md:w-2/3 bg-gray-800 p-6 rounded-lg shadow-lg mb-4">
        <div className="profile_picture mb-4">
          {userInfo.profile_image ? (
            <Image
              src={`data:image/jpeg;base64,${userInfo.profile_image}`}
              alt="Profile Avatar"
              width={200}
              height={200}
              className="rounded-full mx-auto"
            />
          ) : (
            <div className="w-48 h-48 bg-gray-600 rounded-full flex items-center justify-center text-gray-400 mx-auto">
              No Avatar Set
            </div>
          )}
        </div>
        <p className="text-white text-xl font-bold mb-2">{userInfo.name || 'Dev Account'}</p>
        <p className="text-gray-400 mb-4">{userInfo.email || ''}</p>
        <div className="mt-4">
          <h3 className="text-white text-xl font-bold mb-2">Bio</h3>
          {isEditingBio ? (
            <>
              <textarea
                value={localBio}
                onChange={(e) => setLocalBio(e.target.value)}
                className="w-full p-2 text-black rounded bg-gray-200"
                rows={4}
              />
              <button
                onClick={() => handleUpdateBio(localBio)}
                disabled={updating}
                className="bg-green-500 text-white font-semibold rounded-lg px-4 py-2 mt-2 hover:bg-green-600 transition duration-300"
              >
                {updating ? "Saving..." : "Save Bio"}
              </button>
            </>
          ) : (
            <>
              <p className="text-gray-300">{localBio || "No bio set"}</p>
              <button
                onClick={() => setIsEditingBio(true)}
                className="bg-blue-standard text-white font-semibold rounded-lg px-4 py-2 mt-2 transition duration-300"
              >
                Edit Bio
              </button>
            </>
          )}
        </div>
      </div>
      <div className="w-full bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center">
          <h2 className="text-white text-2xl font-bold mb-4">My Avatars</h2>
          <button onClick={handleCreateNewAvatar} className="bg-blue-standard text-white font-semibold rounded-lg px-4 py-2 transition duration-300">
            Create Avatar
          </button>
        </div>
        {avatarsLoading ? (
          <div>Loading avatars...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {avatars.map((avatar) => (
              <AvatarCard
                key={avatar.id}
                avatar={avatar}
                onSetProfileAvatar={handleSetProfileAvatar}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileView;