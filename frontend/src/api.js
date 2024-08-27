// api.js
import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const api = axios.create({
  baseURL: "http://localhost:5000",
});

const useApi = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleTokenExpiration = (error) => {
      if (error.response && error.response.status === 401) {
        navigate("/login");

        if (localStorage.getItem("rememberMe") === "true") {
          localStorage.removeItem("rememberMe");
          localStorage.removeItem("email");
          localStorage.removeItem("password");
        }
      }
      return Promise.reject(error);
    };

    const interceptor = api.interceptors.response.use(
      (response) => response,
      handleTokenExpiration
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [navigate]);

  return api;
};

export default useApi;
