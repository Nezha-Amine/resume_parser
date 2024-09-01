import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import add from "../assets/add.svg";
import useApi from "../api";
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function SearchProfile() {
  const [skills, setSkills] = useState([]);
  const [inputValue, setInputValue] = useState("");

  // Validation schema using Yup
  const validationSchema = Yup.object().shape({
    profile: Yup.string().required("le profile est requis"),
  });

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
  });
  const api = useApi();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    const searchData = {
      profile: data.profile,
      skills: skills,
    };
    const token = localStorage.getItem("token");
  
    try {
      // Send searchData to the /search endpoint
      const searchResponse = await api.post("/search", searchData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      let res = []
      if (searchResponse.data){
        res  = searchResponse.data;
      }else{
        res = [];
      }
      localStorage.setItem('profil', data.profile);
      localStorage.setItem('skills', skills);

      navigate('/ResultSearch', { state: res });

    } catch (error) {
      console.error("Search failed:", error);
    }
  };
  

  const handleAddSkill = () => {
    if (inputValue.trim() && skills.length < 3) {
      setSkills([...skills, inputValue.trim()]);
      setInputValue("");
    }
  };

  const handleRemoveSkill = (indexToRemove) => {
    setSkills(skills.filter((_, index) => index !== indexToRemove));
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  return (
    <div className="z-0 w-[40%] ml-[30%] mt-[10px]">
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold uppercase">
          Chercher un profile
        </h1>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-card-fill rounded-3xl px-10 pt-6 flex flex-col my-2 bg-[#EBEBEB] shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px] border-table-border mt-8">
          <div className="flex flex-col mb-4">
            <div className="flex items-center justify-center mb-4">
              <label
                className="block tracking-wide text-nts-black text-[15px] font-[600] mr-4"
                htmlFor="profile"
              >
                Profile
              </label>
              <input
                className="ml-12 appearance-none w-full bg-grey-lighter text-grey-darker border border-table-border rounded-xl py-3 px-4 shadow-[0px_4px_0px_0px_#00000025]"
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

            <div className="flex items-center justify-center mb-4">
              <label
                className="block tracking-wide text-nts-black text-[15px] font-[600] mr-4"
                htmlFor="skill"
              >
                Compétences
              </label>
              <input
                className="appearance-none w-full bg-grey-lighter text-grey-darker border border-table-border rounded-xl py-3 px-4 shadow-[0px_4px_0px_0px_#00000025]"
                id="skill"
                placeholder="Compétences"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
              />
              <img
                src={add}
                className={`w-12 h-12 ml-4 cursor-pointer ${
                  skills.length < 3 ? "opacity-100" : "opacity-10"
                }`}
                onClick={handleAddSkill}
                alt="Add Skill"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {skills.map((skill, index) => (
              <div
                key={index}
                className="flex items-center bg-nts-black rounded-full px-4 py-2 text-sm text-white"
              >
                {skill}
                <span
                  className="ml-2 text-red-500 cursor-pointer"
                  onClick={() => handleRemoveSkill(index)}
                >
                  ×
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-16 mb-10">
            <button
              className="text-white bg-nts-green mb-4 px-6 py-3 mt-4 rounded-lg"
              type="submit"
            >
              Chercher
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default SearchProfile;
