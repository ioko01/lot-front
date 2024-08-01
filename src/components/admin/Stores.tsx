import React, { useContext, useEffect, useRef, useState } from 'react'
import { stateModal } from '../../redux/features/modal/modalSlice'
import { useDispatch } from 'react-redux'
import { Modal } from '../modal/Modal'
// import { io } from '../../utils/socket-io'
import axios, { AxiosRequestConfig } from 'axios'
import { IStoreMySQL } from '../../models/Store'
import { IUserMySQL, TUserRoleEnum } from '../../models/User'
import { NavLink, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContextProvider'

type Props = {}

interface IUserAndStoreMySQL extends IUserMySQL {
    name: string //ชื่อร้าน
    logo: string //โลโก้ร้าน
}

const Stores = (props: Props) => {
    const { isUser } = useContext(AuthContext);
    const dispatch = useDispatch()
    const [storesAll, setStoresAll] = useState<IUserAndStoreMySQL[]>([])
    const [userAgentAll, setUserAgentAll] = useState<IUserMySQL[]>([])
    const ownerRef = useRef<HTMLSelectElement>(null);
    const storeNameRef = useRef<HTMLInputElement>(null);

    const fetchStoresAll = () => {
        try {
            const access_token = localStorage.getItem(import.meta.env.VITE_OPS_TOKEN);
            const axiosConfig: AxiosRequestConfig = { withCredentials: true, timeout: 10000, headers: { Authorization: `Bearer ${access_token}` } }
            return axios.get(`${import.meta.env.VITE_OPS_URL}/get/store`, axiosConfig)
                .then((response) => {
                    const data: IUserAndStoreMySQL[] = response.data
                    setStoresAll(data)
                })
        } catch (error) {
        }
    }

    const fetchUserAgentAll = () => {
        try {
            const access_token = localStorage.getItem(import.meta.env.VITE_OPS_TOKEN);
            const axiosConfig: AxiosRequestConfig = { withCredentials: true, timeout: 10000, headers: { Authorization: `Bearer ${access_token}` } }
            return axios.get(`${import.meta.env.VITE_OPS_URL}/get/user/role/` + TUserRoleEnum.AGENT, axiosConfig)
                .then((response) => {
                    const data: IUserMySQL[] = response.data
                    setUserAgentAll(data)
                })
        } catch (error) {
        }
    }

    const openModal = () => {
        fetchUserAgentAll()
        dispatch(stateModal({ show: true, openModal: "CONFIG", confirm: true }))
    }

    const addStore = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        if (ownerRef.current!.value && storeNameRef.current!.value) {
            const [agentData] = userAgentAll.filter((res) => res.user_id === ownerRef.current!.value)

            let agent_id: string = ""
            if (agentData.role === TUserRoleEnum.AGENT) {
                agent_id = agentData.user_id!
            }

            const store: IStoreMySQL = {
                logo: "data.img_logo",
                name: storeNameRef.current!.value,
                user_create_id: agent_id,
                store_id: ""
            }
            const access_token = localStorage.getItem(import.meta.env.VITE_OPS_TOKEN);
            const axiosConfig: AxiosRequestConfig = { withCredentials: true, timeout: 10000, headers: { Authorization: `Bearer ${access_token}` } }
            return axios.post(`${import.meta.env.VITE_OPS_URL}/add/store`, store, axiosConfig)
                .then((res) => {
                    if (res.data.length > 0) {
                        console.log("username has been used");
                    } else {
                        // io.emit("create_store")
                        dispatch(stateModal({ show: false, openModal: "CONFIG" }))
                    }
                })
        }
    }

    useEffect(() => {
        // io.on("get_store", () => {
        //     if (isUser) fetchStoresAll()
        // })

        if (isUser) fetchStoresAll()
    }, [])
    const navigate = useNavigate();
    return (
        <>
            <div className='flex justify-between'>
                <button onClick={() => navigate(-1)} className="mb-3 text-sm text-blue-500 py-1 px-2 rounded focus:outline-none focus:shadow-outline">&lt;&lt; ย้อนกลับ</button>
                <button onClick={openModal} className="text-end mb-3 text-sm bg-blue-500 hover:bg-blue-700 text-white py-1 px-2 rounded focus:outline-none focus:shadow-outline">เพิ่มร้าน</button>
            </div>

            <div className="text-gray-900 bg-gray-200">
                <div className="p-4 flex">
                    <h1 className="text-3xl">
                        ร้านทั้งหมด
                    </h1>
                </div>
                <div className="px-3 py-4 w-full">
                    <table className="text-md bg-white shadow-md rounded mb-4 w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-center p-3 px-5">#</th>
                                <th className="text-center p-3 px-5">ชื่อร้าน</th>
                                <th className="text-center p-3 px-5">เจ้าของร้าน</th>
                                <th className="text-center p-3 px-5">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {storesAll.length > 0 ? storesAll!.map((store, index) => (
                                <tr key={index} className="border-b hover:bg-orange-100 bg-gray-100 text-center">
                                    <td className="p-3" width={"5%"}>{index + 1}</td>
                                    <td className="p-3" width={"25%"}>{store.name}</td>
                                    <td className="p-3" width={"25%"}>{store.fullname}</td>
                                    <td className="p-3 flex justify-center">
                                        <NavLink to={`/stores/${store.store_id}/users`}>
                                            <button type="button" className="flex items-center text-sm bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-2 rounded focus:outline-none focus:shadow-outline">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                                    <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 0 0-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 0 0-2.282.819l-.922 1.597a1.875 1.875 0 0 0 .432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 0 0 0 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 0 0-.432 2.385l.922 1.597a1.875 1.875 0 0 0 2.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 0 0 2.28-.819l.923-1.597a1.875 1.875 0 0 0-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 0 0 0-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 0 0-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 0 0-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 0 0-1.85-1.567h-1.843ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" clipRule="evenodd" />
                                                </svg>
                                                &nbsp;จัดการ
                                            </button>
                                        </NavLink>
                                    </td>
                                </tr>
                            )) :
                                <tr className="border-b hover:bg-orange-100 bg-gray-100 text-center">
                                    <td colSpan={4} className="p-3" width={"100%"}>ไม่มีร้าน</td>
                                </tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal>
                <section>
                    <div className="flex flex-col items-center justify-center  mx-auto lg:py-0">
                        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                            <div className="flex w-full justify-between">
                                <h1 className="p-6 text-center text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                                    เพิ่มร้าน
                                </h1>
                                <button data-modal-hide="default_modal" onClick={() => dispatch(stateModal({ show: false, openModal: "CONFIG" }))} className="text-xs text-gray-400 hover:text-gray-300 font-bold p-2 rounded shadow mx-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                                <form className="space-y-4 md:space-y-6">
                                    <div>
                                        <label htmlFor="owner" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">เจ้าของร้าน</label>
                                        <select ref={ownerRef} name="owner" id="owner" className='w-full border rounded p-3'>
                                            {userAgentAll.length > 0 ? userAgentAll.map((user, index) => (
                                                <option key={index} value={user.user_id}>{user.fullname}</option>
                                            )) : <option>-- ไม่มี AGENT --</option>}
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="store_name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">ชื่อร้าน</label>
                                        <input ref={storeNameRef} type="text" name="store_name" id="store_name" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="ชื่อร้าน" required />
                                    </div>
                                    <button type="submit" onClick={addStore} className="w-full text-white bg-blue-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">เพิ่มร้าน</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>
            </Modal>
        </>
    )
}

export default Stores