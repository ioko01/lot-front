import axios, { AxiosRequestConfig } from 'axios'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { useAppDispatch } from '../../redux/hooks'
import { stateModal } from '../../redux/features/modal/modalSlice'
import { Modal } from '../modal/Modal'
import { IStoreMySQL } from '../../models/Store'
import { AuthContext } from '../../context/AuthContextProvider'
import { TUserRoleEnum } from '../../models/User'
import { IPromotionMySQL, TPromotionStatus } from '../../models/Promotion'
import { IRateMySQL } from '../../models/Rate'

type Props = {}

const ManagePromotion = (props: Props) => {
    const { isUser } = useContext(AuthContext)
    const dispatch = useAppDispatch()
    const [store, setStore] = useState<IStoreMySQL[]>([])
    const [promotions, setPromotions] = useState<IPromotionMySQL[]>([])
    const [rateIdAll, setRateIdAll] = useState<IRateMySQL[]>([]);

    const promotionNameRef = useRef<HTMLInputElement>(null);
    const [daysValue, setDaysValue] = useState<string[]>([]);
    const rateIdRef = useRef<HTMLSelectElement>(null);
    const isLoading = document.getElementById("loading")

    const addPromotion = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        isLoading!.removeAttribute("style")
        isLoading!.style.position = "fixed"
        const promotion: IPromotionMySQL = {
            store_id: store[0]!.store_id!,
            date_promotion: daysValue,
            rate_template_id: rateIdRef.current!.value,
            name: promotionNameRef.current!.value,
            constructor: { name: "RowDataPacket" }
        }

        if (isUser!.role == TUserRoleEnum.ADMIN) {
            Object.assign(promotion, { agent_id: store[0]!.user_create_id })
        }
        const access_token = localStorage.getItem(import.meta.env.VITE_OPS_TOKEN);
        const axiosConfig: AxiosRequestConfig = { withCredentials: true, timeout: 10000, headers: { Authorization: `Bearer ${access_token}` } }
        axios.post(`${import.meta.env.VITE_OPS_URL}/add/promotion`, promotion, axiosConfig)
            .then((res) => {
                isLoading!.style.display = "none"
                dispatch(stateModal({ show: false, openModal: "CONFIG", confirm: true }))
                fetchPromotions()
            })

    }

    const openModal = () => {
        dispatch(stateModal({ show: true, openModal: "CONFIG", confirm: true }))
    }

    const fetchStore = (id: string) => {
        try {
            const access_token = localStorage.getItem(import.meta.env.VITE_OPS_TOKEN);
            const axiosConfig: AxiosRequestConfig = { withCredentials: true, timeout: 10000, headers: { Authorization: `Bearer ${access_token}` } }
            axios.get(`${import.meta.env.VITE_OPS_URL}/store/${id}`, axiosConfig).then((response) => setStore(response.data))
        } catch (error) {
        }
    }

    const fetchPromotions = () => {
        try {
            const store_id = location.pathname.split("/")[2]
            fetchStore(store_id)
            fetchRates(store_id)
            const access_token = localStorage.getItem(import.meta.env.VITE_OPS_TOKEN);
            const axiosConfig: AxiosRequestConfig = { withCredentials: true, timeout: 10000, headers: { Authorization: `Bearer ${access_token}` } }
            if (isUser!.role == TUserRoleEnum.ADMIN) {
                axios.get(`${import.meta.env.VITE_OPS_URL}/promotions/${store_id}`, axiosConfig)
                    .then((response) => {
                        setPromotions(response.data)
                    })
            } else if (isUser!.role == TUserRoleEnum.AGENT) {
                axios.get(`${import.meta.env.VITE_OPS_URL}/promotions/me`, axiosConfig)
                    .then((response) => {
                        setPromotions(response.data)
                    })
            }

        } catch (error) {
        }
    }

    const selectDate = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedValue = e.target.value

        if (daysValue.includes(selectedValue)) {
            const newIds = daysValue.filter((day) => day !== selectedValue);
            setDaysValue(newIds);
        } else {
            const newIds = [...daysValue];
            newIds.push(selectedValue);
            setDaysValue(newIds);
        }
    };

    const fetchRates = (id: string) => {
        const access_token = localStorage.getItem(import.meta.env.VITE_OPS_TOKEN);
        const axiosConfig: AxiosRequestConfig = { withCredentials: true, timeout: 10000, headers: { Authorization: `Bearer ${access_token}` } }
        if (isUser!.role == TUserRoleEnum.ADMIN) {
            axios.get(`${import.meta.env.VITE_OPS_URL}/rates_template/${id}`, axiosConfig)
                .then((res) => {
                    setRateIdAll(res.data)
                })
                .catch(() => {

                })
        } else if (isUser!.role == TUserRoleEnum.AGENT) {
            axios.get(`${import.meta.env.VITE_OPS_URL}/rate_template/me`, axiosConfig)
                .then((res) => {
                    setRateIdAll(res.data)
                })
                .catch(() => {

                })
        }

    }

    const changStatusPromotion = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, status: TPromotionStatus, id: string) => {
        isLoading!.removeAttribute("style")
        isLoading!.style.position = "fixed"
        const promotion: IPromotionMySQL = {
            store_id: location.pathname.split("/")[2],
            promotion_id: id,
            status: status,
            constructor: { name: "RowDataPacket" }
        }
        if (isUser!.role == TUserRoleEnum.ADMIN) {
            Object.assign(promotion, { agent_id: store[0]!.user_create_id })
        }
        const access_token = localStorage.getItem(import.meta.env.VITE_OPS_TOKEN);
        const axiosConfig: AxiosRequestConfig = { withCredentials: true, timeout: 10000, headers: { Authorization: `Bearer ${access_token}` } }
        axios.put(`${import.meta.env.VITE_OPS_URL}/promotions/status`, promotion, axiosConfig).then((res) => {
            isLoading!.style.display = "none"
            dispatch(stateModal({ show: false, openModal: "CONFIG", confirm: true }))
            fetchPromotions()
        })
    }


    useEffect(() => {
        fetchPromotions()
    }, [])


    return (
        <>
            <div className='flex justify-end'>
                <button onClick={openModal} className="text-end mb-3 text-sm bg-blue-500 hover:bg-blue-700 text-white py-1 px-2 rounded focus:outline-none focus:shadow-outline">เพิ่มโปรโมชั่น</button>
            </div>
            <div className="text-gray-900">
                <div className="p-4 flex">
                    <h1 className="text-3xl">
                        โปรโมชั่นร้าน <span className='text-blue-500'>{store[0]?.name}</span>
                    </h1>
                </div>
                <div className="overflow-x-auto px-3 py-4 w-full">
                    <table className="min-w-full border border-neutral-200 text-md bg-white shadow-md rounded mb-4 w-full">
                        <thead className='border-b border-neutral-200'>
                            <tr className="border-b">
                                <th className="border-r whitespace-nowrap border-neutral-200 text-center p-3 px-5">#</th>
                                <th className="border-r whitespace-nowrap border-neutral-200 text-center p-3 px-5">สถานะ</th>
                                <th className="border-r whitespace-nowrap border-neutral-200 text-center p-3 px-5">ชื่อโปรโมชั่น</th>
                                <th className="border-r whitespace-nowrap border-neutral-200 text-center p-3 px-5">วิ่งบน</th>
                                <th className="border-r whitespace-nowrap border-neutral-200 text-center p-3 px-5">วิ่งล่าง</th>
                                <th className="border-r whitespace-nowrap border-neutral-200 text-center p-3 px-5">2 ตัวบน</th>
                                <th className="border-r whitespace-nowrap border-neutral-200 text-center p-3 px-5">2 ตัวล่าง</th>
                                <th className="border-r whitespace-nowrap border-neutral-200 text-center p-3 px-5">3 ตัวบน</th>
                                <th className="border-r whitespace-nowrap border-neutral-200 text-center p-3 px-5">3 ตัวโต๊ด</th>
                                <th className="border-r whitespace-nowrap border-neutral-200 text-center p-3 px-5"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {promotions.length > 0 ? promotions.map((promotion, index) => (
                                <tr key={index} className="border-b hover:bg-orange-100 bg-gray-100 text-center">
                                    <td className="p-3 border-r whitespace-nowrap border-neutral-200" width={"5%"}>{index + 1}</td>
                                    <td className="p-3 border-r whitespace-nowrap border-neutral-200">{promotion.p_status == "NOT_USED" ? <p className='text-red-600'>ไม่ใช้งาน</p> : promotion.p_status == "USED" && <p className='text-green-600'>ใช้งาน</p>}</td>
                                    <td className="p-3 border-r whitespace-nowrap border-neutral-200">{promotion.p_name}</td>
                                    <td className="p-3 border-r whitespace-nowrap border-neutral-200 text-left text-sm">
                                        จ่าย: <span className='text-blue-500'>{JSON.parse(promotion.rt_one_digits).top} บาท</span><br />
                                        แทงต่ำสุด: <span className='text-blue-500'>{parseFloat(JSON.parse(promotion.rt_bet_one_digits).top.split(":")[0]).toLocaleString('en-US')} บาท</span><br />
                                        แทงสูงสุด: <span className='text-blue-500'>{parseFloat(JSON.parse(promotion.rt_bet_one_digits).top.split(":")[1]).toLocaleString('en-US')} บาท</span><br />
                                        รับได้สูงสุด: <span className='text-blue-500'>{parseFloat(JSON.parse(promotion.rt_bet_one_digits).top.split(":")[2]).toLocaleString('en-US')} บาท</span><br />
                                        คอมมิชชัน: <span className='text-blue-500'>{parseFloat(JSON.parse(promotion.c_one_digits).top).toLocaleString('en-US')}%</span><br />
                                    </td>
                                    <td className="p-3 border-r whitespace-nowrap border-neutral-200 text-left text-sm">
                                        จ่าย: <span className='text-blue-500'>{JSON.parse(promotion.rt_one_digits).bottom} บาท</span><br />
                                        แทงต่ำสุด: <span className='text-blue-500'>{parseFloat(JSON.parse(promotion.rt_bet_one_digits).bottom.split(":")[0]).toLocaleString('en-US')} บาท</span><br />
                                        แทงสูงสุด: <span className='text-blue-500'>{parseFloat(JSON.parse(promotion.rt_bet_one_digits).bottom.split(":")[1]).toLocaleString('en-US')} บาท</span><br />
                                        รับได้สูงสุด: <span className='text-blue-500'>{parseFloat(JSON.parse(promotion.rt_bet_one_digits).bottom.split(":")[2]).toLocaleString('en-US')} บาท</span><br />
                                        คอมมิชชัน: <span className='text-blue-500'>{parseFloat(JSON.parse(promotion.c_one_digits).bottom).toLocaleString('en-US')}%</span><br />
                                    </td>
                                    <td className="p-3 border-r whitespace-nowrap border-neutral-200 text-left text-sm">
                                        จ่าย: <span className='text-blue-500'>{JSON.parse(promotion.rt_two_digits).top} บาท</span><br />
                                        แทงต่ำสุด: <span className='text-blue-500'>{parseFloat(JSON.parse(promotion.rt_bet_two_digits).top.split(":")[0]).toLocaleString('en-US')} บาท</span><br />
                                        แทงสูงสุด: <span className='text-blue-500'>{parseFloat(JSON.parse(promotion.rt_bet_two_digits).top.split(":")[1]).toLocaleString('en-US')} บาท</span><br />
                                        รับได้สูงสุด: <span className='text-blue-500'>{parseFloat(JSON.parse(promotion.rt_bet_two_digits).top.split(":")[2]).toLocaleString('en-US')} บาท</span><br />
                                        คอมมิชชัน: <span className='text-blue-500'>{parseFloat(JSON.parse(promotion.c_two_digits).top).toLocaleString('en-US')}%</span><br />
                                    </td>
                                    <td className="p-3 border-r whitespace-nowrap border-neutral-200 text-left text-sm">
                                        จ่าย: <span className='text-blue-500'>{JSON.parse(promotion.rt_two_digits).bottom} บาท</span><br />
                                        แทงต่ำสุด: <span className='text-blue-500'>{parseFloat(JSON.parse(promotion.rt_bet_two_digits).bottom.split(":")[0]).toLocaleString('en-US')} บาท</span><br />
                                        แทงสูงสุด: <span className='text-blue-500'>{parseFloat(JSON.parse(promotion.rt_bet_two_digits).bottom.split(":")[1]).toLocaleString('en-US')} บาท</span><br />
                                        รับได้สูงสุด: <span className='text-blue-500'>{parseFloat(JSON.parse(promotion.rt_bet_two_digits).bottom.split(":")[2]).toLocaleString('en-US')} บาท</span><br />
                                        คอมมิชชัน: <span className='text-blue-500'>{parseFloat(JSON.parse(promotion.c_two_digits).bottom).toLocaleString('en-US')}%</span><br />
                                    </td>
                                    <td className="p-3 border-r whitespace-nowrap border-neutral-200 text-left text-sm">
                                        จ่าย: <span className='text-blue-500'>{JSON.parse(promotion.rt_three_digits).top} บาท</span><br />
                                        แทงต่ำสุด: <span className='text-blue-500'>{parseFloat(JSON.parse(promotion.rt_bet_three_digits).top.split(":")[0]).toLocaleString('en-US')} บาท</span><br />
                                        แทงสูงสุด: <span className='text-blue-500'>{parseFloat(JSON.parse(promotion.rt_bet_three_digits).top.split(":")[1]).toLocaleString('en-US')} บาท</span><br />
                                        รับได้สูงสุด: <span className='text-blue-500'>{parseFloat(JSON.parse(promotion.rt_bet_three_digits).top.split(":")[2]).toLocaleString('en-US')} บาท</span><br />
                                        คอมมิชชัน: <span className='text-blue-500'>{parseFloat(JSON.parse(promotion.c_three_digits).top).toLocaleString('en-US')}%</span><br />
                                    </td>
                                    <td className="p-3 border-r whitespace-nowrap border-neutral-200 text-left text-sm">
                                        จ่าย: <span className='text-blue-500'>{JSON.parse(promotion.rt_three_digits).toad} บาท</span><br />
                                        แทงต่ำสุด: <span className='text-blue-500'>{parseFloat(JSON.parse(promotion.rt_bet_three_digits).toad.split(":")[0]).toLocaleString('en-US')} บาท</span><br />
                                        แทงสูงสุด: <span className='text-blue-500'>{parseFloat(JSON.parse(promotion.rt_bet_three_digits).toad.split(":")[1]).toLocaleString('en-US')} บาท</span><br />
                                        รับได้สูงสุด: <span className='text-blue-500'>{parseFloat(JSON.parse(promotion.rt_bet_three_digits).toad.split(":")[2]).toLocaleString('en-US')} บาท</span><br />
                                        คอมมิชชัน: <span className='text-blue-500'>{parseFloat(JSON.parse(promotion.c_three_digits).toad).toLocaleString('en-US')}%</span><br />
                                    </td>
                                    <td className="p-3 border-r whitespace-nowrap border-neutral-200 text-center text-sm">
                                        <button onClick={(e) => changStatusPromotion(e, promotion.p_status as TPromotionStatus == "USED" ? "NOT_USED" : promotion.p_status as TPromotionStatus == "NOT_USED" ? "USED" : "NOT_USED", promotion.p_id)} type="button" className="flex items-center text-sm bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-2 rounded focus:outline-none focus:shadow-outline m-auto">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                                            </svg>
                                            &nbsp;เปลี่ยนสถานะ
                                        </button>
                                    </td>
                                </tr>
                            )) : <tr className="border-b hover:bg-orange-100 bg-gray-100 text-center">
                                <td colSpan={8} className="p-3" width={"100%"}>ไม่มีโปรโมชั่น</td>
                            </tr>}

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
                                        เพิ่มโปรโมชั่น
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
                                            <label htmlFor="store" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">ร้าน{store[0]?.name}</label>
                                        </div>

                                        <div>
                                            <p className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">ชื่อโปรโมชั่น</p>
                                            <input ref={promotionNameRef} type="text" name="template_name" id="template_name" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="ชื่อเทมเพลต" required />
                                        </div>

                                        <div>
                                            <label htmlFor="role" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">เรทราคา</label>
                                            <select ref={rateIdRef} name="lotto" id="lotto" className='w-full border rounded p-3'>
                                                {rateIdAll.length > 0 ?
                                                    <option>--เลือกเรทการจ่าย--</option>
                                                    :
                                                    <option>-- ไม่มีเรทการจ่าย --</option>
                                                }
                                                {rateIdAll.length > 0 && rateIdAll.map((rate, index) => (
                                                    <option key={index} value={rate.rate_template_id}>{rate.r_name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">วันที่จัดโปรโมชั่น</label>
                                            <div className="flex items-center">
                                                <input onChange={selectDate} id='sunday' type="checkbox" value="sunday" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                                <label htmlFor="sunday" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">อาทิตย์</label>
                                            </div>
                                            <div className="flex items-center">
                                                <input onChange={selectDate} id='monday' type="checkbox" value="monday" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                                <label htmlFor="monday" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">จันทร์</label>
                                            </div>
                                            <div className="flex items-center">
                                                <input onChange={selectDate} id='tuesday' type="checkbox" value="tuesday" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                                <label htmlFor="tuesday" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">อังคาร</label>
                                            </div>
                                            <div className="flex items-center">
                                                <input onChange={selectDate} id='wednesday' type="checkbox" value="wednesday" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                                <label htmlFor="wednesday" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">พุธ</label>
                                            </div>
                                            <div className="flex items-center">
                                                <input onChange={selectDate} id='thursday' type="checkbox" value="thursday" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                                <label htmlFor="thursday" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">พฤหัส</label>
                                            </div>
                                            <div className="flex items-center">
                                                <input onChange={selectDate} id='friday' type="checkbox" value="friday" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                                <label htmlFor="friday" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">ศุกร์</label>
                                            </div>
                                            <div className="flex items-center">
                                                <input onChange={selectDate} id='saturday' type="checkbox" value="saturday" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                                <label htmlFor="saturday" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">เสาร์</label>
                                            </div>
                                        </div>
                                        <button type="submit" onClick={addPromotion} className="w-full text-white bg-blue-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">เพิ่มเรทการจ่าย</button>
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

export default ManagePromotion