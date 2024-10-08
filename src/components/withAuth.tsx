import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthAndUser } from '@/hooks/useAuthAndUser';

const withAuth = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  return (props: P) => {
    const { isAuthenticated } = useAuthAndUser();
    const router = useRouter();

    useEffect(() => {
      if (!isAuthenticated) {
        router.push('/');
      }
    }, [isAuthenticated, router]);

    if (!isAuthenticated) {
      return null; // or a loading spinner
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;