import { createContext } from "react";
import type { User } from "firebase/auth";

export type AuthCtx = {
  user: User | null;
  ready: boolean;
};

export const AuthContext = createContext<AuthCtx>({
  user: null,
  ready: false,
});
