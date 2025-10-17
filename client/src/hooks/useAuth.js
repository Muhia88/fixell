import { useContext } from 'react';
import { AuthContext } from '../components/context/ui/authContextValue';

// Custom hook to use the AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};