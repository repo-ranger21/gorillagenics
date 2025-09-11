import { useState, useEffect, createContext, useContext } from 'react';

interface User {
  id: string;
  isAuthenticated: boolean;
}

interface UserContextType {
  user: User | null;
  getUserId: () => string | null;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Generate a consistent client ID similar to server-side logic
function generateClientId(): string {
  // Try to get existing ID from localStorage first
  const existingId = localStorage.getItem('guerilla_user_id');
  if (existingId) {
    return existingId;
  }
  
  // Generate new ID based on browser fingerprint and timestamp
  const userAgent = navigator.userAgent;
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  
  // Create a hash-like ID (simplified)
  const hash = btoa(`${userAgent}-${timestamp}-${random}`).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  const clientId = `temp-${hash}`;
  
  // Store for future use
  localStorage.setItem('guerilla_user_id', clientId);
  return clientId;
}

export function useUser(): UserContextType {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Initialize user on mount
    const userId = generateClientId();
    setUser({
      id: userId,
      isAuthenticated: true, // Consider all users authenticated for now
    });
  }, []);

  const getUserId = (): string | null => {
    return user?.id || null;
  };

  const isAuthenticated = user?.isAuthenticated || false;

  return {
    user,
    getUserId,
    isAuthenticated,
  };
}

// Enhanced hook for getting numeric user ID (for compatibility with existing code)
export function useUserId(): number | null {
  const { getUserId } = useUser();
  const stringId = getUserId();
  
  if (!stringId) return null;
  
  // Convert string ID to numeric for compatibility with existing useSubscription
  // Use a hash of the string ID to get consistent numeric value
  let hash = 0;
  for (let i = 0; i < stringId.length; i++) {
    const char = stringId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash) % 1000000; // Ensure positive number within reasonable range
}