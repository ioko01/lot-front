import axios, { AxiosRequestConfig } from 'axios'
import React, { useEffect, useRef, useState } from 'react'
// import { io } from '../../utils/socket-io'
import { IUserMySQL, TUserRoleEnum, TUserStatusEnum } from '../../models/User'
import { useAppDispatch } from '../../redux/hooks'
import { stateModal } from '../../redux/features/modal/modalSlice'
import { Modal } from '../modal/Modal'
import { TUserRole } from '../../models/User'
import { IStoreMySQL } from '../../models/Store'

type Props = {}

const ManageUsers = (props: Props) => {
    const [users, setUsers] = useState<IUserMySQL[]>([])
    const dispatch = useAppDispatch()
    const [stores, setStores] = useState<IStoreMySQL[]>([])

    const usernameRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const fullnameRef = useRef<HTMLInputElement>(null);
    const confirmPasswordRef = useRef<HTMLInputElement>(null);
    const roleRef = useRef<HTMLSelectElement>(null);

    const fetchUserWithStore = () => {
        try {
            const store_id = location.pathname.split("/")[2]
            fetchStore(store_id)
            const access_token = localStorage.getItem(import.meta.env.VITE_OPS_TOKEN);
            const axiosConfig: AxiosRequestConfig = { withCredentials: true, timeout: 10000, headers: { Authorization: `Bearer ${access_token}` } }
            axios.get(`${import.meta.env.VITE_OPS_URL}/users/${store_id}`, axiosConfig).then((response) => setUsers(response.data))
        } catch (error) {
        }
    }

    const fetchStore = (id: string) => {
        try {
            const access_token = localStorage.getItem(import.meta.env.VITE_OPS_TOKEN);
            const axiosConfig: AxiosRequestConfig = { withCredentials: true, timeout: 10000, headers: { Authorization: `Bearer ${access_token}` } }
            axios.get(`${import.meta.env.VITE_OPS_URL}/store/${id}`, axiosConfig).then((response) => setStores(response.data))
        } catch (error) {
        }
    }


    const addUser = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        if (usernameRef.current!.value && passwordRef.current!.value && roleRef.current!.value && confirmPasswordRef.current!.value) {
            if (passwordRef.current!.value === confirmPasswordRef.current!.value) {
                const access_token = localStorage.getItem(import.meta.env.VITE_OPS_TOKEN);
                const axiosConfig: AxiosRequestConfig = { withCredentials: true, timeout: 10000, headers: { Authorization: `Bearer ${access_token}` } }
                axios.post(`${import.meta.env.VITE_OPS_URL}/id`, { username: usernameRef.current!.value }, axiosConfig)
                    .then((res) => {
                        if (res.data.length > 0) {
                            console.log("username has been used");
                        } else {
                            let data: IUserMySQL = {
                                user_create_id: stores[0]!.user_create_id,
                                username: usernameRef.current!.value,
                                u_password: passwordRef.current!.value,
                                fullname: fullnameRef.current!.value,
                                credit: 0,
                                role: roleRef.current!.value as TUserRole,
                                store_id: stores[0].store_id,
                                status: TUserStatusEnum.REGULAR,
                                constructor: { name: "RowDataPacket" }
                            }

                            if (roleRef.current!.value == TUserRoleEnum.MANAGER) {
                                axios.post(`${import.meta.env.VITE_OPS_URL}/add/manager`, data, axiosConfig)
                                    .then(() => {
                                        // io.emit("create_user")
                                        dispatch(stateModal({ show: false, openModal: "CONFIG" }))
                                    }).catch(() => {
                                        console.log("fail");
                                    })
                            } else if (roleRef.current!.value == TUserRoleEnum.MANAGE_REWARD) {
                                axios.post(`${import.meta.env.VITE_OPS_URL}/add/manager_reward`, data, axiosConfig)
                                    .then(() => {
                                        // io.emit("create_user")
                                        dispatch(stateModal({ show: false, openModal: "CONFIG" }))
                                    }).catch(() => {
                                        console.log("fail");
                                    })

                            } else if (roleRef.current!.value == TUserRoleEnum.MEMBER) {
                                axios.post(`${import.meta.env.VITE_OPS_URL}/add/member`, data, axiosConfig)
                                    .then(() => {
                                        // io.emit("create_user")
                                        dispatch(stateModal({ show: false, openModal: "CONFIG" }))
                                    }).catch(() => {
                                        console.log("fail");
                                    })
                            }
                        }
                    })
            }
        }
    }

    const openModal = () => {
        dispatch(stateModal({ show: true, openModal: "CONFIG", confirm: true }))
    }

    useEffect(() => {
        // io.on("get_user", () => {
        //     fetchUserWithStore()
        // })

        // io.off('get_user')
        fetchUserWithStore()
    }, [])

    return (
        <>
            <div className='flex justify-end'>
                <button onClick={openModal} className="mb-3 text-sm bg-blue-500 hover:bg-blue-700 text-white py-1 px-2 rounded focus:outline-none focus:shadow-outline">เพิ่มสมาชิก</button>
            </div>

            <div className="text-gray-900">
                <div className="p-4 flex">
                    <h1 className="text-3xl">
                        สมาชิกร้าน <span className='text-blue-500'>{stores[0]?.name}</span>
                    </h1>
                </div>
                <div className="overflow-x-auto px-3 py-4 w-full">
                    <table className="border border-neutral-200 text-md bg-white shadow-md rounded mb-4 w-full">
                        <thead className='border-b border-neutral-200'>
                            <tr className="border-b">
                                <th className="border-r whitespace-nowrap border-neutral-200 text-center p-3 px-5">#</th>
                                <th className="border-r whitespace-nowrap border-neutral-200 text-center p-3 px-5">ชื่อ - สกุล</th>
                                <th className="border-r whitespace-nowrap border-neutral-200 text-center p-3 px-5">ยูเซอร์</th>
                                <th className="border-r whitespace-nowrap border-neutral-200 text-center p-3 px-5">ตำแหน่ง</th>
                                <th className="border-r whitespace-nowrap border-neutral-200 text-center p-3 px-5">ร้าน</th>
                                <th className="border-r whitespace-nowrap border-neutral-200 text-center p-3 px-5">สถานะ</th>
                                <th className="border-r whitespace-nowrap border-neutral-200 text-center p-3 px-5">เครดิต</th>
                                {/* <th className="border-r whitespace-nowrap border-neutral-200 text-center p-3 px-5">เพิ่มเครดิต</th> */}
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user, index) => (
                                <tr key={index} className="border-b hover:bg-orange-100 bg-gray-100 text-center">
                                    <td className="p-3 border-r whitespace-nowrap border-neutral-200" width={"5%"}>{index + 1}</td>
                                    <td className="p-3 border-r whitespace-nowrap border-neutral-200" width={"25%"}>{user.fullname}</td>
                                    <td className="p-3 border-r whitespace-nowrap border-neutral-200" width={"25%"}>{user.username}</td>
                                    <td className="p-3 border-r whitespace-nowrap border-neutral-200" width={"25%"}>{user.role}</td>
                                    <td className="p-3 border-r whitespace-nowrap border-neutral-200" width={"20%"}>{user.s_name ? user.s_name : "-"}</td>
                                    <td className="p-3 border-r whitespace-nowrap border-neutral-200" width={"20%"}>{user.status}</td>
                                    <td className="p-3 border-r whitespace-nowrap border-neutral-200" width={"20%"}>{parseFloat(user.credit.toString()).toLocaleString('en-US', { minimumFractionDigits: 2 })} บาท</td>
                                    {/* <td className="p-3 border-r whitespace-nowrap border-neutral-200" width={"20%"}>
                                        <button type="button" className="flex items-center text-sm bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-2 rounded focus:outline-none focus:shadow-outline m-auto">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 26 26" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                            </svg>

                                            &nbsp;เพิ่มเครดิต
                                        </button>
                                    </td> */}
                                </tr>
                            ))}

                        </tbody>
                    </table>
                </div>
            </div>

            <Modal>
                <>
                    <section>
                        <div className="flex flex-col items-center justify-center mx-auto lg:py-0">
                            <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                                <div className="flex w-full justify-between">
                                    <h1 className="p-6 text-center text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                                        เพิ่มสมาชิก
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
                                            <label htmlFor="store" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">ร้าน{stores[0]?.name}</label>
                                        </div>
                                        <div>
                                            <label htmlFor="role" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">ตำแหน่ง</label>
                                            <select ref={roleRef} name="role" id="role" className='w-full border rounded p-3'>
                                                <option value={TUserRoleEnum.MEMBER}>Member</option>
                                                <option value={TUserRoleEnum.MANAGE_REWARD}>Manager Reward</option>
                                                <option value={TUserRoleEnum.MANAGER}>Manager</option>
                                            </select>
                                        </div>



                                        <div>
                                            <label htmlFor="fullname" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">ชื่อ - สกุล</label>
                                            <input ref={fullnameRef} type="text" name="fullname" id="fullname" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="ชื่อ - สกุล" required />
                                        </div>
                                        <div>
                                            <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">ยูเซอร์เนม</label>
                                            <input ref={usernameRef} type="text" name="username" id="username" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="ยูเซอร์เนม" required />
                                        </div>
                                        <div>
                                            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">รหัสผ่าน</label>
                                            <input ref={passwordRef} type="password" name="password" id="password" placeholder="••••••••" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
                                        </div>
                                        <div>
                                            <label htmlFor="confirm-password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">ยืนยันรหัสผ่าน</label>
                                            <input ref={confirmPasswordRef} type="password" name="confirm-password" id="confirm-password" placeholder="••••••••" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
                                        </div>
                                        <button type="submit" onClick={addUser} className="w-full text-white bg-blue-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">เพิ่มสมาชิก</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </section>
                </>
            </Modal>
        </>
    )
}

export default ManageUsers