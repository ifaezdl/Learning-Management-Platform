import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import authService from "../services/auth.service";
import userService from "../services/user.service";
import toast from "react-hot-toast";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  mobile?: string;
  avatar?: string | null;
  sexId?: number;
  roleId: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<any>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: Partial<User>) => void;
  loading: boolean;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  mobile: string;
  password: string;
}

interface LoginData {
  userName: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));

    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // --------------------------------------------------
  // Update user everywhere
  // --------------------------------------------------
  const updateUser = useCallback((updatedUser: Partial<User>) => {
    setUser((currentUser) => {
      if (!currentUser) {
        return currentUser;
      }

      const newUser: User = {
        ...currentUser,
        ...updatedUser,
      };

      localStorage.setItem("user", JSON.stringify(newUser));

      return newUser;
    });
  }, []);

  // --------------------------------------------------
  // Initialize authentication
  // --------------------------------------------------
  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");
      const storedUser = localStorage.getItem("user");

      if (!accessToken || !refreshToken || !storedUser) {
        setLoading(false);
        return;
      }

      try {
        if (!isTokenExpired(accessToken)) {
          const parsedUser = JSON.parse(storedUser);

          setUser(parsedUser);

          // Get the complete profile so avatar/mobile/etc.
          // are available even if login only returned basic data.
          try {
            const profile = await userService.getProfile();

            if (profile) {
              const completeUser: User = {
                ...parsedUser,
                id: profile.Id,
                firstName: profile.FirstName,
                lastName: profile.LastName,
                userName: profile.UserName,
                email: profile.Email,
                mobile: profile.Mobile,
                avatar: profile.Avatar,
                sexId: profile.Sex_Id,
                roleId: profile.Role_Id,
              };

              localStorage.setItem("user", JSON.stringify(completeUser));

              setUser(completeUser);
            }
          } catch (profileError) {
            console.error("Could not load complete profile:", profileError);
          }
        } else {
          const response = await authService.refresh(refreshToken);

          const {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            user: refreshedUser,
          } = response;

          localStorage.setItem("accessToken", newAccessToken);
          localStorage.setItem("refreshToken", newRefreshToken);
          localStorage.setItem("user", JSON.stringify(refreshedUser));

          setUser(refreshedUser);

          // Get complete profile after refresh
          try {
            const profile = await userService.getProfile();

            if (profile) {
              const completeUser: User = {
                ...refreshedUser,
                id: profile.Id,
                firstName: profile.FirstName,
                lastName: profile.LastName,
                userName: profile.UserName,
                email: profile.Email,
                mobile: profile.Mobile,
                avatar: profile.Avatar,
                sexId: profile.Sex_Id,
                roleId: profile.Role_Id,
              };

              localStorage.setItem("user", JSON.stringify(completeUser));

              setUser(completeUser);
            }
          } catch (profileError) {
            console.error("Could not load complete profile:", profileError);
          }
        }
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // --------------------------------------------------
  // Login
  // --------------------------------------------------
  const login = useCallback(async (data: LoginData) => {
    const response = await authService.login(data);

    const { accessToken, refreshToken, user: userData } = response;

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(userData));

    setUser(userData);

    // Get complete profile after login
    try {
      const profile = await userService.getProfile();

      if (profile) {
        const completeUser: User = {
          ...userData,
          id: profile.Id,
          firstName: profile.FirstName,
          lastName: profile.LastName,
          userName: profile.UserName,
          email: profile.Email,
          mobile: profile.Mobile,
          avatar: profile.Avatar,
          sexId: profile.Sex_Id,
          roleId: profile.Role_Id,
        };

        localStorage.setItem("user", JSON.stringify(completeUser));

        setUser(completeUser);
      }
    } catch (error) {
      console.error("Could not load complete profile after login:", error);
    }
  }, []);

  // --------------------------------------------------
  // Register
  // --------------------------------------------------
  const register = useCallback(async (data: RegisterData) => {
    return await authService.register(data);
  }, []);

  // --------------------------------------------------
  // Logout
  // --------------------------------------------------
  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch (error) {
      toast.error("Logout failed.");
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
