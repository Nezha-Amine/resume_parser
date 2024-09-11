import { createBrowserRouter } from "react-router-dom";
import Login from "../pages/Login";
import NotFound from "../pages/NotFound";
import PrivateRoutes from "./PrivateRoutes";
import AdminLayout from "../layouts/AdminLayout";
import SearchProfile from "../pages/SearchProfile";
import ConvertCv from "../pages/ConvertCv";
import ResumeBuilder from "../components/ResumeBuilder";
import LoaderPage from "../components/LoaderPage";
import ResultSearch from "../pages/ResultSearch";
import CandidateForm from "../components/CandidatureForm";
export const router = createBrowserRouter([
  {
    element: (
      <PrivateRoutes roles={["admin"]}>
        <AdminLayout />
      </PrivateRoutes>
    ),
    children: [
      { path: "/chercherProfile", element: <SearchProfile /> },
      { path: "/convertirCv", element: <ConvertCv /> },
      { path: "/Validation", element: <ResumeBuilder /> },
      { path: "/ResultSearch", element: <ResultSearch /> },
    ],
  },
  {
    path: "/loader",
    element: <LoaderPage />,
  },
  // public routes
  {
    path: "/",
    element: <Login />,
  },
  {
    path : "/candidature" ,
    element : <CandidateForm />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  // 404 Not Found route
  {
    path: "*",
    element: <NotFound />,
  },
]);
