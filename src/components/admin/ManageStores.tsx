import { NavLink, Route, Routes, useNavigate } from "react-router-dom";
import ManageRate from "./ManageRate";
import ManageLotto from "./ManageLotto";
import ManageDigitsClose from "./ManageDigitsClose";
import ManageReward from "./ManageReward";
import { useEffect } from "react";
import axios, { AxiosRequestConfig } from "axios";
import ManageUsers from "./ManageUsers";
import { PageNotFound } from "../member/PageNotFound";
import ManagePromotion from "./ManagePromotion";

export function ManageStores() {
    const store_id = location.pathname.split("/")[2]
    const navigate = useNavigate()
    const fetchStore = (id: string) => {
        const access_token = localStorage.getItem(import.meta.env.VITE_OPS_TOKEN);
        const axiosConfig: AxiosRequestConfig = { withCredentials: true, timeout: 10000, headers: { Authorization: `Bearer ${access_token}` } }
        axios.get(`${import.meta.env.VITE_OPS_URL}/store/${id}`, axiosConfig)
            .then((res) => {
                if (res.data.length == 0) navigate("/stores")
            })
            .catch(() => {

            })
    }
    useEffect(() => {
        fetchStore(store_id)
    }, [])

    return <>
        <div className="border-b border-gray-200 dark:border-gray-700">
            <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500 dark:text-gray-400">
                <li className="me-2">
                    <NavLink to={`/stores/${store_id}/users`} className={({ isActive }) => "inline-flex items-center justify-center p-4 rounded-t-lg dark:text-blue-500 dark:border-blue-500 group" + (isActive && " active text-blue-600 border-b-2 border-blue-600")}>
                        <svg className="w-4 h-4 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z" />
                        </svg>&nbsp;จัดการสมาชิก
                    </NavLink>
                </li>
                <li className="me-2">
                    <NavLink to={`/stores/${store_id}/rates`} className={({ isActive }) => "inline-flex items-center justify-center p-4 rounded-t-lg dark:text-blue-500 dark:border-blue-500 group" + (isActive && " active text-blue-600 border-b-2 border-blue-600")}>
                        <svg className="w-4 h-4 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 18">
                            <path d="M6.143 0H1.857A1.857 1.857 0 0 0 0 1.857v4.286C0 7.169.831 8 1.857 8h4.286A1.857 1.857 0 0 0 8 6.143V1.857A1.857 1.857 0 0 0 6.143 0Zm10 0h-4.286A1.857 1.857 0 0 0 10 1.857v4.286C10 7.169 10.831 8 11.857 8h4.286A1.857 1.857 0 0 0 18 6.143V1.857A1.857 1.857 0 0 0 16.143 0Zm-10 10H1.857A1.857 1.857 0 0 0 0 11.857v4.286C0 17.169.831 18 1.857 18h4.286A1.857 1.857 0 0 0 8 16.143v-4.286A1.857 1.857 0 0 0 6.143 10Zm10 0h-4.286A1.857 1.857 0 0 0 10 11.857v4.286c0 1.026.831 1.857 1.857 1.857h4.286A1.857 1.857 0 0 0 18 16.143v-4.286A1.857 1.857 0 0 0 16.143 10Z" />
                        </svg>&nbsp;จัดการเรทการจ่าย
                    </NavLink>
                </li>
                <li className="me-2">
                    <NavLink to={`/stores/${store_id}/lottos`} className={({ isActive }) => "inline-flex items-center justify-center p-4 rounded-t-lg dark:text-blue-500 dark:border-blue-500 group" + (isActive && " active text-blue-600 border-b-2 border-blue-600")}>
                        <svg className="w-4 h-4 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M5 11.424V1a1 1 0 1 0-2 0v10.424a3.228 3.228 0 0 0 0 6.152V19a1 1 0 1 0 2 0v-1.424a3.228 3.228 0 0 0 0-6.152ZM19.25 14.5A3.243 3.243 0 0 0 17 11.424V1a1 1 0 0 0-2 0v10.424a3.227 3.227 0 0 0 0 6.152V19a1 1 0 1 0 2 0v-1.424a3.243 3.243 0 0 0 2.25-3.076Zm-6-9A3.243 3.243 0 0 0 11 2.424V1a1 1 0 0 0-2 0v1.424a3.228 3.228 0 0 0 0 6.152V19a1 1 0 1 0 2 0V8.576A3.243 3.243 0 0 0 13.25 5.5Z" />
                        </svg>&nbsp;จัดการรายการหวย
                    </NavLink>
                </li>
                <li className="me-2">
                    <NavLink to={`/stores/${store_id}/digits/close`} className={({ isActive }) => "inline-flex items-center justify-center p-4 rounded-t-lg dark:text-blue-500 dark:border-blue-500 group" + (isActive && " active text-blue-600 border-b-2 border-blue-600")}>
                        <svg className="w-4 h-4 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
                            <path d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm-3 14H5a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2Zm0-4H5a1 1 0 0 1 0-2h8a1 1 0 1 1 0 2Zm0-5H5a1 1 0 0 1 0-2h2V2h4v2h2a1 1 0 1 1 0 2Z" />
                        </svg>&nbsp;จัดการเลขปิดรับ - เลขจ่ายครึ่ง
                    </NavLink>
                </li>
                <li className="me-2">
                    <NavLink to={`/stores/${store_id}/results`} className={({ isActive }) => "inline-flex items-center justify-center p-4 rounded-t-lg dark:text-blue-500 dark:border-blue-500 group" + (isActive && " active text-blue-600 border-b-2 border-blue-600")}>
                        <svg className="w-4 h-4 me-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                            <path fill="currentColor" d="M290.7 93.2l128 128-278 278-114.1 12.6C11.4 513.5-1.6 500.6 .1 485.3l12.7-114.2 277.9-277.9zm207.2-19.1l-60.1-60.1c-18.8-18.8-49.2-18.8-67.9 0l-56.6 56.6 128 128 56.6-56.6c18.8-18.8 18.8-49.2 0-67.9z" />
                        </svg>
                        &nbsp;ใส่ผล
                    </NavLink>
                </li>
                <li className="me-2">
                    <NavLink to={`/stores/${store_id}/promotions`} className={({ isActive }) => "inline-flex items-center justify-center p-4 rounded-t-lg dark:text-blue-500 dark:border-blue-500 group" + (isActive && " active text-blue-600 border-b-2 border-blue-600")}>
                        <svg className="w-4 h-4 me-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 60 576 512">
                            <path fill="currentColor" d="M576 240c0-23.6-13-44-32-55.1V32C544 23.3 537 0 512 0c-7.1 0-14.2 2.4-20 7l-85 68C364.3 109.2 310.7 128 256 128H64c-35.4 0-64 28.7-64 64v96c0 35.4 28.7 64 64 64h33.7c-1.4 10.5-2.2 21.1-2.2 32 0 39.8 9.3 77.4 25.6 110.9 5.2 10.7 16.5 17.1 28.4 17.1h74.3c26.1 0 41.7-29.8 25.9-50.6-16.4-21.5-26.2-48.4-26.2-77.4 0-11.1 1.6-21.8 4.4-32H256c54.7 0 108.3 18.8 151 53l85 68a32 32 0 0 0 20 7c24.9 0 32-22.8 32-32V295.1C563.1 284 576 263.6 576 240zm-96 141.4l-33.1-26.4C393 311.8 325.1 288 256 288v-96c69.1 0 137-23.8 191-67L480 98.6v282.8z" />
                        </svg>
                        &nbsp;จัดการโปรโมชั่น
                    </NavLink>
                </li>
            </ul>
        </div>

        <div className="p-4 w-full">
            <Routes>
                <Route path={`${store_id}/users`} element={<ManageUsers />} />
                <Route path={`${store_id}/rates`} element={<ManageRate />} />
                <Route path={`${store_id}/lottos`} element={<ManageLotto />} />
                <Route path={`${store_id}/digits/close`} element={<ManageDigitsClose />} />
                <Route path={`${store_id}/results`} element={<ManageReward />} />
                <Route path={`${store_id}/promotions`} element={<ManagePromotion />} />
                <Route path={`${store_id}/*`} element={<PageNotFound />} />
            </Routes>

        </div>

    </>
}