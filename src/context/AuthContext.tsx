import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig'; // Your firebaseConfig file

// Create the context
const AuthContext = createContext(null);

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); // To indicate if auth state is still being loaded

  useEffect(() => {
    // This listener runs once when the component mounts
    // and whenever the authentication state changes.
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      setLoading(false); // Auth state has been determined
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    loading, // Expose loading state
    // You can also add login/logout functions here if you prefer
    // login: (email, password) => signInWithEmailAndPassword(auth, email, password),
    // logout: () => signOut(auth)
  };

  // Only render children when the auth state has been loaded
  return (
    <AuthContext.Provider value={value}>
      {!loading && children} {/* Render children only when not loading */}
    </AuthContext.Provider>
  );
};