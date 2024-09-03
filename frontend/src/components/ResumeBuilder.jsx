import React, { useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import jsonData from "../../../backend/jsonData.json";
import plusIcon from "../assets/plusIcon.svg";
import minusIcon from "../assets/minusIcon.svg";
import cache from "../assets/cache.png";
import logoNetsense from "../assets/logoNetsense.png";
import logolink4u from "../assets/link4u.png" ;
import html2pdf from "html2pdf.js";
import { FaRedo } from "react-icons/fa";
import useApi from "../api";
import { useNavigate } from "react-router-dom";
import  { useRef } from "react";
import { useReactToPrint } from 'react-to-print';

const ResumeBuilder = () => {
  let jsonString = jsonData.data;
  jsonString = jsonString[0][0];

  const Data = JSON.parse(jsonString);

  // Ensure these fields are arrays if they exist, otherwise default to an empty array
  const projetsData = Array.isArray(Data.projets) ? Data.projets : [];
  const educationData = Array.isArray(Data.education) ? Data.education : [];
  const experienceData = Array.isArray(Data.experience) ? Data.experience : [];
  const competencesData = Array.isArray(Data.competences) ? Data.competences : [];
  const languesData = Array.isArray(Data.langues) ? Data.langues : [];
  const certificationsData = Array.isArray(Data.certifications) ? Data.certifications : [];
  console.log(projetsData);
  // Convert taches and technologies to arrays if they aren't already
  projetsData.forEach((projet) => {
    projet.taches = Array.isArray(projet.taches) ? projet.taches : [];
    projet.technologies = Array.isArray(projet.technologies) ? projet.technologies : [];
  });

  const [personalInfo, setPersonalInfo] = useState({
    name: Data.nom_prenom || "",
    jobTitle: Data.profil || "",
    expYears: Data.annees_d_experience || "",
    workSummary: Data.work_summary || "",
  });

  const [education, setEducation] = useState(educationData);
  const [experience, setExperience] = useState(experienceData);
  const [competences, setCompetences] = useState(competencesData);
  const [projets, setProjets] = useState(projetsData);
  const [langues, setLangues] = useState(languesData);
  const [certifications, setCertifications] = useState(certificationsData);
  const [tasks, setTasks] = useState('');
  
  const format = localStorage.getItem("format");

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
  
  const handleExperienceChangeTasks = (index,value) => {
    const newExperience = [...experience];
    newExperience[index]["taches"] = value
      .split('\n')
      .map(tache => tache.replace(/^-+\s*/, ''));           
    setExperience(newExperience);
    console.log(experience[index]['taches']);

  }
  
  const handleExperienceChange = (index, field, value) => {
    const newExperience = [...experience];
    if (field === "taches") {
      
    } else {
      newExperience[index][field] = value;
    }
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

  const handleProjetChange = (index, field, value) => {
    const newProjets = [...projets];
    newProjets[index][field] = value;
    setProjets(newProjets);
  };

  const addTechnology = (index, technology) => {
    const newProjets = [...projets];
    if (technology.trim()) {
      newProjets[index].technologies.push(technology.trim());
      setProjets(newProjets);
    }
  };

  const removeTechnology = (index, technologyIndex) => {
    const newProjets = [...projets];
    newProjets[index].technologies = newProjets[index].technologies.filter(
      (_, i) => i !== technologyIndex
    );
    setProjets(newProjets);
  };

  const addProjetRow = () => {
    setProjets([
      ...projets,
      { date: "", titre_projet: "", taches: [], technologies: [] },
    ]);
  };

  const removeProjetRow = () => {
    setProjets(projets.slice(0, -1));
  };

  const addSkillRow = () => {
    setCompetences([...competences, [""]]);
  }

  const removeSkillRow  = () => {
    setCompetences(competences.slice(0, -1));
  };

  const componentRef = useRef();
  
  const handleDownloadPdf = () => {
    const pdfOptions = {
      margin: [0, 0, 40, 0],
      filename: "resume.pdf",
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };
    
    // Generate PDF from the HTML element
    html2pdf().from(componentRef.current).set(pdfOptions).save();
    };
  
  

 


  const handleCertificationChange = (index, field, value) => {
    const newCertifications = [...certifications];
    newCertifications[index][field] = value;
    setCertifications(newCertifications);
  };
  const addCertificationRow = () => {
    setCertifications([
      ...certifications,
      { nom: "", date: "", score: "", organisme: "" },
    ]);
  };

  const removeCertificationRow = () => {
    setCertifications(certifications.slice(0, -1));
  };

  const addLangueRow = () => {
    setLangues([...langues, ""]); // Add an empty string to create a new row
  };

  const removeLangueRow = () => {
    setLangues(langues.slice(0, -1));
  };
  const handleLanguesChange = (index, value) => {
    const newLangue = [...langues];
    newLangue[index] = value;
    setLangues(newLangue);
  };

  
  
  // const handleAlert = () => {
  //   alert("Please save the pdf in the path: C:\\Users\\hp\\resume_parser1\\backend1\\cv_convertits");
  // };
  // const handleDownloadPdf = () => {
  //   // const rightSideContent = document.getElementById("pdfContent");

  //   // const opt = {
  //   //   margin: 0,
  //   //   filename: "resume.pdf",
  //   //   image: { type: "jpeg", quality: 0.98 },
  //   //   html2canvas: { scale: 3, useCORS: true },
  //   //   jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
  //   // };

  //   // // Use html2pdf to generate the PDF
  //   // html2pdf().from(rightSideContent).set(opt).save();
    
   
  // };
  const api = useApi();
  const navigate = useNavigate();

  const handleRefresh = async() => {
    try {
      const token = localStorage.getItem("token");
      const text = localStorage.getItem('savedText');
      const formData = {
        text: text,
      };
      navigate("/loader");
      
      // Send formData to the /convert endpoint
      const convertResponse = await api.post("/regenerate", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
      });

        // Check response status and navigate to /Validation
        if (convertResponse.status === 200) {
          
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

  };

  return (
    <div className="text-white font-serif text-lg h-screen overflow-hidden w-full">
      <div className="flex ml-24 h-full">
        {/* Left side - Form Inputs */}
        <div className="h-full w-[35%] overflow-y-auto p-5 bg-nts-dark-green mt-10 rounded-md pb-14 ">
          <div className="flex justify-end mb-4">
            <button
              onClick={handleRefresh}
              className="text-white hover:text-gray-300 transition duration-300"
            >
              <FaRedo size={24} />
            </button>
          </div>
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
                  className="w-full p-2 bg-white mb-4 text-black border-2 border-white focus:outline-none focus:border-white rounded"
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
                <div className="flex space-x-2">
                    <input
                      type="text"
                      value={exp.start_date}
                      onChange={(e) =>
                        handleExperienceChange(index, "start_date", e.target.value)
                      }
                      placeholder="Date de début"
                      className="w-full p-2 mb-2 bg-white text-black border-2 border-white focus:outline-none focus:border-white rounded"
                    />
                    <input
                      type="text"
                      value={exp.end_date}
                      onChange={(e) =>
                        handleExperienceChange(index, "end_date", e.target.value)
                      }
                      placeholder="Date de fin"
                      className="w-full p-2 mb-2 bg-white text-black border-2 border-white focus:outline-none focus:border-white rounded"
                    />
                </div>
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
                  className="w-full p-2 bg-white mb-2 text-black border-2 border-white focus:outline-none focus:border-white rounded"
                />
               <textarea
                  id="taches_exp"
                  value={exp.taches.map(tache => `- ${tache}`).join('\n')}
                  onChange={(e) =>
                    handleExperienceChangeTasks(index,e.target.value)
                  }
                  placeholder="Description"
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
          <div className="competences mb-6">
            <h2 className="text-white text-2xl font-semibold mb-4">
              Compétences
            </h2>
            {competences.map((comp, index) => (
              <div key={index} className="competence-row mb-4">
                <input
                  type="text"
                  value={comp}
                  onChange={(e) =>
                    handleCompetenceChange(index, e.target.value)
                  }
                  placeholder="Compétence"
                  className="w-full p-2 bg-white text-black border-2 border-white focus:outline-none focus:border-white rounded"
                />
              </div>
            ))}
            <div className="flex">
              <img
                src={plusIcon}
                alt="add"
                className="w-10"
                onClick={addSkillRow}
              />
              <img
                src={minusIcon}
                alt="minus"
                className="w-10 ml-4"
                onClick={removeSkillRow}
              />
            </div>
          </div>

          {/* Projets */}
          {projets.length > 0 && (
            <div className="projets mb-6">
              <h2 className="text-white text-2xl font-semibold mb-4">
                Projets
              </h2>
              {projets.map((projet, index) => (
                <div key={index} className="projet-row mb-4">
                  <input
                    type="text"
                    value={projet.titre_projet}
                    onChange={(e) =>
                      handleProjetChange(index, "titre_projet", e.target.value)
                    }
                    placeholder="Titre du projet"
                    className="w-full p-2 mb-2 bg-white text-black border-2 border-white focus:outline-none focus:border-white rounded"
                  />
                  <textarea
                    value={projet.taches.join("\n")}
                    onChange={(e) =>
                      handleProjetChange(
                        index,
                        "taches",
                        e.target.value.split("\n")
                      )
                    }
                    placeholder="Tâches"
                    className="w-full p-2 bg-white text-black border-2 border-white focus:outline-none focus:border-white rounded h-24"
                  />

                  {/* Add technologies section */}
                  <div className="mb-4">
                    <h3 className="text-white text-xl font-semibold mb-2">
                      Technologies
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {(Array.isArray(projet.technologies)
                        ? projet.technologies
                        : projet.technologies.split(",")
                      ).map((tech, techIndex) => (
                        <div
                          key={techIndex}
                          className="flex items-center bg-nts-black rounded-full px-4 py-2 text-sm text-white"
                        >
                          {tech.trim()}
                          <span
                            className="ml-2 text-red-500 cursor-pointer"
                            onClick={() => removeTechnology(index, techIndex)}
                          >
                            ×
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Input for adding new technologies */}
                    <div className="flex items-center mb-4">
                      <input
                        type="text"
                        placeholder="Add technology"
                        className="p-2 bg-white text-black border-2 border-white rounded"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addTechnology(index, e.target.value);
                            e.target.value = "";
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex">
                <img
                  src={plusIcon}
                  alt="add"
                  className="w-10"
                  onClick={addProjetRow}
                />
                <img
                  src={minusIcon}
                  alt="minus"
                  className="w-10 ml-4"
                  onClick={removeProjetRow}
                />
              </div>
            </div>
          )}

          {/* Certifications */}
          {certifications.length > 0 && (
            <div className="certifications mb-6">
              <h2 className="text-white text-2xl font-semibold mb-4">
                Certifications
              </h2>
              {certifications.map((cert, index) => (
                <div key={index} className="certification-row mb-4">
                  <input
                    type="text"
                    value={cert.nom}
                    onChange={(e) =>
                      handleCertificationChange(index, "nom", e.target.value)
                    }
                    placeholder="Nom de la certification"
                    className="w-full p-2 mb-2 bg-white text-black border-2 border-white focus:outline-none focus:border-white rounded"
                  />
                  <input
                    type="text"
                    value={cert.date}
                    onChange={(e) =>
                      handleCertificationChange(index, "date", e.target.value)
                    }
                    placeholder="Date d'obtention (format dd/mm/yyyy ou mm/yyyy)"
                    className="w-full p-2 mb-2 bg-white text-black border-2 border-white focus:outline-none focus:border-white rounded"
                  />
                  <input
                    type="text"
                    value={cert.score}
                    onChange={(e) =>
                      handleCertificationChange(index, "score", e.target.value)
                    }
                    placeholder="Score obtenu (si applicable)"
                    className="w-full p-2 mb-2 bg-white text-black border-2 border-white focus:outline-none focus:border-white rounded"
                  />
                  <input
                    type="text"
                    value={cert.organisme}
                    onChange={(e) =>
                      handleCertificationChange(
                        index,
                        "organisme",
                        e.target.value
                      )
                    }
                    placeholder="Organisme de délivrance"
                    className="w-full p-2 bg-white text-black border-2 border-white focus:outline-none focus:border-white rounded"
                  />
                </div>
              ))}
              <div className="flex">
                <img
                  src={plusIcon}
                  alt="add"
                  className="w-10"
                  onClick={addCertificationRow}
                />
                <img
                  src={minusIcon}
                  alt="minus"
                  className="w-10 ml-4"
                  onClick={removeCertificationRow}
                />
              </div>
            </div>
          )}


          {/* Langues */}
          <div className=" mb-6">
            <h2 className="text-white text-2xl font-semibold mb-4">Langues</h2>
            {langues.map((lg, index) => (
              <div key={index} className="mb-4">
                <input
                  type="text"
                  value={lg}
                  onChange={(e) => handleLanguesChange(index, e.target.value)}
                  placeholder="Langue"
                  className="w-full p-2 bg-white text-black border-2 border-white focus:outline-none focus:border-white rounded"
                />
              </div>
            ))}
          </div>
          <div className="flex">
            <img
              src={plusIcon}
              alt="add"
              className="w-10"
              onClick={addLangueRow}
            />
            <img
              src={minusIcon}
              alt="minus"
              className="w-10 ml-4"
              onClick={removeLangueRow}
            />
          </div>
        </div>

        {/* Right side - PDF Content */}
        <div className="pdf-content w-[65%] py-10 px-0 overflow-y-auto h-full bg-nts-light-green " ref={componentRef}   style={{ width: '100%' , fontFamily :"Times New Roman" }}
        >
           <style>
              {`
              @media print {

                @page {
                  margin-top : 70px;
                  margin-bottom : 20px ;
                }
                @page :first {
                  margin-top: 0px !important;
                }
                .download{
                  display : None;
                }
              } 
              
              `}
              
            </style>
          <div id="pdfContent">
       {/* Personal Info Display */}
       <div className="flex justify-between items-center mx-10 mt-[-20px]">
              <img src={cache} alt="cache" className="w-32" />
            

              {format === 'Netsense' ? (
                <img
                  src={logoNetsense}
                  alt="logoNetsense"
                  className="w-40 h-16"
                />
              ) : 
              <img
                  src={logolink4u}
                  alt="logoNetsense"
                  className="w-40 h-16"
                />
                }
            </div>
            <div className="text-center mb-8">
              <h1 className="font-bold text-2xl mb-1 text-black">{personalInfo.name}</h1>
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
              <div className="mt-6 text-justify">
                <h3 className="text-nts-text-green font-bold text-xl mb-4">
                  Formation :
                </h3>
                {education.map((edu, index) => (
                  <div key={index} className="mb-4 inline text-justify">
                    <strong className="
                       text-gray-900">
                        {edu.annee} : 
                      </strong>
                    <p className="text-gray-700">
                       {edu.diplome} : {edu.etablissement}
                    </p>
                  </div>
                  
                ))}
              </div>

              {/* Expérience Professionnelle */}
              {experience.length > 0 && (
              <div className="mt-6">
                <h3 className="text-nts-text-green font-bold text-xl mb-4">
                  Expérience Professionnelle :
                </h3>
                {experience.map((exp, index) => (
                  <div key={index} className="mb-6 text-justify">
                    <h4 className="font-semibold text-gray-900">Du  {exp.start_date}  à  {exp.end_date} : {exp.poste} chez {exp.entreprise}</h4>
                    <p className="ml-4 mt-2 text-gray-800">
                      {exp.taches.map((tache, i) => (
                        <span key={i}>
                          - {tache}
                          <br />
                        </span>
                      ))}
                    </p>
                  </div>
                ))}
              </div>
              )}
              {/* Compétences */}
              <div className="mt-6">
                <h3 className="text-nts-text-green font-bold text-xl mb-4">
                  Compétences :
                </h3>
                <ul className="list-disc list-inside ml-4 text-gray-800">
                  {competences.map((comp, index) => (
                    <li key={index}>{comp}</li>
                  ))}
                </ul>
              </div>
             
               {/* Projets */}
               {projets.length > 0 && (
                <div className="projets mt-6 no-page-break">
                  <h2 className="text-nts-text-green font-bold text-xl mb-4">
                    Projets
                  </h2>
                  {projets.map((projet, index) => (
                    <div key={index} className="projet-item mb-4">
                      <h3 className="text-lg font-semibold text-black">
                        {projet.titre_projet} : 
                      </h3>
                      {projet.taches.length > 0 && (
                        <ul className="list-disc list-inside ml-4 mt-2 text-gray-800">
                          {projet.taches.map((task, i) => (
                            <li key={i}>{task}</li>
                          ))}
                        </ul>
                      )}{" "}
                      {projet.technologies.length > 0 && (
                        <div>
                          <span className="text-gray-700 font-semibold mr-2  text-[16px]">
                            Technologies:
                          </span>
                          <span className="text-gray-700  ">
                            {projet.technologies.join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}{" "} 
            {/* Certifications */}
            {certifications.length > 0 && (
                <div className="projets mt-6 no-page-break">
                  <h2 className="text-nts-text-green font-bold text-xl mb-4">
                    Certificats
                  </h2>
                  {certifications.map((certif, index) => (
                    <div key={index} className="projet-item mb-4">
                      <h4 className="font-semibold text-gray-900">
                        {certif.nom}
                      </h4>
                      <span className="text-gray-700">
                        {certif.organisme} 
                            
                            {certif.date && (
                       
                       <span>- {certif.date}</span> 
                      
                      )}   
                          
                        
                      </span>
                      {certif.score && (
                        <div className=" text-gray-700">
                          <span className=" font-semibold mr-2  text-[16px]">
                            Score:{" "}
                          </span>
                          <span>{certif.score}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            
            
            {/* Langues */}
 {langues.length > 0 && (
              <div className="langues mt-6 text-justify">
                <h2 className="text-nts-text-green font-bold text-xl mb-4 ">Langues</h2>
                {langues.map((langue, index) => (
                  <p key={index} className="langue-item text-gray-700">
                    {langue}
                  </p>
                ))}
              </div>
            )}
              </div>
        

          

           
          </div>

          <div className="flex justify-end download">
            <button
              onClick={() => {
                handleDownloadPdf();
              }}

              className="bg-nts-dark-green text-white p-4 mt-10 rounded shadow-md hover:bg-nts-dark-green-dark"
            >
              Télécharger le PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
