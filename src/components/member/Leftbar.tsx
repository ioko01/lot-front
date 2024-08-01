import { Route, Routes, useNavigate } from "react-router-dom";
import { Home } from "./Home";
import { Bill } from "./Bill";
import { Report } from "./Report";
import { Reward } from "./Reward";
import { Rule } from "./Rule";
import { Howto } from "./Howto";
import { BillCheck } from "./BillCheck";
import { PageNotFound } from "./PageNotFound";
import { NavLink } from "react-router-dom";
import { Link } from "./Link";
import axios, { AxiosRequestConfig } from "axios";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContextProvider";
import { OrderGroup } from "./OrderGroup";
import { io } from "../../utils/socket-io";
import { OrderList } from "./OrderList";

export function Leftbar() {
    const { isUser, status, logout } = useContext(AuthContext)
    const navigate = useNavigate()
    const isLoading = document.getElementById("loading")
    const [credit, setCredit] = useState<string>("")

    const getCredit = async () => {
        const access_token = localStorage.getItem(import.meta.env.VITE_OPS_TOKEN);
        const axiosConfig: AxiosRequestConfig = { withCredentials: true, timeout: 10000, headers: { Authorization: `Bearer ${access_token}` } }
        const res = await axios.get(import.meta.env.VITE_OPS_URL + "/credit", axiosConfig)
        if (res && res.status == 200) {
            const data = res.data as { credit: number }
            setCredit(data.credit.toLocaleString('en-us', { minimumFractionDigits: 2 }))
        }
    }
    useEffect(() => {
        io.on("get_credit", () => {
            getCredit()
            // io.off('get_credit')
        })
        getCredit()
    }, [])



    if (isLoading) {
        setTimeout(() => {
            if (status === "SUCCESS" || status === "LOGOUT") {
                isLoading.style.display = "none"
            } else {
                isLoading.removeAttribute("style")
            }
        }, 100)
    }

    const isLogout = async () => {
        try {
            isLoading!.removeAttribute("style")
            logout(isUser!.user_id!).then(() => {
                navigate("/")
            })
        } catch (error) {
            console.log(error);
        }
    }

    return (
        isUser &&
        <div className="w-full" style={{ minHeight: "2000x" }} >
            <div className="flex flex-no-wrap h-full">
                <div style={{ minHeight: "2000px", minWidth: "180px" }} className="absolute relative bg-gray-800 shadow h-full flex-col justify-between">
                    <div className="px-2">
                        <div className="h-16 w-full flex items-center justify-center">
                            <svg aria-label="Ripples. Logo" role="img" xmlns="http://www.w3.org/2000/svg" width="144" height="30" viewBox="0 0 144 30">
                                <path
                                    fill="#5F7DF2"
                                    d="M80.544 9.48c1.177 0 2.194.306 3.053.92.86.614 1.513 1.45 1.962 2.507.448 1.058.673 2.247.673 3.568 0 1.303-.233 2.473-.699 3.51-.465 1.037-1.136 1.851-2.012 2.444-.876.592-1.885.888-3.028.888-1.405 0-2.704-.554-3.897-1.663v4.279h2.64v3.072h-9.14v-3.072h2.26V12.78H70.45V9.657h6.145v1.663l.209-.21c1.123-1.087 2.369-1.63 3.74-1.63zm17.675 0c1.176 0 2.194.306 3.053.92.859.614 1.513 1.45 1.961 2.507.449 1.058.673 2.247.673 3.568 0 1.303-.233 2.473-.698 3.51-.466 1.037-1.136 1.851-2.012 2.444-.876.592-1.886.888-3.028.888-1.405 0-2.704-.554-3.898-1.663v4.279h2.64v3.072h-9.14v-3.072h2.26V12.78h-1.904V9.657h6.144v1.663l.21-.21c1.122-1.087 2.368-1.63 3.739-1.63zM24.973 1c1.13 0 2.123.433 2.842 1.133 0 .004 0 .008.034.012 1.54 1.515 1.54 3.962-.034 5.472-.035.029-.069.058-.069.089-.719.65-1.712 1.05-2.773 1.05-.719 0-1.37.061-1.985.184-2.363.474-3.8 1.86-4.28 4.13-.114.489-.18 1.02-.2 1.59l-.003.176.001-.034.002.034c.022.505-.058 1.014-.239 1.495l-.076.182.064-.157c.106-.28.18-.575.217-.881l.008-.084-.026.195c-.286 1.797-1.858 3.188-3.754 3.282l-.204.005h-.103l-.103.002h-.034c-.65.012-1.232.072-1.78.181-2.328.473-3.765 1.863-4.279 4.139-.082.417-.142.863-.163 1.339l-.008.362v.23c0 2.02-1.603 3.681-3.661 3.861L4.16 29l-.48-.01c-.958-.073-1.849-.485-2.499-1.113-1.522-1.464-1.573-3.808-.152-5.33l.152-.154.103-.12c.719-.636 1.677-1.026 2.704-1.026.754 0 1.404-.062 2.02-.184 2.362-.475 3.8-1.86 4.28-4.126.136-.587.17-1.235.17-1.942 0-.991.411-1.896 1.027-2.583.069-.047.137-.097.172-.15.068-.051.102-.104.17-.159.633-.564 1.498-.925 2.408-.978l.229-.007h.034c.068 0 .171.003.274.009.616-.014 1.198-.074 1.746-.18 2.328-.474 3.766-1.863 4.279-4.135.082-.44.142-.912.163-1.418l.008-.385v-.132c0-2.138 1.78-3.872 4.005-3.877zm-.886 10c1.065 0 1.998.408 2.697 1.073.022.011.03.024.042.036l.025.017v.015c1.532 1.524 1.532 3.996 0 5.52-.034.03-.067.06-.067.09-.7.655-1.665 1.056-2.697 1.056-.7 0-1.332.062-1.932.186-2.298.477-3.696 1.873-4.163 4.157-.133.591-.2 1.242-.2 1.95 0 1.036-.399 1.975-1.032 2.674l-.1.084c-.676.679-1.551 1.055-2.441 1.13l-.223.012-.366-.006c-.633-.043-1.3-.254-1.865-.632-.156-.096-.296-.201-.432-.315l-.2-.177v-.012c-.734-.735-1.133-1.72-1.133-2.757 0-2.078 1.656-3.793 3.698-3.899l.198-.005h.133c.666-.007 1.266-.069 1.832-.185 2.265-.476 3.663-1.874 4.163-4.161.08-.442.139-.916.159-1.424l.008-.387v-.136c0-2.153 1.731-3.899 3.896-3.904zm3.882 11.025c1.375 1.367 1.375 3.583 0 4.95s-3.586 1.367-4.96 0c-1.345-1.367-1.345-3.583 0-4.95 1.374-1.367 3.585-1.367 4.96 0zm94.655-12.672c1.405 0 2.628.323 3.669.97 1.041.648 1.843 1.566 2.406 2.756.563 1.189.852 2.57.87 4.145h-9.954l.03.251c.132.906.476 1.633 1.03 2.18.605.596 1.386.895 2.343.895 1.058 0 2.09-.525 3.097-1.574l3.301 1.066-.203.291c-.69.947-1.524 1.67-2.501 2.166-1.075.545-2.349.818-3.821.818-1.473 0-2.774-.277-3.904-.831-1.13-.555-2.006-1.34-2.628-2.355-.622-1.016-.933-2.21-.933-3.58 0-1.354.324-2.582.971-3.682s1.523-1.961 2.628-2.583c1.104-.622 2.304-.933 3.599-.933zm13.955.126c1.202 0 2.314.216 3.339.648v-.47h3.034v3.91h-3.034l-.045-.137c-.317-.848-1.275-1.272-2.875-1.272-1.21 0-1.816.339-1.816 1.016 0 .296.161.516.483.66.321.144.791.262 1.409.355 1.735.22 3.102.536 4.1.946 1 .41 1.697.919 2.095 1.524.398.605.597 1.339.597 2.202 0 1.405-.48 2.5-1.441 3.282-.96.783-2.266 1.174-3.917 1.174-1.608 0-2.7-.321-3.275-.964V23h-3.098v-4.596h3.098l.032.187c.116.547.412.984.888 1.311.53.364 1.183.546 1.962.546.762 0 1.324-.087 1.688-.26.364-.174.546-.476.546-.908 0-.296-.076-.527-.228-.692-.153-.165-.447-.31-.883-.438-.435-.127-1.102-.27-2-.431-1.997-.313-3.433-.82-4.31-1.517-.875-.699-1.313-1.64-1.313-2.825 0-1.21.455-2.162 1.365-2.856.91-.695 2.11-1.042 3.599-1.042zm-69.164.178v10.27h1.98V23h-8.24v-3.072h2.032V12.78h-2.031V9.657h6.259zm-16.85-5.789l.37.005c1.94.05 3.473.494 4.6 1.335 1.198.892 1.797 2.185 1.797 3.878 0 1.168-.273 2.15-.819 2.945-.546.796-1.373 1.443-2.482 1.943l3.085 5.776h2.476V23h-5.827l-4.317-8.366h-2.183v5.116h2.4V23H39.646v-3.25h2.628V7.118h-2.628v-3.25h10.918zm61.329 0v16.06h1.892V23h-8.24v-3.072h2.082v-13h-2.082v-3.06h6.348zm-32.683 9.04c-.812 0-1.462.317-1.949.951-.486.635-.73 1.49-.73 2.565 0 1.007.252 1.847.756 2.52.503.673 1.161 1.01 1.974 1.01.838 0 1.481-.312 1.93-.934.448-.622.672-1.504.672-2.647 0-1.092-.228-1.942-.685-2.552-.457-.61-1.113-.914-1.968-.914zm17.675 0c-.813 0-1.463.317-1.95.951-.486.635-.73 1.49-.73 2.565 0 1.007.253 1.847.756 2.52.504.673 1.162 1.01 1.974 1.01.838 0 1.481-.312 1.93-.934.449-.622.673-1.504.673-2.647 0-1.092-.229-1.942-.686-2.552-.457-.61-1.113-.914-1.967-.914zM14.1 0C16.267 0 18 1.743 18 3.894v.01c0 2.155-1.733 3.903-3.9 3.903-4.166 0-6.3 2.133-6.3 6.293 0 2.103-1.667 3.817-3.734 3.9l-.5-.009c-.933-.075-1.8-.49-2.433-1.121C.4 16.134 0 15.143 0 14.1c0-2.144 1.733-3.903 3.9-3.903 4.166 0 6.3-2.133 6.3-6.294C10.2 1.751 11.934.005 14.1 0zm108.32 12.184c-.76 0-1.372.22-1.834.66-.46.44-.75 1.113-.87 2.018h5.561c-.118-.795-.442-1.44-.97-1.936-.53-.495-1.158-.742-1.886-.742zM49.525 7.118h-2.26v4.444h1.829c2.023 0 3.034-.754 3.034-2.26 0-.728-.233-1.274-.698-1.638-.466-.364-1.1-.546-1.905-.546zm15.821-3.593c.635 0 1.183.231 1.644.692.462.462.692 1.01.692 1.644 0 .677-.23 1.238-.692 1.682-.46.445-1.009.667-1.644.667-.643 0-1.195-.23-1.656-.692-.462-.461-.692-1.013-.692-1.657 0-.634.23-1.182.692-1.644.46-.461 1.013-.692 1.656-.692zM5.991 1.171c1.345 1.563 1.345 4.095 0 5.658-1.374 1.561-3.585 1.561-4.96 0-1.375-1.563-1.375-4.095 0-5.658 1.375-1.561 3.586-1.561 4.96 0z"
                                />
                            </svg>
                        </div>
                        <ul className="mt-12">
                            <div className='flex flex-col'>
                                <div className='flex flex-row'>
                                    <li className="flex w-full justify-between text-white font-light items-center">
                                        <span>User</span>
                                        <span>{isUser.fullname}</span>
                                    </li>
                                </div>

                                <div className='flex flex-row'>
                                    <li className="flex w-full justify-between text-white font-light items-center">
                                        <span>Role</span>
                                        <span>{isUser.role}</span>
                                    </li>
                                </div>

                                <div className='flex flex-row'>
                                    <li className="flex w-full justify-between text-white font-light items-center">
                                        <span>Balance</span>
                                        <span>{credit}</span>
                                    </li>
                                </div>

                                <div className='flex flex-row my-3'>
                                    <li className="flex w-full justify-evenly text-yellow-600 hover:text-yellow-700 cursor-pointer items-center">
                                        <NavLink to="/" className="flex items-center focus:outline-none focus:ring-2 focus:ring-white">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                            </svg>
                                            <span className="text-xs ml-2">ข้อมูลส่วนตัว</span>
                                        </NavLink>
                                    </li>
                                    <li className="flex w-full justify-evenly text-yellow-600 hover:text-yellow-700 cursor-pointer items-center">
                                        <button type={"button"} onClick={isLogout} className="flex items-center focus:outline-none focus:ring-2 focus:ring-white">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
                                            </svg>

                                            <span className="text-xs ml-2">ออกจากระบบ</span>
                                        </button>
                                    </li>
                                </div>

                                {/* <div className='flex flex-row mt-2'>
                                    <li className="flex w-full justify-between text-white text-sm">
                                        <p>อัตราจ่าย</p>
                                        <p>หวยไทย</p>
                                    </li>
                                </div>
                                <div className='flex flex-row'>
                                    <li className="flex w-full justify-center text-white items-center text-center">
                                        <table className='table w-full text-xs'>
                                            <thead>
                                                <tr>
                                                    <th className='border px-1 bg-white text-gray-700'>อัตราจ่าย</th>
                                                    <th className='border px-1 bg-white text-gray-700'>จ่าย<br />(บาท)</th>
                                                    <th className='border px-1 bg-white text-gray-700'>ลด<br />(%)</th>
                                                    <th className='border px-1 bg-white text-gray-700'>ขั้นต่ำ<br />(บาท)</th>
                                                    <th className='border px-1 bg-white text-gray-700'>ขั้นสูง<br />(บาท)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td className='border px-1 font-light'>วิ่งบน</td>
                                                    <td className='border px-1 font-light'>3</td>
                                                    <td className='border px-1 font-light'>0</td>
                                                    <td className='border px-1 font-light'>1</td>
                                                    <td className='border px-1 font-light'>10,000</td>
                                                </tr>
                                                <tr>
                                                    <td className='border px-1 font-light'>วิ่งล่าง</td>
                                                    <td className='border px-1 font-light'>4</td>
                                                    <td className='border px-1 font-light'>0</td>
                                                    <td className='border px-1 font-light'>1</td>
                                                    <td className='border px-1 font-light'>10,000</td>
                                                </tr>
                                                <tr>
                                                    <td className='border px-1 font-light'>2 ตัวบน</td>
                                                    <td className='border px-1 font-light'>95</td>
                                                    <td className='border px-1 font-light'>0</td>
                                                    <td className='border px-1 font-light'>1</td>
                                                    <td className='border px-1 font-light'>2,000</td>
                                                </tr>
                                                <tr>
                                                    <td className='border px-1 font-light'>2 ตัวล่าง</td>
                                                    <td className='border px-1 font-light'>95</td>
                                                    <td className='border px-1 font-light'>0</td>
                                                    <td className='border px-1 font-light'>1</td>
                                                    <td className='border px-1 font-light'>2,000</td>
                                                </tr>
                                                <tr>
                                                    <td className='border px-1 font-light'>3 ตัวบน</td>
                                                    <td className='border px-1 font-light'>800</td>
                                                    <td className='border px-1 font-light'>0</td>
                                                    <td className='border px-1 font-light'>1</td>
                                                    <td className='border px-1 font-light'>2,000</td>
                                                </tr>
                                                <tr>
                                                    <td className='border px-1 font-light'>3 ตัวโต๊ด</td>
                                                    <td className='border px-1 font-light'>125</td>
                                                    <td className='border px-1 font-light'>0</td>
                                                    <td className='border px-1 font-light'>1</td>
                                                    <td className='border px-1 font-light'>2,000</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </li>
                                </div> */}

                            </div>
                        </ul>
                    </div>
                </div>

                <div style={{ minWidth: "768px" }} className="w-full">
                    <nav className="bg-white border-b border-gray-200 rounded">
                        <div className="container">
                            <div className="w-full" id="navbar-default">
                                <ul className="w-full flex flex-row py-4 mt-0 rounded-lg text-sm font-medium border-0">
                                    <li>
                                        <NavLink end to="/" className={({ isActive }) => "flex flex-row items-center block pl-3 whitespace-nowrap" + (isActive ? " active" : "")}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                            </svg>

                                            &nbsp;แทงหวย</NavLink>
                                    </li>
                                    <li>
                                        <NavLink end to="/order/list" className={({ isActive }) => "flex flex-row items-center block pl-3 whitespace-nowrap" + (isActive ? " active" : "")}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                                            </svg>

                                            &nbsp;รายการแทง/ยกเลิกโพย</NavLink>
                                    </li>
                                    <li>
                                        <NavLink to="/order/group" className={({ isActive }) => "flex flex-row items-center block pl-3 whitespace-nowrap" + (isActive ? " active" : "")}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                                            </svg>

                                            &nbsp;รายการแทง (ตามชนิดหวย)</NavLink>
                                    </li>
                                    <li>
                                        <NavLink to="/report" className={({ isActive }) => "flex flex-row block pl-3 whitespace-nowrap" + (isActive ? " active" : "")}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                                            </svg>

                                            &nbsp;บัญชีการเงิน</NavLink>
                                    </li>
                                    <li>
                                        <NavLink to="/reward" className={({ isActive }) => "flex flex-row block pl-3 whitespace-nowrap" + (isActive ? " active" : "")}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                                            </svg>

                                            &nbsp;ตรวจรางวัล</NavLink>
                                    </li>
                                    <li>
                                        <NavLink to="/about/rule" className={({ isActive }) => "flex flex-row block pl-3 whitespace-nowrap" + (isActive ? " active" : "")}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                            </svg>

                                            &nbsp;กฏกติกา</NavLink>
                                    </li>
                                    <li>
                                        <NavLink to="/about/howto" className={({ isActive }) => "flex flex-row block pl-3 whitespace-nowrap" + (isActive ? " active" : "")}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                                            </svg>

                                            &nbsp;วิธีเล่นหวย</NavLink>
                                    </li>
                                    <li>
                                        <NavLink to="/about/link" className={({ isActive }) => "flex flex-row block pl-3 whitespace-nowrap" + (isActive ? " active" : "")}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                                            </svg>

                                            &nbsp;ลิงค์ดูผล</NavLink>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </nav>
                    <div style={{ minWidth: 1000 }} className="mx-auto py-10 h-64 w-full px-3">
                        <div className="w-full h-full">
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/bill/:id" element={<Bill />} />
                                <Route path="/order/list" element={<OrderList />} />
                                <Route path="/order/group" element={<OrderGroup />} />
                                <Route path="/report" element={<Report />} />
                                <Route path="/reward" element={<Reward />} />
                                <Route path="/about/rule" element={<Rule />} />
                                <Route path="/about/howto" element={<Howto />} />
                                <Route path="/about/link" element={<Link />} />
                                <Route path="/bill/check/:id" element={<BillCheck />} />
                                <Route path="*" element={<PageNotFound />} />
                            </Routes>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}