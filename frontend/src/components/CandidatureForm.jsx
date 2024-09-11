import React, { useState, useCallback } from "react";
import useApi from "../api";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import bgImage from "../assets/bgImage.png";
import logoNetsense from "../assets/logoNetsense.png";

// Validation schema
const schema = yup.object({
  email: yup.string().email("L'email est invalide").required("L'email est requis"),
  password: yup.string().required("Le mot de passe est requis"),
  nom: yup.string().required("Le nom est requis"),
  prenom: yup.string().required("Le prénom est requis"),
  telephone: yup
    .string()
    .matches(/^[0-9]{10}$/, "Le numéro de téléphone doit être composé de 10 chiffres")
    .required("Le numéro de téléphone est requis"),
  profil: yup.string().required("Le profil est requis"),
  resume:  yup.mixed()
    .required("Le CV est requis")
    .test("fileType", "Le format du fichier n'est pas supporté", (value) => {
        return (
        value &&
        [
            "application/pdf",
            "application/msword",
            "image/jpeg",
            "image/png",
        ].includes(value[0]?.type)
        );
    }),
});

const Login = () => {
  const api = useApi();
  const [overlayMessage, setOverlayMessage] = useState("");
  const [showOverlay, setShowOverlay] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onSubmit",
    resolver: yupResolver(schema),
  });

  const submitForm = useCallback(
    async (values) => {
      try {
        const formData = new FormData();
        formData.append("email", values.email);
        formData.append("nom", values.nom);
        formData.append("prenom", values.prenom);
        formData.append("telephone", values.telephone);
        formData.append("profil", values.profil);
        formData.append("resume", values.resume[0]);
       
        const response = await api.post("/save", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        if (response.status === 409) {
            setOverlayMessage("Cette candidature existe déjà");
            setShowOverlay(true);
          } else if (response.status === 201) {
            setOverlayMessage("Candidature envoyée avec succès");
            setShowOverlay(true);
          }


      } catch (error) {
      }
    },
  );

  return (
    <div
            className={`min-h-screen flex items-center justify-center relative ${showOverlay ? "opacity-50" : ""}`}
            style={{
                backgroundImage: `url(${bgImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
            >
      <div className="rounded-lg shadow-lg mt-4 mb-4 w-[40%] max-w-3xl bg-white bg-opacity-80">
        <div className="w-full p-8 relative rounded-lg">
        <div className="flex justify-center mb-6">
            <img src={logoNetsense} alt="Logo" className="h-16" />
        </div>
          <h1 className="text-4xl font-bold text-center mb-6">
            Candidature Form
          </h1>
          <form className="mt-6 " onSubmit={handleSubmit(submitForm)}>
          

            {/* Nom Field */}
            <div className="mb-4">
                <div className="mb-4 flex items-center">
                    <label htmlFor="nom" className="block text-gray-700 ml-2  w-1/4">
                        Nom
                    </label>
                    <input
                        type="text"
                        id="nom"
                        placeholder="Entrez votre nom"
                        className="w-3/4 mt-2 p-2 bg-white border border-gray-300 rounded-lg"
                        {...register("nom")}
                    />
                </div>
                {errors.nom && (
                    <span className="text-red-500 ml-3 text-sm block">
                    {errors.nom.message}
                    </span>
                )}
            </div>

            {/* Prenom Field */}
            <div className="mb-4">
                <div className="mb-4 flex items-center">
                    <label htmlFor="prenom" className="block text-gray-700 ml-2  w-1/4">
                        Prénom
                    </label>
                    <input
                        type="text"
                        id="prenom"
                        placeholder="Entrez votre prénom"
                        className=" w-3/4 mt-2 p-2 bg-white border border-gray-300 rounded-lg"
                        {...register("prenom")}
                    />
                </div>
                {errors.prenom && (
                    <span className="text-red-500 ml-3 text-sm block">
                    {errors.prenom.message}
                    </span>
                )}
            </div>

            {/* Email Field */}
            <div className="mb-4 ">
                <div className="mb-4 flex items-center">
                    <label htmlFor="email" className="block text-gray-700 ml-2  w-1/4">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        placeholder="username@gmail.com"
                        className=" w-3/4 mt-2 p-2 bg-white border border-gray-300 rounded-lg"
                        {...register("email")}
                    />
                </div>
                {errors.email && (
                    <span className="text-red-500 ml-3 text-sm block">
                    {errors.email.message}
                    </span>
                )}
            </div>

            {/* Telephone Field */}
            <div className="mb-4 ">
                <div className="flex items-center">
                    <label htmlFor="telephone" className="block text-gray-700 ml-2  w-1/4">
                        tél.
                    </label>
                    <input
                        type="tel"
                        id="telephone"
                        placeholder="0601020304"
                        className=" w-3/4 mt-2 p-2 bg-white border border-gray-300 rounded-lg"
                        {...register("telephone")}
                    />
                </div>
                {errors.telephone && (
                    <span className="text-red-500 text-sm ml-3 block">
                    {errors.telephone.message}
                    </span>
                )}
            </div>
            {/* Profil Field */}
            <div className="mb-4">
                <div className="mb-4 flex items-center">
                    <label htmlFor="profil" className="block text-gray-700 ml-2  w-1/4">
                        Profil
                    </label>
                    <input
                        id="profil"
                        placeholder="Profil"
                        className=" w-3/4 mt-2 p-2 bg-white border border-gray-300 rounded-lg"
                        {...register("profil")}
                    >
                    </input>
                </div>
                {errors.profil && (
                    <span className="text-red-500 ml-3 text-sm block">
                    {errors.profil.message}
                    </span>
                )}
            </div>
            {/* Resume Field */}
            <div className="mb">
                <div className="mb-4 flex items-center">
                    <label htmlFor="resume" className="block text-gray-700 ml-2  w-1/4">
                        CV
                    </label>
                    <input
                        type="file"
                        id="resume"
                        className=" w-3/4 mt-2 p-2 bg-white border border-gray-300 rounded-lg"
                        {...register("resume")}
                    />
                </div>
                {errors.resume && (
                    <span className="text-red-500 ml-3 text-sm block">
                    {errors.resume.message}
                    </span>
                )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-nts-green text-white py-2 rounded-lg hover:bg-[#77b815] transition duration-200 font-bold"
              disabled={isSubmitting}
            >
              Soumettre
            </button>
          </form>
        </div>
      </div>

       {/* Overlay for status messages */}
      {showOverlay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <p className="text-xl font-bold mb-4">{overlayMessage}</p>
            <button
              className="bg-nts-green text-white py-2 px-4 rounded-lg hover:bg-[#77b815] transition duration-200"
              onClick={() => setShowOverlay(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
