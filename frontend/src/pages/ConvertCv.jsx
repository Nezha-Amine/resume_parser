import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import useApi from "../api";
import { useNavigate } from "react-router-dom";

function ConvertCv() {
  // Validation schema using Yup
  const validationSchema = Yup.object().shape({
    nom: Yup.string().required("Le nom est requis"),
    prenom: Yup.string().required("Le prénom est requis"),
    profile: Yup.string().required("Le profile est requis"),
    cv: Yup.mixed()
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

  const navigate = useNavigate();

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  const api = useApi();

  const onSubmit = async (data) => {
    const file = data.cv[0];

    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("nom", data.nom);
      formData.append("prenom", data.prenom);
      formData.append("profile", data.profile);
      localStorage.setItem("format", data.format);


      localStorage.setItem('nom' , data.nom);
      localStorage.setItem('prenom',data.prenom);
      localStorage.setItem('profile_to_save', data.profile);

      try {
        const token = localStorage.getItem("token");
        
        // Navigate to /loader immediately
        navigate("/loader");
        
        // Send formData to the /convert endpoint
        const convertResponse = await api.post("/convert", formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          });

          // Check response status and navigate to /Validation
          if (convertResponse.status === 200) {
            const data = convertResponse.data;
            const text = data.text;
            localStorage.setItem('savedText', text);
            localStorage.setItem('mots_cles_mongo' , data.combined_list);
            localStorage.setItem('file_path' , data.file_path);

            navigate("/Validation");
            setTimeout(() => {
              window.location.reload();
          }, 0);
          } else {
            const { error } = convertResponse.data;
            console.log(error);
          }

      } catch (error) {
        console.error("An error occurred:", error);
      }

    } else {
      console.error("No file selected");
    }
  };

  return (
    <div className="z-0 w-[40%] ml-[30%] mt-[10px]">
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold uppercase">
          Convertir un CV
        </h1>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-card-fill rounded-3xl px-6 sm:px-10 pt-6 flex flex-col my-2 bg-[#EBEBEB] shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px] border-table-border mt-8">
          <div className="flex flex-col gap-4">

            <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
              <label
                className="block text-nts-black text-[15px] font-[600] w-full sm:w-1/3"
                htmlFor="nom"
              >
                Nom
              </label>
              <input
                className="w-full sm:w-2/3 appearance-none bg-grey-lighter text-grey-darker border border-table-border rounded-xl py-3 px-4 shadow-[0px_4px_0px_0px_#00000025]"
                id="nom"
                placeholder="Nom"
                {...register("nom")}
              />
            </div>
            {errors.nom && (
              <p className="text-red-500 text-[13px] font-bold italic text-center mb-4">
                {errors.nom.message}
              </p>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
              <label
                className="block text-nts-black text-[15px] font-[600] w-full sm:w-1/3"
                htmlFor="prenom"
              >
                Prénom
              </label>
              <input
                className="w-full sm:w-2/3 appearance-none bg-grey-lighter text-grey-darker border border-table-border rounded-xl py-3 px-4 shadow-[0px_4px_0px_0px_#00000025]"
                id="prenom"
                placeholder="Prénom"
                {...register("prenom")}
              />
            </div>
            {errors.prenom && (
              <p className="text-red-500 text-[13px] font-bold italic text-center mb-4">
                {errors.prenom.message}
              </p>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
              <label
                className="block text-nts-black text-[15px] font-[600] w-full sm:w-1/3"
                htmlFor="profile"
              >
                Profile
              </label>
              <input
                className="w-full sm:w-2/3 appearance-none bg-grey-lighter text-grey-darker border border-table-border rounded-xl py-3 px-4 shadow-[0px_4px_0px_0px_#00000025]"
                id="profile"
                placeholder="Profile"
                {...register("profile")}
              />
            </div>
            {errors.profile && (
              <p className="text-red-500 text-[13px] font-bold italic text-center mb-4">
                {errors.profile.message}
              </p>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
              <label
                className="block text-nts-black text-[15px] font-[600] w-full sm:w-1/3"
                htmlFor="format"
              >
                Format
              </label>
              <select
                className="w-full sm:w-2/3 appearance-none bg-grey-lighter text-grey-darker border border-table-border rounded-xl py-3 px-4 shadow-[0px_4px_0px_0px_#00000025]"
                id="format"
                {...register("format")}
              >
                <option value="" disabled selected>Select Format</option>
                <option value="link4u">Link4U</option>
                <option value="netsene">Netsene</option>
              </select>
            </div>
            {errors.format && (
              <p className="text-red-500 text-[13px] font-bold italic text-center mb-4">
                {errors.format.message}
              </p>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
              <label
                className="block text-nts-black text-[15px] font-[600] w-full sm:w-1/3"
                htmlFor="cv"
              >
                Télécharger CV
              </label>
              <input
                type="file"
                className="w-full sm:w-2/3 appearance-none text-grey-darker border border-table-border"
                id="cv"
                {...register("cv")}
              />
            </div>
            {errors.cv && (
              <p className="text-red-500 text-[13px] font-bold italic text-center mb-4">
                {errors.cv.message}
              </p>
            )}

          </div>

          <div className="flex justify-center mt-16 mb-10">
            <button
              className="text-white bg-nts-dark-green px-6 py-3 rounded-lg"
              type="submit"
            >
              Convertir
            </button>
          </div>
        </div>
      </form>



    </div>
  );
}

export default ConvertCv;
