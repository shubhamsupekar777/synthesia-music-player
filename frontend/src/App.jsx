import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Homepage from "./pages/Homepage";
import "./App.css";
import {
  clearError,
  setLoading,
  logout,
  setError,
  setUser,
} from "./redux/slices/authSlice";
import axios from "axios";
import ResetPassword from "./components/auth/ResetPassword";

function App() {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth || {});
  const { token, user } = auth;

  useEffect(() => {
    const storedToken = token || localStorage.getItem("token");
    if (!storedToken || user) return;
    const fetchUser = async () => {
      try {
        dispatch(setLoading(true));
        dispatch(clearError());

        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          },
        );
        dispatch(setUser({ user: res.data, token: storedToken }));
      } catch (error) {
        console.error("getMe failed", error);
        dispatch(logout());
        dispatch(
          setError(
            error?.response?.data?.message ||
              "Session expired.  Please login again",
          ),
        );
      } finally {
        dispatch(setLoading(false));
      }
    };
    fetchUser();
  }, [dispatch, token, user]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Home */}
        <Route path="/" element={<Homepage />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
