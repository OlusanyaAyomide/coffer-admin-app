import { useContext } from 'react';
import UserListContext from './UserListContext';

export default function useUserListContext() {
  const context = useContext(UserListContext);
  if (!context) {
    throw new Error('useUserListContext must be used within a UserListContextProvider');
  }
  return context;
}
