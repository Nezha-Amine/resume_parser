import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useApi from "../api";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import bgImage from "../assets/bgImage.png";
import logoNetsense from "../assets/logoNetsense.png";
import logoImage from "../assets/logoImage.png";

// Validation schema
const schema = yup.object({
  email: yup.string().email("L'email est invalide").required("L'email est requis"),
  password: yup.string().required("Le mot de passe est requis"),
});

const Login = () => {
  const api = useApi();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onSubmit",
    resolver: yupResolver(schema),
  });

  const submitForm = useCallback(async (values) => {
    try {
      const response = await api.post("/login", values);

      const { token, role, userId, email } = response.data;

      login(token, role, userId, email, rememberMe);

      navigate("/chercherProfile");
    } catch (error) {
      // Handle API error more explicitly
      setErrorMessage("Email ou mot de passe incorrecte");
    }
  }, [api, login, navigate, rememberMe]);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="rounded-lg shadow-lg flex w-full max-w-4xl">
        <div className="w-1/2 p-8 relative bg-gray-100 bg-opacity-10 backdrop-blur-lg rounded-l-lg">
          <h1 className="text-4xl font-bold text-white mb-4 text-center mt-10">
            Welcome back!
          </h1>
          <form className="mt-16" onSubmit={handleSubmit(submitForm)}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-white ml-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="username@gmail.com"
                className="w-full mt-2 p-2 bg-white border border-gray-300 rounded-lg text-nts-black"
                {...register("email")}
              />
              {errors.email && (
                <span className="text-red-500 text-center block">
                  {errors.email.message}
                </span>
              )}
            </div>
            <div className="mb-6">
              <label htmlFor="password" className="block text-white ml-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                placeholder="Password"
                className="w-full mt-2 p-2 bg-white border border-gray-300 rounded-lg text-nts-black"
                {...register("password")}
              />
              {errors.password && (
                <span className="text-red-500 text-center block">
                  {errors.password.message}
                </span>
              )}
            </div>
            {errorMessage && (
              <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
            )}
            <button
              type="submit"
              className="w-full bg-nts-green text-white py-2 rounded-lg hover:bg-[#77b815] transition duration-200 font-bold"
              disabled={isSubmitting}
            >
              Login
            </button>
            <div className="relative mt-[10px] text-center">
              <input
                type="checkbox"
                name="remember"
                id="remember"
                className="inline-block align-middle"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label
                className="inline-block align-middle ml-2 text-white"
                htmlFor="remember"
              >
                Remember me
              </label>
            </div>
          </form>
        </div>

        <div className="bg-white w-1/2 relative flex items-center justify-center p-8 rounded-r-lg">
          <img
            src={logoNetsense}
            alt="NetSense Illustration"
            className="absolute w-[90%] h-auto top-2"
          />
          <img
            src={logoImage}
            alt="Logo Image"
            className="max-w-full h-auto mt-24"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
