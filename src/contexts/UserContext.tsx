"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

interface UserContextType {
  userInfo: any;
  credits: number | string;
  subscription: any;
  loading: boolean;
  refetchUserData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [credits, setCredits] = useState<number | string>(0);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchedRef = useRef(false);

  const fetchUserData = async () => {
    if (fetchedRef.current) return; // Prevent double fetch
    fetchedRef.current = true;

    const userId = localStorage.getItem('user_id');
    if (!userId) {
      console.error("User ID not found in localStorage");
      setLoading(false);
      return;
    }

    try {
      const [userResponse, creditsResponse, subscriptionResponse] = await Promise.all([
        fetch(`/api/user?user_id=${userId}`),
        fetch(`/api/credit?user_id=${userId}`),
        fetch(`/api/premium?user_id=${userId}`)
      ]);

      const [userData, creditsData, subscriptionData] = await Promise.all([
        userResponse.json(),
        creditsResponse.json(),
        subscriptionResponse.json()
      ]);

      setUserInfo(userData);
      setCredits(creditsData.amount || 0);
      setSubscription(subscriptionData);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const refetchUserData = async () => {
    setLoading(true);
    await fetchUserData();
  };

  return (
    <UserContext.Provider value={{ userInfo, credits, subscription, loading, refetchUserData }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};