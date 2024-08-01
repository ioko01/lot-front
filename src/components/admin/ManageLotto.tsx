import React, { useContext, useEffect, useRef, useState } from 'react'
import { stateModal } from '../../redux/features/modal/modalSlice'
import { useDispatch } from 'react-redux'
import { Modal } from '../modal/Modal'
import axios, { AxiosRequestConfig } from 'axios'
import { ILottoMySQL, TLottoDate, TLottoDateEnum, TLottoStatusEnum } from '../../models/Lotto'
import { AuthContext } from '../../context/AuthContextProvider'
import { TUserRoleEnum } from '../../models/User'
import { IRateMySQL } from '../../models/Rate'
import group from "../../group.json";
import { IStoreMySQL } from '../../models/Store'
import { TModifyCommissionStatus, TPromotionStatus } from '../../models/Promotion'

type Props = {}

const ManageLotto = (props: Props) => {

    const dispatch = useDispatch()
    const { isUser } = useContext(AuthContext)
    const [date, setDate] = useState<TLottoDate>(TLottoDateEnum.SELECT_DATE)
    const [currentFile, setCurrentFile] = useState<File>()
    const openHoursRef = useRef<HTMLSelectElement>(null);
    const openMinutesRef = useRef<HTMLSelectElement>(null);
    const closeHoursRef = useRef<HTMLSelectElement>(null);
    const closeMinutesRef = useRef<HTMLSelectElement>(null);
    const reportHoursRef = useRef<HTMLSelectElement>(null);
    const reportMinutesRef = useRef<HTMLSelectElement>(null);
    const thaiOpenRef = useRef<HTMLSelectElement>(null);
    const dateRef = useRef<HTMLSelectElement>(null);
    const lottoNameRef = useRef<HTMLInputElement>(null);
    const lottoApiRef = useRef<HTMLInputElement>(null);
    const isLoading = document.getElementById("loading")

    const [daysValue, setDaysValue] = useState<string[]>([]);
    const [lottosAll, setLottosAll] = useState<ILottoMySQL[]>([]);
    const [rateIdAll, setRateIdAll] = useState<IRateMySQL[]>([]);
    const [rateId, setRateId] = useState<string>("");
    const daysEN = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    const daysTH = ["จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส.", "อา."]

    const rateIdRef = useRef<HTMLSelectElement>(null);
    const groupRef = useRef<HTMLSelectElement>(null);

    const [store, setStore] = useState<IStoreMySQL[]>([]);
    const fetchStore = (id: string) => {
        const access_token = localStorage.getItem(import.meta.env.VITE_OPS_TOKEN);
        const axiosConfig: AxiosRequestConfig = { withCredentials: true, timeout: 10000, headers: { Authorization: `Bearer ${access_token}` } }
        axios.get(`${import.meta.env.VITE_OPS_URL}/store/${id}`, axiosConfig)
            .then((res) => {
                setStore(res.data)
            })
            .catch(() => {

            })
    }

    const fetchLotto = () => {
        const store_id = location.pathname.split("/")[2]
        fetchStore(store_id)
        const access_token = localStorage.getItem(import.meta.env.VITE_OPS_TOKEN);
        const axiosConfig: AxiosRequestConfig = { withCredentials: true, timeout: 10000, headers: { Authorization: `Bearer ${access_token}` } }
        axios.get(`${import.meta.env.VITE_OPS_URL}/lottos/${store_id}`, axiosConfig)
            .then((res) => {
                fetchRates(store_id)
                setLottosAll(res.data)
            })
            .catch(() => {

            })
    }

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

    const selectRate = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setRateId(e.currentTarget!.value)
    }

    const openModal = () => {
        dispatch(stateModal({ show: true, openModal: "CONFIG", confirm: true }))
    }

    const changeDate = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setDate(e.target.value as TLottoDate)
        setDaysValue([])
    }

    const hours = []
    for (let i = 0; i < 24; i++) {
        if (i < 10) {
            hours.push(`0${i}`)
        } else {
            hours.push(i)
        }
    }
    const minutes = []
    for (let i = 0; i < 60; i++) {
        if (i < 10) {
            minutes.push(`0${i}`)
        } else {
            minutes.push(i)
        }
    }

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { files } = e.target
        const selectedFiles = files as FileList;
        setCurrentFile(selectedFiles?.[0]);

    };

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

    const uploadFile = () => {
        const formData = new FormData();
        formData.append("File", currentFile!);
        const access_token = localStorage.getItem(import.meta.env.VITE_OPS_TOKEN);
        const axiosConfig: AxiosRequestConfig = { withCredentials: true, timeout: 10000, headers: { Authorization: `Bearer ${access_token}` } }
        axios.defaults.headers.common['Content-Type'] = 'multipart/form-data'

        return axios.post(`${import.meta.env.VITE_OPS_URL}/upload/file`, formData, axiosConfig)
    }

    const addLotto = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        isLoading!.removeAttribute("style")
        isLoading!.style.position = "fixed"
        uploadFile()

        const lotto: ILottoMySQL = {
            name: lottoNameRef.current!.value,
            date_open: daysValue,
            open: `${openHoursRef.current?.value}:${openMinutesRef.current?.value}`,
            close: `${closeHoursRef.current?.value}:${closeMinutesRef.current?.value}`,
            report: `${reportHoursRef.current?.value}:${reportMinutesRef.current?.value}`,
            status: TLottoStatusEnum.OPEN,
            date_type: date,
            img_flag: currentFile!.name.trim(),
            lotto_id: "",
            store_id: location.pathname.split("/")[2],
            user_create_id: "",
            groups: groupRef.current?.value,
            constructor: { name: "RowDataPacket" }
        }

        if (lottoApiRef.current!.value) Object.assign(lotto, { api: lottoApiRef.current!.value })

        rateIdAll.map((rate, i) => {
            if (rateIdRef.current!.value == rate.rate_template_id) {
                lotto.rate_template_id = rate.rate_template_id
                lotto.c_id = rate.c_id
                lotto.s_id = rate.s_id
            }
        })
        const access_token = localStorage.getItem(import.meta.env.VITE_OPS_TOKEN);
        const axiosConfig: AxiosRequestConfig = { withCredentials: true, timeout: 10000, headers: { Authorization: `Bearer ${access_token}` } }
        axios.post(`${import.meta.env.VITE_OPS_URL}/add/lotto`, lotto, axiosConfig).then((res) => {
            setDaysValue([])
            setCurrentFile(undefined)
            isLoading!.style.display = "none"
            dispatch(stateModal({ show: false, openModal: "CONFIG", confirm: true }))
            fetchLotto()
        })



    };


    const changStatusPromotion = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, status: TPromotionStatus, id: string) => {
        isLoading!.removeAttribute("style")
        isLoading!.style.position = "fixed"
        const promotion = {
            lotto_id: id,
            store_id: location.pathname.split("/")[2],
            status: status
        }
        if (isUser!.role == TUserRoleEnum.ADMIN) {
            Object.assign(promotion, { agent_id: store[0]!.user_create_id })
        }
        const access_token = localStorage.getItem(import.meta.env.VITE_OPS_TOKEN);
        const axiosConfig: AxiosRequestConfig = { withCredentials: true, timeout: 10000, headers: { Authorization: `Bearer ${access_token}` } }
        axios.put(`${import.meta.env.VITE_OPS_URL}/lotto/promotion/status`, promotion, axiosConfig).then((res) => {
            isLoading!.style.display = "none"
            dispatch(stateModal({ show: false, openModal: "CONFIG", confirm: true }))
            fetchLotto()
        })
    }

    const changStatusModifyCommission = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, status: TModifyCommissionStatus, id: string) => {
        isLoading!.removeAttribute("style")
        isLoading!.style.position = "fixed"
        const promotion = {
            lotto_id: id,
            store_id: location.pathname.split("/")[2],
            status: status
        }
        if (isUser!.role == TUserRoleEnum.ADMIN) {
            Object.assign(promotion, { agent_id: store[0]!.user_create_id })
        }
        const access_token = localStorage.getItem(import.meta.env.VITE_OPS_TOKEN);
        const axiosConfig: AxiosRequestConfig = { withCredentials: true, timeout: 10000, headers: { Authorization: `Bearer ${access_token}` } }
        axios.put(`${import.meta.env.VITE_OPS_URL}/lotto/commission/status`, promotion, axiosConfig).then((res) => {
            isLoading!.style.display = "none"
            dispatch(stateModal({ show: false, openModal: "CONFIG", confirm: true }))
            fetchLotto()
        })
    }

    useEffect(() => {
        fetchLotto()
    }, [dateRef])

    return (
        <>
            <div className='flex justify-end'>
                <button onClick={openModal} className="text-end mb-3 text-sm bg-blue-500 hover:bg-blue-700 text-white py-1 px-2 rounded focus:outline-none focus:shadow-outline">เพิ่มหวย</button>
            </div>

            <div className="text-gray-900">
                <div className="p-4 flex">
                    <h1 className="text-3xl">
                        รายการหวยร้าน <span className='text-blue-500'>{store[0]?.name}</span>
                    </h1>
                </div>
                <div className="overflow-x-auto px-3 py-4 w-full">
                    <table className="border border-neutral-200 text-md bg-white shadow-md rounded mb-4 w-full">
                        <thead className='border-b border-neutral-200'>
                            <tr className="border-b">
                                <th className="border-r whitespace-nowrap border-neutral-200 text-center p-3 px-5">#</th>
                                <th className="border-r whitespace-nowrap border-neutral-200 text-center p-3 px-5">ชื่อหวย</th>
                                <th className="border-r whitespace-nowrap border-neutral-200 text-center p-3 px-5">เปิด</th>
                                <th className="border-r whitespace-nowrap border-neutral-200 text-center p-3 px-5">ปิด</th>
                                <th className="border-r whitespace-nowrap border-neutral-200 text-center p-3 px-5">การออกผล</th>
                                <th className="border-r whitespace-nowrap border-neutral-200 text-center p-3 px-5">โปรโมชั่น</th>
                                <th className="border-r whitespace-nowrap border-neutral-200 text-center p-3 px-5">จัดการค่าคอม ฯ ด้วยตนเอง</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lottosAll.length > 0 && lottosAll[0].l_name ? lottosAll.map((lotto, index) => (
                                <tr key={index} className="border-b hover:bg-orange-100 bg-gray-100 text-center">
                                    <td className="p-3 border-r whitespace-nowrap border-neutral-200" width={"5%"}>{index + 1}</td>
                                    <td className="p-3 border-r whitespace-nowrap border-neutral-200" width={"15%"}>{lotto.l_name}</td>
                                    <td className="p-3 border-r whitespace-nowrap border-neutral-200" width={"15%"}>{lotto.open}</td>
                                    <td className="p-3 border-r whitespace-nowrap border-neutral-200" width={"15%"}>{lotto.close}</td>
                                    <td className="p-3 border-r whitespace-nowrap border-neutral-200" width={"15%"}>{lotto.date_type === "SELECT_DATE" ? JSON.parse(lotto.date_open!.toString()).length === 7 ? "ออกผลทุกวัน" : `${JSON.parse(lotto.date_open!.toString()).map((day: string) => daysTH[daysEN.indexOf(day)])}` : "ออกวันหวยไทย"}</td>
                                    <td className="p-3 border-r whitespace-nowrap border-neutral-200" width={"15%"}>
                                        {lotto.promotion === "USED" ? <p className='text-green-600'>ใช้งานโปรโมชั่น</p> : <p className='text-red-600'>ไม่ใช้งาน</p>}
                                        <button onClick={(e) => changStatusPromotion(e, lotto.promotion as TPromotionStatus == "USED" ? "NOT_USED" : lotto.promotion as TPromotionStatus == "NOT_USED" ? "USED" : "NOT_USED", lotto.l_id)} type="button" className="flex items-center text-sm bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-2 rounded focus:outline-none focus:shadow-outline m-auto">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                                            </svg>
                                            &nbsp;เปลี่ยนสถานะ
                                        </button>
                                    </td>
                                    <td className="p-3 border-r whitespace-nowrap border-neutral-200" width={"15%"}>
                                        {lotto.modify_commission === "YES" ? <p className='text-green-600'>ใช้งาน</p> : <p className='text-red-600'>ไม่ใช้งาน</p>}
                                        <button onClick={(e) => changStatusModifyCommission(e, lotto.modify_commission as TModifyCommissionStatus == "YES" ? "NO" : lotto.modify_commission as TModifyCommissionStatus == "NO" ? "YES" : "NO", lotto.l_id)} type="button" className="flex items-center text-sm bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-2 rounded focus:outline-none focus:shadow-outline m-auto">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                                            </svg>
                                            &nbsp;เปลี่ยนสถานะ
                                        </button>
                                    </td>
                                </tr>
                            )) :
                                <tr className="border-b hover:bg-orange-100 bg-gray-100 text-center">
                                    <td colSpan={6} className="p-3" width={"100%"}>ไม่มีรายการหวย</td>
                                </tr>
                            }
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
                                    เพิ่มหวย
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
                                        <label htmlFor="lotto_name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">ธง</label>
                                        <input type="file" onChange={onFileChange} accept='image/*' />
                                    </div>
                                    <div>
                                        <label htmlFor="lotto_name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">ชื่อหวย</label>
                                        <input ref={lottoNameRef} type="text" name="lotto_name" id="lotto_name" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="ชื่อหวย" required />
                                    </div>
                                    <div>
                                        <label htmlFor="role" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">กลุ่มหวย</label>
                                        <select onChange={selectRate} ref={groupRef} name="lotto" id="lotto" className='w-full border rounded p-3'>
                                            <option>--กลุ่มหวย--</option>
                                            {group[0].map((g, index) => (
                                                <option key={index} value={g}>{g}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="role" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">เรทราคา</label>
                                        <select onChange={selectRate} ref={rateIdRef} name="lotto" id="lotto" className='w-full border rounded p-3'>
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
                                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">วันเปิดรับ</label>
                                        <select onChange={changeDate} name="date" id="date" className='w-full border rounded p-3 mb-3'>
                                            <option value={TLottoDateEnum.SELECT_DATE} defaultChecked>เลือกวัน</option>
                                            <option value={TLottoDateEnum.THAI}>หวยไทย</option>
                                        </select>
                                        {
                                            date === TLottoDateEnum.SELECT_DATE ?
                                                <>
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
                                                </> :
                                                <>
                                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">เปิดรับก่อนหวยออก</label>
                                                    <div className='flex gap-3'>
                                                        <div>
                                                            <label htmlFor="day" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">วัน</label>
                                                            <select ref={thaiOpenRef} name="day" id="day" className='w-full border rounded p-3'>
                                                                <option value={1}>{1}</option>
                                                                <option value={2}>{2}</option>
                                                                <option value={3}>{3}</option>
                                                                <option value={4}>{4}</option>
                                                                <option value={5}>{5}</option>
                                                                <option value={6}>{6}</option>
                                                                <option value={7}>{7}</option>
                                                                <option value={8}>{8}</option>
                                                                <option value={9}>{9}</option>
                                                                <option value={10}>{10}</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </>
                                        }


                                    </div>
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">เวลาเปิด</label>
                                    <div className='flex gap-3'>
                                        <div>
                                            <label htmlFor="open_hours" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">ชั่วโมง</label>
                                            <select ref={openHoursRef} name="open_hours" id="open_hours" className='w-full border rounded p-3'>
                                                {hours.map((hour) => (
                                                    <option key={hour} value={hour}>{hour}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="open_minute" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">นาที</label>
                                            <select ref={openMinutesRef} name="open_minute" id="open_minute" className='w-full border rounded p-3'>
                                                {minutes.map((minute) => (
                                                    <option key={minute} value={minute}>{minute}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">เวลาปิด</label>
                                    <div className='flex gap-3'>
                                        <div>
                                            <label htmlFor="close_hours" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">ชั่วโมง</label>
                                            <select ref={closeHoursRef} name="close_hours" id="close_hours" className='w-full border rounded p-3'>
                                                {hours.map((hour) => (
                                                    <option key={hour} value={hour}>{hour}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="close_minute" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">นาที</label>
                                            <select ref={closeMinutesRef} name="close_minute" id="close_minute" className='w-full border rounded p-3'>
                                                {minutes.map((minute) => (
                                                    <option key={minute} value={minute}>{minute}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>


                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">เวลาผลออก</label>
                                    <div className='flex gap-3'>
                                        <div>
                                            <label htmlFor="report_hours" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">ชั่วโมง</label>
                                            <select ref={reportHoursRef} name="report_hours" id="report_hours" className='w-full border rounded p-3'>
                                                {hours.map((hour) => (
                                                    <option key={hour} value={hour}>{hour}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="report_minute" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">นาที</label>
                                            <select ref={reportMinutesRef} name="report_minute" id="report_minute" className='w-full border rounded p-3'>
                                                {minutes.map((minute) => (
                                                    <option key={minute} value={minute}>{minute}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="lotto_api" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Link API</label>
                                        <input ref={lottoApiRef} type="text" name="lotto_api" id="lotto_api" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Link API" />
                                    </div>
                                    <button type="submit" disabled={!currentFile} onClick={addLotto} className={(!currentFile ? 'bg-gray-300 text-gray-500 ' : 'bg-blue-600 hover:bg-blue-700 ') + "w-full text-white focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"}>เพิ่มหวย</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>
            </Modal>
        </>
    )
}

export default ManageLotto