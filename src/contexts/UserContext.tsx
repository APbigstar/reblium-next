'use client';

import React, { createContext, useState, useEffect, useRef, useCallback } from 'react';
import { debounce } from 'lodash';

interface UserContextType {
  userInfo: any | null;
  credits: number | string;
  subscription: any | null;
  loading: boolean;
  refetchUserData: () => Promise<void>;
  clearUserData: () => void;
}

export const UserContext = createContext<UserContextType>({
  userInfo: null,
  credits: 0,
  subscription: null,
  loading: false,
  refetchUserData: async () => {},
  clearUserData: () => {},
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userInfo, setUserInfo] = useState<any | null>(null);
  const [credits, setCredits] = useState<number | string>(0);
  const [subscription, setSubscription] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const fetchPromiseRef = useRef<Promise<void> | null>(null);

  const fetchUserData = useCallback(async (): Promise<void> => {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      console.error("User ID not found in localStorage");
      return;
    }

    if (fetchPromiseRef.current) {
      return fetchPromiseRef.current;
    }

    setLoading(true);
    fetchPromiseRef.current = Promise.all([
      fetch(`/api/user?user_id=${userId}`),
      fetch(`/api/credit?user_id=${userId}`),
      fetch(`/api/premium?user_id=${userId}`)
    ]).then(async ([userResponse, creditsResponse, subscriptionResponse]) => {
      const [userData, creditsData, subscriptionData] = await Promise.all([
        userResponse.json(),
        creditsResponse.json(),
        subscriptionResponse.json()
      ]);

      setUserInfo(userData);
      setCredits(creditsData.amount || 0);
      setSubscription(subscriptionData);
    }).catch(error => {
      console.error("Error fetching user data:", error);
    }).finally(() => {
      setLoading(false);
      fetchPromiseRef.current = null;
    });

    return fetchPromiseRef.current;
  }, []);

  const debouncedFetchUserData = useCallback(
    debounce(() => fetchUserData(), 300, { leading: true, trailing: false }),
    [fetchUserData]
  );

  const refetchUserData = useCallback((): Promise<void> => {
    if (!loading) {
      return debouncedFetchUserData();
    }
    return Promise.resolve();
  }, [debouncedFetchUserData, loading]);

  const clearUserData = useCallback(() => {
    setUserInfo(null);
    setCredits(0);
    setSubscription(null);
    setLoading(false);
    fetchPromiseRef.current = null;
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (userId && !userInfo) {
      refetchUserData();
    }
  }, [userInfo, refetchUserData]);

  return (
    <UserContext.Provider value={{
      userInfo,
      credits,
      subscription,
      loading,
      refetchUserData,
      clearUserData
    }}>
      {children}
    </UserContext.Provider>
  );
};