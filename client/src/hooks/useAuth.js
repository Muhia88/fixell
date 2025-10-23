import { useContext } from 'react';
import { AuthContext } from '../components/context/ui/authContextValue';

export const useAuth = () => {
  return useContext(AuthContext);
};