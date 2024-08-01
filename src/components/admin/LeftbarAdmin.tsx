import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { NavLink } from "react-router-dom";
import axios from "axios";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContextProvider";
import { axiosConfig } from "../../utils/headers";
// import { io } from "../../utils/socket-io";
import { Dashboard } from "./Dashboard";
import Stores from "./Stores";
import Users from "./Users";
import { ManageStores } from "./ManageStores";
import ManageUserWithStore from "./ManageUsers";
import ManageUsers from "./ManageUsers";
import ManageRate from "./ManageRate";
import ManageLotto from "./ManageLotto";
import ManageDigitsClose from "./ManageDigitsClose";
import ManageReward from "./ManageReward";
import { PageNotFound } from "../member/PageNotFound";

export function LeftbarAdmin() {
    const { isUser, status, logout } = useContext(AuthContext)
    const navigate = useNavigate()
    const isLoading = document.getElementById("loading")
    const location = useLocation()


    if (isLoading) {
        setTimeout(() => {
            if (status === "SUCCESS" || status === "LOGOUT") {
                isLoading.style.display = "none"
            } else {
                isLoading.removeAttribute("style")
                isLoading.style.position = "fixed"
            }
        }, 100)
    }

    const handleSubmit = async () => {
        try {
            isLoading!.removeAttribute("style")
            logout(isUser!.user_id!).then(() => {
                navigate("/")
            })
        } catch (error) {
            // console.log(error);
        }
    }

    const toggleMenu = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.currentTarget.classList.toggle("active")
        e.currentTarget.nextElementSibling?.classList.toggle("hidden")
    }

    return (
        isUser &&
        <div className="flex">
            <aside id="logo-sidebar" className="top-0 left-0 z-1 w-64 h-screen" aria-label="Sidebar">
                <div className="w-full h-full px-3 py-4 overflow-y-auto bg-gray-50 dark:bg-gray-800">
                    <div className="mb-5 w-full text-center">
                        <span style={{ cursor: "default" }} className="text-xl font-semibold whitespace-nowrap">PF-LOTTO.COM</span>
                        <hr />
                    </div>
                    <ul className="space-y-2">
                        <li>
                            <NavLink to={"/"} className={({ isActive }) => "flex items-center w-full p-2 text-base font-normal transition duration-75 rounded-lg group hover:bg-gray-100" + (isActive && " bg-blue-600 text-white hover:bg-blue-500")}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                    <path fillRule="evenodd" d="M2.25 2.25a.75.75 0 0 0 0 1.5H3v10.5a3 3 0 0 0 3 3h1.21l-1.172 3.513a.75.75 0 0 0 1.424.474l.329-.987h8.418l.33.987a.75.75 0 0 0 1.422-.474l-1.17-3.513H18a3 3 0 0 0 3-3V3.75h.75a.75.75 0 0 0 0-1.5H2.25Zm6.54 15h6.42l.5 1.5H8.29l.5-1.5Zm8.085-8.995a.75.75 0 1 0-.75-1.299 12.81 12.81 0 0 0-3.558 3.05L11.03 8.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 1 0 1.06 1.06l2.47-2.47 1.617 1.618a.75.75 0 0 0 1.146-.102 11.312 11.312 0 0 1 3.612-3.321Z" clipRule="evenodd" />
                                </svg>

                                <span className="ml-3">Dashboard</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to={"/users"} className={({ isActive }) => "flex items-center w-full p-2 text-base font-normal transition duration-75 rounded-lg group hover:bg-gray-100" + (isActive && " bg-blue-600 text-white hover:bg-blue-500")}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 transition duration-75">
                                    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                                </svg>

                                <span className="flex-1 ml-3 text-left whitespace-nowrap">จัดการสมาชิก</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to={"/stores/"} className={({ isActive }) => "flex items-center w-full p-2 text-base font-normal transition duration-75 rounded-lg group hover:bg-gray-100" + (isActive && " bg-blue-600 text-white hover:bg-blue-500")}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 transition duration-75">
                                    <path d="M5.223 2.25c-.497 0-.974.198-1.325.55l-1.3 1.298A3.75 3.75 0 0 0 7.5 9.75c.627.47 1.406.75 2.25.75.844 0 1.624-.28 2.25-.75.626.47 1.406.75 2.25.75.844 0 1.623-.28 2.25-.75a3.75 3.75 0 0 0 4.902-5.652l-1.3-1.299a1.875 1.875 0 0 0-1.325-.549H5.223Z" />
                                    <path fillRule="evenodd" d="M3 20.25v-8.755c1.42.674 3.08.673 4.5 0A5.234 5.234 0 0 0 9.75 12c.804 0 1.568-.182 2.25-.506a5.234 5.234 0 0 0 2.25.506c.804 0 1.567-.182 2.25-.506 1.42.674 3.08.675 4.5.001v8.755h.75a.75.75 0 0 1 0 1.5H2.25a.75.75 0 0 1 0-1.5H3Zm3-6a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-.75.75h-3a.75.75 0 0 1-.75-.75v-3Zm8.25-.75a.75.75 0 0 0-.75.75v5.25c0 .414.336.75.75.75h3a.75.75 0 0 0 .75-.75v-5.25a.75.75 0 0 0-.75-.75h-3Z" clipRule="evenodd" />
                                </svg>

                                <span className="flex-1 ml-3 text-left whitespace-nowrap">จัดการร้าน</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to={"/reports"} className={({ isActive }) => "flex items-center w-full p-2 text-base font-normal transition duration-75 rounded-lg group hover:bg-gray-100" + (isActive && " bg-blue-600 text-white hover:bg-blue-500")}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 transition duration-75">
                                    <path fillRule="evenodd" d="M2.25 13.5a8.25 8.25 0 0 1 8.25-8.25.75.75 0 0 1 .75.75v6.75H18a.75.75 0 0 1 .75.75 8.25 8.25 0 0 1-16.5 0Z" clipRule="evenodd" />
                                    <path fillRule="evenodd" d="M12.75 3a.75.75 0 0 1 .75-.75 8.25 8.25 0 0 1 8.25 8.25.75.75 0 0 1-.75.75h-7.5a.75.75 0 0 1-.75-.75V3Z" clipRule="evenodd" />
                                </svg>

                                <span className="flex-1 ml-3 text-left whitespace-nowrap">รายงาน</span>
                            </NavLink>
                        </li>
                        <li>
                            <button onClick={handleSubmit} className="flex items-center p-2 text-base font-normal text-white bg-red-600 w-full text-left rounded-lg hover:bg-red-500">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white transition duration-75">
                                    <path fillRule="evenodd" d="M16.5 3.75a1.5 1.5 0 0 1 1.5 1.5v13.5a1.5 1.5 0 0 1-1.5 1.5h-6a1.5 1.5 0 0 1-1.5-1.5V15a.75.75 0 0 0-1.5 0v3.75a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V5.25a3 3 0 0 0-3-3h-6a3 3 0 0 0-3 3V9A.75.75 0 1 0 9 9V5.25a1.5 1.5 0 0 1 1.5-1.5h6ZM5.78 8.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 0 0 0 1.06l3 3a.75.75 0 0 0 1.06-1.06l-1.72-1.72H15a.75.75 0 0 0 0-1.5H4.06l1.72-1.72a.75.75 0 0 0 0-1.06Z" clipRule="evenodd" />
                                </svg>

                                <span className="flex-1 ml-3 whitespace-nowrap">ออกจากระบบ</span>
                            </button>
                        </li>
                    </ul>
                </div>
            </aside>

            <div style={{ minWidth: "768px" }} className="p-4 w-full">
                <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/users" element={<Users />} />
                        <Route path="/stores" element={<Stores />} />
                        <Route path="/stores/*" element={<ManageStores />} />
                        <Route path="*" element={<PageNotFound />} />
                    </Routes>
                </div>
            </div>
        </div>
    )
}