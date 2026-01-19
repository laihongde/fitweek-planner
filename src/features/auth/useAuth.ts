import { useContext } from "react";
import { signInWithPopup, signOut } from "firebase/auth";
import { AuthContext } from "../../app/providers/AuthContext";
import { auth, googleProvider } from "./firebase";

export function useAuth() {
  const { user, ready } = useContext(AuthContext);

  const login = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return { user, ready, login, logout };
}
