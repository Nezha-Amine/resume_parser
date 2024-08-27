import React, { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import burger from "../assets/burger.svg";
import close from "../assets/close.svg";
import deconnexion from "../assets/logout.svg";
import userIcon from "../assets/userIcon.svg";
import logoNetsense from "../assets/logoNetsense.png";
import searchProfile from "../assets/searchProfile.svg";
import convertCv from "../assets/convertCv.svg";
import { useAuth } from "../context/AuthContext";
import UserInfoCard from "../components/UserInfoCard";

function getDate() {
  const today = new Date();
  const date = today.getDate();
  const year = today.getFullYear();
  const monthNames = [
    "janv",
    "févr",
    "mars",
    "avr",
    "mai",
    "juin",
    "juil",
    "août",
    "sept",
    "oct",
    "nov",
    "déc",
  ];
  const month = monthNames[today.getMonth()];
  return `${date}-${month}-${year}`;
}

function AdminLayout() {
  const [open, setOpen] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [currentDate, setCurrentDate] = useState(getDate());
  const { user, logout: logoutContext } = useAuth();
  const navigate = useNavigate();

  const logout = async () => {
    localStorage.setItem("lastVisitedURL", window.location.pathname);
    logoutContext();
    navigate("/login");
  };

  if (!user || user.role !== "admin") {
    return <div>Unauthorized access</div>;
  }

  const Menus = [
    {
      title: "Recherche Profile",
      src: searchProfile,
      link: "/chercherProfile",
    },
    {
      title: "Conversion",
      src: convertCv,
      link: "/convertirCv",
    },
    {
      title: "Deconnexion",
      src: deconnexion,
      onClick: logout,
      gap: true,
    },
  ];
  const photoSrc = userIcon;

  useEffect(() => {
    if (!showUserInfo) return;

    const timer = setTimeout(() => {
      setShowUserInfo(false);
    }, 5000);

    const handleClick = (event) => {
      if (!event.target.closest(".user-info-card")) {
        setShowUserInfo(false);
      }
    };

    window.addEventListener("click", handleClick);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("click", handleClick);
    };
  }, [showUserInfo]);

  return (
    <div className="flex flex-col min-h-screen ">
      {/* Navbar */}
      <header className="bg-white text-nts-black flex items-center justify-between fixed top-0 left-0 w-full h-16 px-4 z-20 shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px]">
        <img src={logoNetsense} alt="Logo Netsense" className="w-48 h-16" />

        <div className="flex items-center gap-4">
          <div>
            <img
              src={photoSrc}
              alt="User icon"
              className="w-12 cursor-pointer rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                setShowUserInfo(!showUserInfo);
              }}
            />
            {showUserInfo && (
              <UserInfoCard user={user} logout={logout} photoSrc={photoSrc} />
            )}
          </div>
          <div className="font-medium">
            <div>NetSense</div>
            <div className="text-sm text-gray-500">
              <p className="mr-7">{currentDate}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`bg-nts-black transition-all duration-300 ease-in-out fixed top-16 left-0 z-10 ${
          open ? "w-60" : "w-16"
        } h-full`}
      >
        {/* Toggle button */}
        <img
          onClick={() => setOpen(!open)}
          src={open ? close : burger}
          alt="Toggle Menu"
          className="absolute cursor-pointer -right-9 top-5 w-8 h-8 text-nts-black"
        />

        {/* Sidebar menu */}
        <nav>
          <ul className="flex flex-col h-full justify-between text-white">
            {Menus.map((menu, index) => (
              <li key={index} className={`${menu.gap ? "mt-12" : "mt-2"}`}>
                {menu.link ? (
                  <Link
                    to={menu.link}
                    className="flex items-center gap-4 p-4 hover:bg-hover rounded"
                  >
                    <img
                      src={menu.src}
                      alt={`${menu.title} icon`}
                      className="w-8 h-8"
                    />
                    <span className={`${!open && "hidden"}`}>{menu.title}</span>
                  </Link>
                ) : (
                  <button
                    onClick={menu.onClick}
                    className="flex items-center gap-4 p-4 hover:bg-hover rounded w-full"
                  >
                    <img
                      src={menu.src}
                      alt={`${menu.title} icon`}
                      className="w-6 h-6"
                    />
                    <span className={`${!open && "hidden"}`}>{menu.title}</span>
                  </button>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 mt-16">
        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;
