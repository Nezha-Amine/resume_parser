import ChevronDown from "../assets/ChevronDown.png";
import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import useApi from "../api";


const ResultSearch = () => {
  const [keyword, setKeyword] = useState('');
  const [mot_cles, setSkills] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(0);
  const [isOpen, setOpen] = useState(false);
  const [isConvert, setConvert] = useState(false);
  const [isOtherOpen, setOtherOpen] = useState(false);
  const [isCvsOpen, setCvsOpen] = useState(false);
  const [activeDropdownIndex, setActiveDropdownIndex] = useState(null);
  const dropdownRefs = useRef([]); // Ref array for dropdowns
  const [isShowAllOpen, setIsShowAllOpen] = useState(false);
  const [showAll, setShowAll] = useState(false); // Toggle for showing all CVs
  const location = useLocation();
  const mongoData = location.state || [];
  const data = Object.values(mongoData);
  let transformedProfiles ;
  if (data){
    const array = JSON.parse(data[0]);
    transformedProfiles = array.map(profile => ({
        first_name: profile.first_name,
        last_name: profile.last_name,
        profile: profile.profil, 
        mot_cles: profile.mot_cles,
        resume_convertit: profile.resume_convertit || ''  
    })); 
  }
    let [profile, setProfile] = useState(transformedProfiles);
    console.log(transformedProfiles);
    useEffect(() => {
        let storedSkills = localStorage.getItem('skills');
        
        if (storedSkills) {
          const skillsArray = storedSkills.split(",");
          setSkills(skillsArray);
        }
      }, []); 

    
    const api = useApi();

    const SearchProfile = async () => {
        const profile = localStorage.getItem('profil');
        const searchData = {
          profile: profile,
          skills: mot_cles,
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
          let res = [];
          if (searchResponse.data){
            res  = searchResponse.data;
          }else{
            res = [];
          }
          if (res && res.res) {
            const results = typeof res.res === 'string' ? JSON.parse(res.res) : res.res;

            const transformedProfiles = results.map(result => ({
                first_name: result.first_name,
                last_name: result.last_name,
                profile: result.profil,
                mot_cles: result.mot_cles,
                resume_convertit: result.resume_convertit || '' 
            }));

            setProfile(transformedProfiles); 
        }
          
    
        } catch (error) {
          console.error("Search failed:", error);
        }
      };
    const downloadCv = (fileUrl) => {
    if (fileUrl) {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileUrl.split('/').pop(); // Extract filename from URL
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        alert('CV file not available');
    }
    };

    // Handle "Afficher tout les cvs" toggle
    const handleShowAllSelect = (option) => {
        if (option === "Tout les cvs") {
            setProfile(transformedProfiles); 
        } else if (option === "convertits") {
            const convertedProfiles = transformedProfiles.filter(item => item.resume_convertit !== "");
            setProfile(convertedProfiles); 
        } else {
            const nonConvertedProfiles = transformedProfiles.filter(item => item.resume_convertit === "");
            setProfile(nonConvertedProfiles); 
        } 
        setIsShowAllOpen(false); 
    };
    

    const handleOtherDropDown = () => {
        setOtherOpen(!isOtherOpen);
        setisOpen(false); // Close the other dropdowns when one is opened
        setCvsOpen(false);
    };

  const handleShowAllDropDown = () => {
    setIsShowAllOpen(!isShowAllOpen);
  };

    // Function to handle click outside of the dropdown
    const handleClickOutside = (event) => {
      if (dropdownRefs.current.every((ref) => !ref.contains(event.target))) {
        setActiveDropdownIndex(null);
      }
    };
  

  const handleCvsDropDown = (index) => {
    setActiveDropdownIndex((prevIndex) => (prevIndex === index ? null : index));
    setisOpen(false);       // Close the other dropdowns when this one is opened
    setOtherOpen(false)
  };

  const handleAddSkill = (e) => {
    if (e.key === 'Enter' && e.target.value.trim() && mot_cles.length < 3) {
      setSkills([...mot_cles, e.target.value.trim()]);
      setKeyword('');
    } else if (mot_cles.length >= 3) {
      alert('Vous ne pouvez ajouter que jusqu\'à 3 compétences.');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(mot_cles.filter(skill => skill !== skillToRemove));
  };

  const handleDropDown = () => {
    setOpen(!isOpen);
  };

  const handleNumberSelect = (value) => {
    if (value === "tout") {
      setRowsPerPage(profile.length);
    } else {
      setRowsPerPage(parseInt(value));
    }
    setCurrentPage(0); // Reset to the first page whenever the number of profiles per page changes
    setOpen(false);
  };

  const handleCvDropDown = () => {
    setConvert(!isConvert);
  };

  const handleCvSelect = (value) => {
    setConvert(value);
    setOpen(false);
  };

  const filteredProfiles = isConvert === "tout"
    ? profile
    : profile.filter(p => (isConvert === "cv_convertit" ? p.resume_convertit : !p.resume_convertit));

  const paginatedProfiles = filteredProfiles.slice(
    currentPage * rowsPerPage,
    (currentPage + 1) * rowsPerPage
  );

  const handleNextPage = () => {
    if ((currentPage + 1) * rowsPerPage < filteredProfiles.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };
  useEffect(() => {
    // Add event listener to detect clicks outside
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const displayedProfiles = filteredProfiles.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);

  return (
<div className="z-0 ms-[10%] w-[80%] ml-[10%] mt-[10px]">      {/* Skill input and selection */}
      <div className="flex items-center justify-end space-x-4 mt-6 mr-5">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleAddSkill}
          placeholder="Entrez une compétence"
          className="flex-grow max-w-md px-4 py-2 border rounded-md focus:outline-none shadow-md"
          style={{ zIndex: 10 }}
        />
        <div className="flex items-center space-x-2">
          {mot_cles.map((skill, index) => (
            <div key={index} className="bg-black text-white px-3 py-1 rounded-full flex items-center space-x-2">
              <span>#{skill}</span>
              <button onClick={() => handleRemoveSkill(skill)} className="text-red-500">
                X
              </button>
            </div>
          ))}
        </div>
        <button className="ml-3 bg-nts-green p-2 rounded-full text-white"
              onClick={SearchProfile} // Attach the click handler here
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
        </button>
      </div>

      {/* Pagination controls */}
      <div className="flex justify-center mt-10 gap-12">
        <div className="flex space-x-8">
          <div className="inline-flex items-center">
            <label className="tracking-wide text-dark-blue text-[15px] font-[600]">Afficher</label>
            <div className="dropdown">
              <button
                className="ml-4 text-black bg-[#D9D9D9] hover:bg-nts-grey font-medium rounded-lg text-lg px-4 py-1 text-center inline-flex items-center"
                onClick={handleDropDown}
              >
                {rowsPerPage === profile.length ? "tout" : rowsPerPage}
                <img src={ChevronDown} className="ml-4 h-2 w-3" />
              </button>
              <div
                id="dropdown"
                className={`z-10 mt-2 ml-2 bg-white rounded divide-y divide-gray-100 shadow absolute ${isOpen ? "block" : "hidden"}`}
              >
                <ul className="z-10 w-20 bg-white rounded divide-y divide-gray-100 shadow  overflow-auto m-0">
                  {["tout", 5, 10, 15, 20].map((e, i) => (
                    <li key={i}>
                      <button
                        className="block py-2 px-4 hover:bg-gray-100 w-20"
                        onClick={() => handleNumberSelect(e)}
                      >
                        {e}
                      </button>
                    </li>
                  ))}
                </ul>

              </div>
            </div>
            <label className="block tracking-wide text-black text-[15px] font-[600] ml-4">Profiles</label>
          </div>
        </div>

        <div className="inline-flex items-center">
            <label className="tracking-wide text-dark-blue text-[15px] font-[600]">Afficher</label>
            <div className="dropdown ml-4">
            <button
            className="text-black bg-[#D9D9D9] hover:bg-nts-grey font-medium rounded-lg text-lg px-4 py-1  text-center inline-flex items-center"
            onClick={handleShowAllDropDown}
            >
            {showAll ? "Tout les cvs" : "Tout les cvs"}
            <img src={ChevronDown} className="ml-4 h-2 w-3" alt="Chevron Down" />
            </button>
            <div
            id="dropdown"
            className={`z-10 mt-2 ml-2 bg-white rounded divide-y divide-gray-100 shadow absolute ${isShowAllOpen ? "block" : "hidden"}`}
            >
            <ul className="z-10 w-32 bg-white rounded divide-y divide-gray-100 shadow  overflow-auto m-0">
                {["Tout les cvs","convertits","Non convertits"].map((option, i) => (
                <li key={i}>
                    <button
                    className="block py-2 px-4 hover:bg-gray-100 w-full"
                    onClick={() => handleShowAllSelect(option)}
                    >
                    {option}
                    </button>
                </li>
                ))}
            </ul>
            </div>
            </div>
        </div>
      </div>


        {/* Pagination controls */}

        {/*cards*/}
        {profile.length === 0 ? (
            <div className="text-center mt-10 text-xl font-bold">No results found</div>
        ) : (
            <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
    {profile.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage).map((item, index) => (
        <div key={index} className="bg-white shadow-lg rounded-lg p-4 border border-gray-200 flex flex-col justify-between">
            <div>
                <h2 className="text-lg font-bold">{item.first_name} {item.last_name}</h2>
                <p className="mt-2 text-sm text-gray-700">{item.profile}</p>
                <p className="mt-2 text-sm text-gray-500">
                    {item.mot_cles.slice(0, Math.min(item.mot_cles.length, 6)).map((mot_cle, idx) => (
                        <span key={idx} className="mr-2">#{mot_cle}</span>
                    ))}
                </p>
            </div>
            <div className="mt-4 flex space-x-4 justify-center">
                {item.resume_convertit ? (
                    <div className="relative">
                        <button className="bg-black text-white px-3  rounded-md">
                            Voir
                        </button>
                        <button className="bg-nts-green text-white px-3  rounded-md ml-2">
                            Télécharger CV
                        </button>
                        <div className="relative" ref={(el) => dropdownRefs.current[index] = el}>
                            <button
                                className="text-black bg-[#D9D9D9] hover:bg-nts-grey font-medium rounded-lg text-lg px-5 py-2.5 text-center inline-flex items-center"
                                onClick={() => handleCvsDropDown(index)}
                            >
                                <img src={ChevronDown} className="ml-4 h-2 w-3" alt="Chevron Down" />
                            </button>
                            <div
                                className={`z-10 mt-2 ml-2 bg-white rounded divide-y divide-gray-100 shadow absolute ${
                                    activeDropdownIndex === index ? "block" : "hidden"
                                }`}
                            >
                                <ul className="z-10 w-20 bg-white rounded divide-y divide-gray-100 shadow mt-2 overflow-auto">
                                    <li>
                                        <button className="block py-2 px-4 hover:bg-gray-100 w-20">
                                            Word
                                        </button>
                                    </li>
                                    <li>
                                        <button className="block py-2 px-4 hover:bg-gray-100 w-20">
                                            PDF
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <button className="bg-black text-white px-4 py-2 rounded-md">Voir</button>
                        <button className="bg-nts-green text-white px-4 py-2 rounded-md">Convertir CV</button>
                    </>
                )}
            </div>
        </div>
    ))}
</div>

        
            {/* Pagination buttons */}
            <div className="flex justify-between mt-4">
                <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 0}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md"
                >
                    Précédent
                </button>
                <span className="self-center text-lg">
                    Page {currentPage + 1}
                </span>
                <button
                    onClick={handleNextPage}
                    disabled={(currentPage + 1) * rowsPerPage >= filteredProfiles.length}
                    className="bg-nts-green text-white px-4 py-2 rounded-md"
                >
                    Suivant
                </button>
            </div>
            </>
            
        )}
         
        



      

        
    </div>
  );
};

export default ResultSearch;
