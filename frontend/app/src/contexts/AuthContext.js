import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import axios from "axios";
import BASE_URL from "../config";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setUserData(null);

      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          const res = await axios.get(`${BASE_URL}/user/data`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setUserData(res.data);
        } catch (err) {
          console.error("[AuthContext] Failed to fetch user data:", err);
        }
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserData(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, userData, setUserData, logout, loading }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
