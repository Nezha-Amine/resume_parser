import React, { useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import jsonData from "../jsonData.json";
import plusIcon from "../assets/plusIcon.svg";
import minusIcon from "../assets/minusIcon.svg";
import cache from "../assets/cache.png";
import logoNetsense from "../assets/logoNetsense.png";
import html2pdf from "html2pdf.js";

const ResumeBuilder = () => {
  const [personalInfo, setPersonalInfo] = useState({
    name: jsonData.nom_prenom || "",
    jobTitle: jsonData.profil || "",
    expYears: jsonData.annees_d_experience || "",
    workSummary: jsonData.work_summary || "",
  });

  const [education, setEducation] = useState(jsonData.education || []);
  const [experience, setExperience] = useState(jsonData.experience || []);
  const [competences, setCompetences] = useState(jsonData.competences || []);
  const [projets, setProjets] = useState(jsonData.projets || []);

  const handlePersonalInfoChange = (e) => {
    const { id, value } = e.target;
    setPersonalInfo((prevInfo) => ({
      ...prevInfo,
      [id]: value,
    }));
  };

  const handleEducationChange = (index, field, value) => {
    const newEducation = [...education];
    newEducation[index][field] = value;
    setEducation(newEducation);
  };

  const addEducationRow = () => {
    setEducation([...education, { diplome: "", etablissement: "", annee: "" }]);
  };

  const removeEducationRow = () => {
    setEducation(education.slice(0, -1));
  };

  const handleExperienceChange = (index, field, value) => {
    const newExperience = [...experience];
    newExperience[index][field] = value;
    setExperience(newExperience);
  };

  const addExperienceRow = () => {
    setExperience([
      ...experience,
      { start_date: "", end_date: "", poste: "", entreprise: "", taches: [] },
    ]);
  };

  const removeExperienceRow = () => {
    setExperience(experience.slice(0, -1));
  };

  const handleCompetenceChange = (index, value) => {
    const newCompetences = [...competences];
    newCompetences[index] = value;
    setCompetences(newCompetences);
  };
  const handleDownloadPdf = () => {
    const rightSideContent = document.getElementById("pdfContent");

    const opt = {
      margin: 0,
      filename: "resume.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 3, useCORS: true },
      jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
    };

    // Use html2pdf to generate the PDF
    html2pdf().from(rightSideContent).set(opt).save();
  };

  return (
    <div className="text-white font-serif text-lg h-screen overflow-hidden">
      <div className="flex ml-24 h-full">
        {/* Left side - Form Inputs */}
        <div className="h-full overflow-y-auto p-5 bg-nts-dark-green mt-10 rounded-md pb-14 ">
          {/* Personal Information */}
          <div className="personal-info mb-6">
            <h2 className="text-white text-2xl font-semibold mb-4">
              Personal Information
            </h2>
            <input
              type="text"
              id="name"
              value={personalInfo.name}
              onChange={handlePersonalInfoChange}
              placeholder="Nom Prénom"
              className="w-full p-2 mb-4 bg-white text-black border-2 border-white focus:outline-none focus:border-white rounded"
            />
            <input
              type="text"
              id="jobTitle"
              value={personalInfo.jobTitle}
              onChange={handlePersonalInfoChange}
              placeholder="Profil"
              className="w-full p-2 mb-4 bg-white text-black border-2 border-white focus:outline-none focus:border-white rounded"
            />
            <textarea
              id="workSummary"
              value={personalInfo.workSummary}
              onChange={handlePersonalInfoChange}
              placeholder="Résumé"
              className="w-full p-2 mb-4 bg-white text-black border-2 border-white focus:outline-none focus:border-white rounded h-24"
            />
          </div>

          {/* Education */}
          <div className="education mb-6">
            <h2 className="text-white text-2xl font-semibold mb-4">
              Formation
            </h2>
            {education.map((edu, index) => (
              <div key={index} className="education-row mb-4">
                <input
                  type="text"
                  value={edu.diplome}
                  onChange={(e) =>
                    handleEducationChange(index, "diplome", e.target.value)
                  }
                  placeholder="Titre de diplôme"
                  className="w-full p-2 mb-2 bg-white text-black border-2 border-white focus:outline-none focus:border-white rounded"
                />
                <input
                  type="text"
                  value={edu.etablissement}
                  onChange={(e) =>
                    handleEducationChange(
                      index,
                      "etablissement",
                      e.target.value
                    )
                  }
                  placeholder="Nom de l'établissement"
                  className="w-full p-2 mb-2 bg-white text-black border-2 border-white focus:outline-none focus:border-white rounded"
                />
                <input
                  type="text"
                  value={edu.annee}
                  onChange={(e) =>
                    handleEducationChange(index, "annee", e.target.value)
                  }
                  placeholder="Année d'obtention du diplôme"
                  className="w-full p-2 bg-white text-black border-2 border-white focus:outline-none focus:border-white rounded"
                />
              </div>
            ))}
            <div className="flex">
              <img
                src={plusIcon}
                alt="add"
                className="w-10"
                onClick={addEducationRow}
              />

              <img
                src={minusIcon}
                alt="minus"
                className="w-10 ml-4"
                onClick={removeEducationRow}
              />
            </div>
          </div>

          {/* Experience */}
          <div className="experience mb-6">
            <h2 className="text-white text-2xl font-semibold mb-4">
              Experience
            </h2>
            {experience.map((exp, index) => (
              <div key={index} className="experience-row mb-4">
                <input
                  type="text"
                  value={exp.start_date}
                  onChange={(e) =>
                    handleExperienceChange(index, "start_date", e.target.value)
                  }
                  placeholder="Start Date"
                  className="w-full p-2 mb-2 bg-white text-black border-2 border-white focus:outline-none focus:border-white rounded"
                />
                <input
                  type="text"
                  value={exp.end_date}
                  onChange={(e) =>
                    handleExperienceChange(index, "end_date", e.target.value)
                  }
                  placeholder="End Date"
                  className="w-full p-2 mb-2 bg-white text-black border-2 border-white focus:outline-none focus:border-white rounded"
                />
                <input
                  type="text"
                  value={exp.poste}
                  onChange={(e) =>
                    handleExperienceChange(index, "poste", e.target.value)
                  }
                  placeholder="Poste"
                  className="w-full p-2 mb-2 bg-white text-black border-2 border-white focus:outline-none focus:border-white rounded"
                />
                <input
                  type="text"
                  value={exp.entreprise}
                  onChange={(e) =>
                    handleExperienceChange(index, "entreprise", e.target.value)
                  }
                  placeholder="Entreprise"
                  className="w-full p-2 mb-2 bg-white text-black border-2 border-white focus:outline-none focus:border-white rounded"
                />
                <textarea
                  value={exp.taches.join("\n")}
                  onChange={(e) =>
                    handleExperienceChange(
                      index,
                      "taches",
                      e.target.value.split("\n")
                    )
                  }
                  placeholder="Taches"
                  className="w-full p-2 bg-white text-black border-2 border-white focus:outline-none focus:border-white rounded h-24"
                />
              </div>
            ))}

            <div className="flex">
              <img
                src={plusIcon}
                alt="add"
                className="w-10"
                onClick={addExperienceRow}
              />

              <img
                src={minusIcon}
                alt="minus"
                className="w-10 ml-4"
                onClick={removeExperienceRow}
              />
            </div>
          </div>

          {/* Competences */}
          <div className="competences">
            <h2 className="text-white text-2xl font-semibold mb-4">
              Compétences
            </h2>
            {competences.map((comp, index) => (
              <input
                key={index}
                type="text"
                value={comp}
                onChange={(e) => handleCompetenceChange(index, e.target.value)}
                placeholder="Compétence"
                className="w-full p-2 mb-2 bg-white text-black border-2 border-white focus:outline-none focus:border-white rounded"
              />
            ))}
          </div>
        </div>

        {/* Right side - Display Output */}
        <div className="h-full mt-10 overflow-hidden px-8 bg-nts-grey text-black pb-28 pt-8">
          <div
            id="pdfContent"
            className="h-full overflow-y-auto py-8 bg-white text-black"
          >
            {/* Personal Info Display */}
            <div className="flex justify-between items-center mx-10 mt-[-20px]">
              <img src={cache} alt="cache" className="w-32" />
              <img
                src={logoNetsense}
                alt="logoNetsense"
                className="w-40 h-16"
              />
            </div>
            <div className="text-center mb-8">
              <h1 className="font-bold text-2xl mb-1">{personalInfo.name}</h1>
            </div>

            {/* Job Title Container */}
            <div className="bg-gradient-to-r from-[#70c9c1] to-[#4a90e2] text-white p-4 text-center ">
              <h2 className="font-bold text-xl uppercase">
                {personalInfo.jobTitle}
              </h2>
              <p className="font-semibold">
                {personalInfo.expYears > 1
                  ? `Possède plus de ${personalInfo.expYears} ans d'expérience`
                  : `Possède ${personalInfo.expYears} an d'expérience`}
              </p>
            </div>
            <div className="px-24">
              {/* Résumé Professionnel */}
              <div className="mt-8">
                <h3 className="text-nts-text-green font-bold text-xl mb-4">
                  Résumé Professionnel :
                </h3>
                <p className="text-justify text-gray-800">
                  {personalInfo.workSummary}
                </p>
              </div>

              {/* Formation */}
              <div className="mt-8">
                <h3 className="text-nts-text-green font-bold text-xl mb-4">
                  Formation :
                </h3>
                {education.map((edu, index) => (
                  <div key={index} className="mb-4">
                    <h4 className="font-semibold text-gray-900">
                      {edu.diplome}
                    </h4>
                    <p className="text-gray-700">
                      {edu.etablissement} - {edu.annee}
                    </p>
                  </div>
                ))}
              </div>

              {/* Expérience Professionnelle */}
              <div className="mt-8">
                <h3 className="text-nts-text-green font-bold text-xl mb-4">
                  Expérience Professionnelle :
                </h3>
                {experience.map((exp, index) => (
                  <div key={index} className="mb-6">
                    <h4 className="font-semibold text-gray-900">{exp.poste}</h4>
                    <p className="text-gray-700">
                      {exp.entreprise} - {exp.start_date} to {exp.end_date}
                    </p>
                    <ul className="list-disc list-inside ml-4 mt-2 text-gray-800">
                      {exp.taches.map((task, i) => (
                        <li key={i}>{task}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Compétences */}
              <div className="mt-8">
                <h3 className="text-nts-text-green font-bold text-xl mb-4">
                  Compétences :
                </h3>
                <ul className="list-disc list-inside ml-4 text-gray-800">
                  {competences.map((comp, index) => (
                    <li key={index}>{comp}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <button
            onClick={handleDownloadPdf}
            className="text-white bg-nts-green  px-6 py-3 mt-4 rounded-lg "
            type="submit"
          >
            {" "}
            Enregistrer et télécharger
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
