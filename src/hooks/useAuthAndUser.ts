import { useContext, useEffect } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';

export const useAuthAndUser = () => {
  const { isAuthenticated, login, logout } = useContext(AuthContext);
  const { userInfo, credits, subscription, loading, refetchUserData, clearUserData } = useUser();

  useEffect(() => {
    if (isAuthenticated && !userInfo && !loading) {
      refetchUserData();
    }
  }, [isAuthenticated, userInfo, loading, refetchUserData]);

  const combinedLogin = async (token: string) => {
    await login(token);
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