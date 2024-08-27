import React from "react";
import userIcon from "../assets/userIcon.svg";

const UserInfoCard = ({ user, logout }) => {
  const photoSrc = userIcon;

  return (
    <div>
      <div className="absolute right-0 top-12 bg-white p-4 rounded z-20 shadow-card">
        {/* Display user's profile picture if available, otherwise display default icon */}
        <img
          src={photoSrc}
          alt="Profile"
          className="ml-[35%] w-16 h-16 rounded-full object-cover"
        />
        <p className="mt-5 font-bold text-xl mb-2 text-center">Netsense</p>
        <p className="text-sm font-semibold text-gray-700">netsense</p>
        <button
          onClick={logout}
          type="button"
          className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 ml-[7%] mr-[5%] mt-3 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
        >
          Se déconnecter
        </button>
        {/* Add more user details as needed */}
      </div>
    </div>
  );
};

export default UserInfoCard;
