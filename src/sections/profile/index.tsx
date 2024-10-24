"use client";

import React, { useState, useEffect, useCallback, useContext } from "react";
import Image from "next/image";
import { UserContext } from "@/provider/UserContext";
import AvatarCard from "./components/AvatarCard";
import { Avatar } from "@/types/type";
import { useRouter } from "next/navigation";
import { useCreateModeStore } from "@/store/createModeStore";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProfileView: React.FC = () => {
  const router = useRouter();
  const { userInfo, loading, isAuthenticated, refetchUserData } =
    useContext(UserContext);
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Message", `Clicked ${localStorage.getItem('provider')} Button`);
    if (!token) {
      router.push("/");
    }
  }, [router]);

  const fetchAvatars = useCallback(async () => {
    if (!isAuthenticated) return;
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

      console.log(data)
      
    } catch (err) {
      console.error("Error fetching avatars:", err);
    } finally {
      setAvatarsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (avatarsLoading) {
      fetchAvatars();
    }
  }, [isAuthenticated, fetchAvatars, avatarsLoading]);

  const handleUpdateBio = async (newBio: string): Promise<void> => {
    setUpdating(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      const response = await fetch("/api/user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bio: newBio }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user data");
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
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      const response = await fetch("/api/user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ profile_image: `${avatarImage}` }),
      });

      console.log(avatarImage)

      if (!response.ok) {
        throw new Error("Failed to update user data");
      }

      refetchUserData();
    } catch (err) {
      console.error("Failed to update profile image:", err);
    } finally {
      setUpdating(false);
    }
  };

  const handleCreateNewAvatar = () => {
    console.log("Message", 'Click Create Avatar Button');
    setCreateMode(true);
    localStorage.setItem('create_mode', 'set')
    router.push("/avatarMode");
  };

  const handleRenameAvatar = async (
    avatarId: number,
    newName: string
  ): Promise<void> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      const response = await fetch(`/api/avatars`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rename: newName, id: avatarId })
      });

      const {message, success } = await response.json();

      console.log(message, success)

      if (success) {
        if (success) {
          toast.success(message);
          setAvatars((prevAvatars) =>
            prevAvatars.map((avatar) =>
              avatar.id === avatarId ? { ...avatar, name: newName } : avatar
            )
          );
        } else {
          toast.error("Failed to delete avatar");
        }
      }
    } catch (err) {
      console.error("Failed to rename avatar:", err);
    }
  };

  const handleDeleteAvatar = async (avatarId: number): Promise<void> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      const response = await fetch(`/api/avatars?id=${avatarId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const {success, message} = await response.json(); // Await the promise

      if (success) {
        toast.success(message);
        setAvatars((prevAvatars) =>
          prevAvatars.filter((avatar) => avatar.id !== avatarId)
        );
      } else {
        toast.error("Failed to delete avatar");
      }
    } catch (err) {
      console.error("Failed to delete avatar:", err);
    }
  };

  const handleEditAvatar = async (avatarId: number): Promise<void> => {
    console.log("AvatarId", avatarId, "UserId", localStorage.getItem('user_id'));
    console.log("token", localStorage.getItem('token'))
    localStorage.setItem('avatar_id', avatarId.toString())
    localStorage.setItem('create_mode', 'unset')
    router.push("/avatarMode");
  }

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Not authenticated</div>;
  if (!userInfo) return <div>No user data available</div>;

  return (
    <div className="p-[25px]">
      <h1 className="text-white text-4xl font-bold mb-8">My Profile</h1>
      <div className="w-full md:w-2/3 bg-gray-800 p-6 rounded-lg shadow-lg mb-4">
        <div className="profile_picture mb-4">
          {userInfo.profile_picture ? (
            <Image
              src={`data:image/jpeg;base64,${userInfo.profile_picture}`}
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
        <p className="text-white text-xl font-bold mb-2">
          {userInfo.name || "Dev Account"}
        </p>
        <p className="text-gray-400 mb-4">{userInfo.email || ""}</p>
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
          <button
            onClick={handleCreateNewAvatar}
            className="bg-blue-standard text-white font-semibold rounded-lg px-4 py-2 transition duration-300"
          >
            Create Avatar
          </button>
        </div>
        {avatarsLoading ? (
          <div className="text-white">Loading avatars...</div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
            {avatars.map((avatar) => (
              <AvatarCard
                key={avatar.id}
                avatar={avatar}
                onSetProfileAvatar={handleSetProfileAvatar}
                onRenameAvatar={handleRenameAvatar}
                onDeleteAvatar={handleDeleteAvatar}
                onEditAvatar={handleEditAvatar}
              />
            ))}
          </div>
        )}
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
      />
    </div>
  );
};

export default ProfileView;
