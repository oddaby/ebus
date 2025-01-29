import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, accessToken, status, error } = useSelector((state) => state.auth);
  
  return {
    user,
    accessToken,
    authStatus: status,
    authError: error,
    isAuthenticated: !!accessToken,
    logout: () => {
      dispatch(logout());
      localStorage.removeItem('accessToken');
    }
  };
};