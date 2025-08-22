// frontend/components/AuthContext.jsx
import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // prevents redirect flicker

  // Base URL of your Flask backend
  const API_BASE_URL = "http://127.0.0.1:5000";

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      // Attach token globally
      axios.defaults.headers.common["Authorization"] = `Bearer ${parsedUser.token}`;
    }
    setLoading(false);
  }, []);

  // Login function
// frontend/components/AuthContext.jsx
const login = async (email, password) => {
  try {
    const { data } = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email,
      password,
    });

    setUser(data);
    localStorage.setItem("user", JSON.stringify(data));

    axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

    return data; // ✅ return user data so Login.jsx can use role
  } catch (err) {
    console.error("Login error:", err.response || err);
    throw err; // only throw if request truly failed
  }
};



  // Signup function
const signup = async ({ name, email, password, role, contact, districtPreferences }) => {
  try {
    const { data } = await axios.post(`${API_BASE_URL}/api/auth/register`, {
      name,
      email,
      password,
      role,
      contact,
      districtPreferences,
    });

    setUser(data);
    localStorage.setItem("user", JSON.stringify(data));

    axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
  } catch (err) {
    console.error("Signup error:", err.response || err);
    throw err;
  }
};


  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
