'use client';

import React, { createContext, useState, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname } from 'next/navigation';

interface UserContextType {
  userInfo: any | null;
  credits: number | string;
  subscription: any | null;
  loading: boolean;
  isAuthenticated: boolean;
  refetchUserData: () => Promise<void>;
  clearUserData: () => void;
  login: (token: string) => void;
  logout: () => void;
}

export const UserContext = createContext<UserContextType>({
  userInfo: null,
  credits: 0,
  subscription: null,
  loading: false,
  isAuthenticated: false,
  refetchUserData: async () => {},
  clearUserData: () => {},
  login: () => {},
  logout: () => {},
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userInfo, setUserInfo] = useState<any | null>(null);
  const [credits, setCredits] = useState<number | string>(0);
  const [subscription, setSubscription] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Add this line to prevent double fetching
  const initialFetchDone = useRef(false);

  const fetchUserData = useCallback(async (): Promise<void> => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    try {
      const [userResponse, creditsResponse, subscriptionResponse] = await Promise.all([
        fetch("/api/user", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/credit", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/premium", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const [userData, creditsData, subscriptionData] = await Promise.all([
        userResponse.json(),
        creditsResponse.json(),
        subscriptionResponse.json(),
      ]);
      console.log("Fetched user data:", userData);
      setUserInfo(userData);
      setCredits(creditsData.amount || 0);
      setSubscription(subscriptionData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback((token: string) => {
    localStorage.setItem('token', token);
    fetchUserData();
    router.push('/profile');
  }, [fetchUserData, router]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_id');
    clearUserData();
    setIsAuthenticated(false);
    router.push('/');
  }, [router]);

  const clearUserData = useCallback(() => {
    setUserInfo(null);
    setCredits(0);
    setSubscription(null);
    setLoading(false);
    setIsAuthenticated(false);
  }, []);

  const checkTokenValidity = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsAuthenticated(false);
      setLoading(false);
      return false;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiration = payload.exp * 1000; // Convert to milliseconds
      if (Date.now() >= expiration) {
        console.log('Token expired');
        logout();
        return false;
      } else {
        setIsAuthenticated(true);
        return true;
      }
    } catch (error) {
      console.error('Invalid token', error);
      logout();
      return false;
    }
  }, [logout]);

  useEffect(() => {
    const initialize = async () => {
      if (initialFetchDone.current) return;
      setLoading(true);
      const isValid = checkTokenValidity();
      if (isValid) {
        await fetchUserData();
      }
      setLoading(false);
      initialFetchDone.current = true;
    };

    initialize();
  }, [checkTokenValidity, fetchUserData]);

  useEffect(() => {
    const interval = setInterval(checkTokenValidity, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [checkTokenValidity]);

  useEffect(() => {
    if (!loading && !isAuthenticated && pathname !== '/') {
      router.push('/');
    }
  }, [loading, isAuthenticated, pathname, router]);

  if (loading) {
    return <div>Loading...</div>; // Or a more sophisticated loading component
  }

  return (
    <UserContext.Provider
      value={{
        userInfo,
        credits,
        subscription,
        loading,
        isAuthenticated,
        refetchUserData: fetchUserData,
        clearUserData,
        login,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};