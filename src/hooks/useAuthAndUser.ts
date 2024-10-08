"use client";

import { useContext, useEffect } from "react";
import { AuthContext } from "@/contexts/AuthContext";
import { UserContext } from "@/contexts/UserContext";

export const useAuthAndUser = () => {
  const { isAuthenticated, login, logout } = useContext(AuthContext);
  const { userInfo, credits, subscription, loading, refetchUserData, clearUserData } = useContext(UserContext);

  useEffect(() => {
    if (isAuthenticated && !userInfo && !loading) {
      refetchUserData();
    }
  }, [isAuthenticated, userInfo, loading, refetchUserData]);

  const combinedLogin = async (token: string) => {
    login(token);
    await refetchUserData();
  };

  const combinedLogout = () => {
    logout();
    clearUserData();
  };

  return {
    userInfo,
    credits,
    subscription,
    loading,
    isAuthenticated,
    login: combinedLogin,
    logout: combinedLogout,
    refetchUserData,
  };
};