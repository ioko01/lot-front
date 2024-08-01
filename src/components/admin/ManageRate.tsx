import axios, { AxiosRequestConfig } from 'axios'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { useAppDispatch } from '../../redux/hooks'
import { stateModal } from '../../redux/features/modal/modalSlice'
import { Modal } from '../modal/Modal'
import {  IRateMySQL } from '../../models/Rate'
import { IStoreMySQL } from '../../models/Store'
import { ICommissionMySQL } from '../../models/Commission'
import { AuthContext } from '../../context/AuthContextProvider'
import { TUserRoleEnum } from '../../models/User'

type Props = {}

const ManageRate = (props: Props) => {
    const { isUser } = useContext(AuthContext)
    const dispatch = useAppDispatch()
    const [store, setStore] = useState<IStoreMySQL[]>([])
    const [rateTemplateAll, setRateTemplateAll] = useState<IRateMySQL[]>([])

    const templateNameRef = useRef<HTMLInputElement>(null);
    const oneTopRef = useRef<HTMLInputElement>(null);
    const oneTopMinRef = useRef<HTMLInputElement>(null);
    const oneTopMaxRef = useRef<HTMLInputElement>(null);
    const oneTopLimitRef = useRef<HTMLInputElement>(null);
    const oneBottomRef = useRef<HTMLInputElement>(null);
    const oneBottomMinRef = useRef<HTMLInputElement>(null);
    const oneBottomMaxRef = useRef<HTMLInputElement>(null);
    const oneBottomLimitRef = useRef<HTMLInputElement>(null);
    const twoTopRef = useRef<HTMLInputElement>(null);
    const twoTopMinRef = useRef<HTMLInputElement>(null);
    const twoTopMaxRef = useRef<HTMLInputElement>(null);
    const twoTopLimitRef = useRef<HTMLInputElement>(null);
    const twoBottomRef = useRef<HTMLInputElement>(null);
    const twoBottomMinRef = useRef<HTMLInputElement>(null);
    const twoBottomMaxRef = useRef<HTMLInputElement>(null);
    const twoBottomLimitRef = useRef<HTMLInputElement>(null);
    const threeTopRef = useRef<HTMLInputElement>(null);
    const threeTopMinRef = useRef<HTMLInputElement>(null);
    const threeTopMaxRef = useRef<HTMLInputElement>(null);
    const threeTopLimitRef = useRef<HTMLInputElement>(null);
    const threeBottomRef = useRef<HTMLInputElement>(null);
    const threeBottomMinRef = useRef<HTMLInputElement>(null);
    const threeBottomMaxRef = useRef<HTMLInputElement>(null);
    const threeBottomLimitRef = useRef<HTMLInputElement>(null);
    const commissionOneTopRef = useRef<HTMLInputElement>(null);
    const commissionOneBottomRef = useRef<HTMLInputElement>(null);
    const commissionTwoTopRef = useRef<HTMLInputElement>(null);
    const commissionTwoBottomRef = useRef<HTMLInputElement>(null);
    const commissionThreeTopRef = useRef<HTMLInputElement>(null);
    const commissionThreeBottomRef = useRef<HTMLInputElement>(null);

    const addRate = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        if (oneTopRef.current!.value
            && oneBottomRef.current!.value
            && twoTopRef.current!.value
            && twoBottomRef.current!.value
            && threeTopRef.current!.value
            && threeBottomRef.current!.value) {

            const rate: IRateMySQL = {
                store_id: store[0]!.store_id!,
                lotto_id: "",
                name: templateNameRef.current!.value,
                one_digits: { top: oneTopRef.current!.value, bottom: oneBottomRef.current!.value },
                two_digits: { top: twoTopRef.current!.value, bottom: twoBottomRef.current!.value },
                three_digits: { top: threeTopRef.current!.value, toad: threeBottomRef.current!.value },
                bet_one_digits: { top: `${oneTopMinRef.current!.value}:${oneTopMaxRef.current!.value}:${oneTopLimitRef.current!.value}`, bottom: `${oneBottomMinRef.current!.value}:${oneBottomMaxRef.current!.value}:${oneBottomLimitRef.current!.value}` },
                bet_two_digits: { top: `${twoTopMinRef.current!.value}:${twoTopMaxRef.current!.value}:${twoTopLimitRef.current!.value}`, bottom: `${twoBottomMinRef.current!.value}:${twoBottomMaxRef.current!.value}:${twoBottomLimitRef.current!.value}` },
                bet_three_digits: { top: `${threeTopMinRef.current!.value}:${threeTopMaxRef.current!.value}:${threeTopLimitRef.current!.value}`, toad: `${threeBottomMinRef.current!.value}:${threeBottomMaxRef.current!.value}:${threeBottomLimitRef.current!.value}` },
                committion_id: "",
                constructor: { name: "RowDataPacket" }
            }
            const commission = {
                commission: {
                    one_digits: {
                        top: commissionOneTopRef.current!.value,
                        bottom: commissionOneBottomRef.current!.value
                    },
                    two_digits: {
                        top: commissionTwoTopRef.current!.value,
                        bottom: commissionTwoBottomRef.current!.value
                    },
                    three_digits: {
                        top: commissionThreeTopRef.current!.value,
                        toad: commissionThreeBottomRef.current!.value
                    },
                } as ICommissionMySQL
            }
            const data = Object.assign(rate, commission)
            if (isUser!.role == TUserRoleEnum.ADMIN) {
                Object.assign(data, { agent_id: store[0]!.user_create_id })
            }
            const access_token = localStorage.getItem(import.meta.env.VITE_OPS_TOKEN);
            const axiosConfig: AxiosRequestConfig = { withCredentials: true, timeout: 10000, headers: { Authorization: `Bearer ${access_token}` } }
            axios.post(`${import.meta.env.VITE_OPS_URL}/add/rate_template`, data, axiosConfig)
                .then((res) => {
                    dispatch(stateModal({ show: false, openModal: "CONFIG", confirm: true }))
                    fetchRatesAll()
                })
        }
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

    const fetchRatesAll = () => {
        try {
            const store_id = location.pathname.split("/")[2]
            fetchStore(store_id)
            const access_token = localStorage.getItem(import.meta.env.VITE_OPS_TOKEN);
            const axiosConfig: AxiosRequestConfig = { withCredentials: true, timeout: 10000, headers: { Authorization: `Bearer ${access_token}` } }
            if (isUser!.role == TUserRoleEnum.ADMIN) {
                axios.get(`${import.meta.env.VITE_OPS_URL}/rates_template/${store_id}`, axiosConfig)
                    .then((response) => {
                        setRateTemplateAll(response.data)
                    })
            } else if (isUser!.role == TUserRoleEnum.AGENT) {
                axios.get(`${import.meta.env.VITE_OPS_URL}/rates_template/me`, axiosConfig)
                    .then((response) => {
                        setRateTemplateAll(response.data)
                    })
            }

        } catch (error) {
        }
    }


    useEffect(() => {
        fetchRatesAll()
    }, [])


    return (
        <>
            <div className='flex justify-end'>
                <button onClick={openModal} className="text-end mb-3 text-sm bg-blue-500 hover:bg-blue-700 text-white py-1 px-2 rounded focus:outline-none focus:shadow-outline">เพิ่มเรทการจ่าย</button>
            </div>
            <div className="text-gray-900">
                <div className="p-4 flex">
                    <h1 className="text-3xl">
                        เรทการจ่ายร้าน <span className='text-blue-500'>{rateTemplateAll[0]?.s_name}</span>
                    </h1>
                </div>
                <div className="overflow-x-auto px-3 py-4 w-full">
                    <table className="min-w-full border border-neutral-200 text-md bg-white shadow-md rounded mb-4 w-full">
                        <thead className='border-b border-neutral-200'>
                            <tr className="border-b">
                                <th className="border-r whitespace-nowrap border-neutral-200 text-center p-3 px-5">#</th>
                                <th className="border-r whitespace-nowrap border-neutral-200 text-center p-3 px-5">ชื่อเรทการจ่าย</th>
                                <th className="border-r whitespace-nowrap border-neutral-200 text-center p-3 px-5">วิ่งบน</th>
                                <th className="border-r whitespace-nowrap border-neutral-200 text-center p-3 px-5">วิ่งล่าง</th>
                                <th className="border-r whitespace-nowrap border-neutral-200 text-center p-3 px-5">2 ตัวบน</th>
                                <th className="border-r whitespace-nowrap border-neutral-200 text-center p-3 px-5">2 ตัวล่าง</th>
                                <th className="border-r whitespace-nowrap border-neutral-200 text-center p-3 px-5">3 ตัวบน</th>
                                <th className="border-r whitespace-nowrap border-neutral-200 text-center p-3 px-5">3 ตัวโต๊ด</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rateTemplateAll.length > 0 ? rateTemplateAll.map((rate, index) => (
                                <tr key={index} className="border-b hover:bg-orange-100 bg-gray-100 text-center">
                                    <td className="p-3 border-r whitespace-nowrap border-neutral-200" width={"5%"}>{index + 1}</td>
                                    <td className="p-3 border-r whitespace-nowrap border-neutral-200">{rate.r_name}</td>
                                    <td className="p-3 border-r whitespace-nowrap border-neutral-200 text-left text-sm">
                                        จ่าย: <span className='text-blue-500'>{JSON.parse(rate.rt_one_digits).top} บาท</span><br />
                                        แทงต่ำสุด: <span className='text-blue-500'>{parseFloat(JSON.parse(rate.rt_bet_one_digits).top.split(":")[0]).toLocaleString('en-US')} บาท</span><br />
                                        แทงสูงสุด: <span className='text-blue-500'>{parseFloat(JSON.parse(rate.rt_bet_one_digits).top.split(":")[1]).toLocaleString('en-US')} บาท</span><br />
                                        รับได้สูงสุด: <span className='text-blue-500'>{parseFloat(JSON.parse(rate.rt_bet_one_digits).top.split(":")[2]).toLocaleString('en-US')} บาท</span><br />
                                        คอมมิชชัน: <span className='text-blue-500'>{parseFloat(JSON.parse(rate.c_one_digits).top).toLocaleString('en-US')}%</span><br />
                                    </td>
                                    <td className="p-3 border-r whitespace-nowrap border-neutral-200 text-left text-sm">
                                        จ่าย: <span className='text-blue-500'>{JSON.parse(rate.rt_one_digits).bottom} บาท</span><br />
                                        แทงต่ำสุด: <span className='text-blue-500'>{parseFloat(JSON.parse(rate.rt_bet_one_digits).bottom.split(":")[0]).toLocaleString('en-US')} บาท</span><br />
                                        แทงสูงสุด: <span className='text-blue-500'>{parseFloat(JSON.parse(rate.rt_bet_one_digits).bottom.split(":")[1]).toLocaleString('en-US')} บาท</span><br />
                                        รับได้สูงสุด: <span className='text-blue-500'>{parseFloat(JSON.parse(rate.rt_bet_one_digits).bottom.split(":")[2]).toLocaleString('en-US')} บาท</span><br />
                                        คอมมิชชัน: <span className='text-blue-500'>{parseFloat(JSON.parse(rate.c_one_digits).bottom).toLocaleString('en-US')}%</span><br />
                                    </td>
                                    <td className="p-3 border-r whitespace-nowrap border-neutral-200 text-left text-sm">
                                        จ่าย: <span className='text-blue-500'>{JSON.parse(rate.rt_two_digits).top} บาท</span><br />
                                        แทงต่ำสุด: <span className='text-blue-500'>{parseFloat(JSON.parse(rate.rt_bet_two_digits).top.split(":")[0]).toLocaleString('en-US')} บาท</span><br />
                                        แทงสูงสุด: <span className='text-blue-500'>{parseFloat(JSON.parse(rate.rt_bet_two_digits).top.split(":")[1]).toLocaleString('en-US')} บาท</span><br />
                                        รับได้สูงสุด: <span className='text-blue-500'>{parseFloat(JSON.parse(rate.rt_bet_two_digits).top.split(":")[2]).toLocaleString('en-US')} บาท</span><br />
                                        คอมมิชชัน: <span className='text-blue-500'>{parseFloat(JSON.parse(rate.c_two_digits).top).toLocaleString('en-US')}%</span><br />
                                    </td>
                                    <td className="p-3 border-r whitespace-nowrap border-neutral-200 text-left text-sm">
                                        จ่าย: <span className='text-blue-500'>{JSON.parse(rate.rt_two_digits).bottom} บาท</span><br />
                                        แทงต่ำสุด: <span className='text-blue-500'>{parseFloat(JSON.parse(rate.rt_bet_two_digits).bottom.split(":")[0]).toLocaleString('en-US')} บาท</span><br />
                                        แทงสูงสุด: <span className='text-blue-500'>{parseFloat(JSON.parse(rate.rt_bet_two_digits).bottom.split(":")[1]).toLocaleString('en-US')} บาท</span><br />
                                        รับได้สูงสุด: <span className='text-blue-500'>{parseFloat(JSON.parse(rate.rt_bet_two_digits).bottom.split(":")[2]).toLocaleString('en-US')} บาท</span><br />
                                        คอมมิชชัน: <span className='text-blue-500'>{parseFloat(JSON.parse(rate.c_two_digits).bottom).toLocaleString('en-US')}%</span><br />
                                    </td>
                                    <td className="p-3 border-r whitespace-nowrap border-neutral-200 text-left text-sm">
                                        จ่าย: <span className='text-blue-500'>{JSON.parse(rate.rt_three_digits).top} บาท</span><br />
                                        แทงต่ำสุด: <span className='text-blue-500'>{parseFloat(JSON.parse(rate.rt_bet_three_digits).top.split(":")[0]).toLocaleString('en-US')} บาท</span><br />
                                        แทงสูงสุด: <span className='text-blue-500'>{parseFloat(JSON.parse(rate.rt_bet_three_digits).top.split(":")[1]).toLocaleString('en-US')} บาท</span><br />
                                        รับได้สูงสุด: <span className='text-blue-500'>{parseFloat(JSON.parse(rate.rt_bet_three_digits).top.split(":")[2]).toLocaleString('en-US')} บาท</span><br />
                                        คอมมิชชัน: <span className='text-blue-500'>{parseFloat(JSON.parse(rate.c_three_digits).top).toLocaleString('en-US')}%</span><br />
                                    </td>
                                    <td className="p-3 border-r whitespace-nowrap border-neutral-200 text-left text-sm">
                                        จ่าย: <span className='text-blue-500'>{JSON.parse(rate.rt_three_digits).toad} บาท</span><br />
                                        แทงต่ำสุด: <span className='text-blue-500'>{parseFloat(JSON.parse(rate.rt_bet_three_digits).toad.split(":")[0]).toLocaleString('en-US')} บาท</span><br />
                                        แทงสูงสุด: <span className='text-blue-500'>{parseFloat(JSON.parse(rate.rt_bet_three_digits).toad.split(":")[1]).toLocaleString('en-US')} บาท</span><br />
                                        รับได้สูงสุด: <span className='text-blue-500'>{parseFloat(JSON.parse(rate.rt_bet_three_digits).toad.split(":")[2]).toLocaleString('en-US')} บาท</span><br />
                                        คอมมิชชัน: <span className='text-blue-500'>{parseFloat(JSON.parse(rate.c_three_digits).toad).toLocaleString('en-US')}%</span><br />
                                    </td>
                                </tr>
                            )) : <tr className="border-b hover:bg-orange-100 bg-gray-100 text-center">
                                <td colSpan={8} className="p-3" width={"100%"}>ไม่มีเรทราคา</td>
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
                                        เพิ่มเรทการจ่าย
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
                                            <p className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">ชื่อเทมเพลต</p>
                                            <input ref={templateNameRef} type="text" name="template_name" id="template_name" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="ชื่อเทมเพลต" required />
                                        </div>

                                        <div>
                                            <p className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">ค่าคอมมิชชันเลขวิ่ง</p>
                                            <input ref={commissionOneTopRef} type="number" name="commission_one_top" id="commission_one_top" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="วิ่งบน" required />
                                            <input ref={commissionOneBottomRef} type="number" name="commission_one_bottom" id="commission_one_bottom" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="วิ่งล่าง" required />
                                        </div>
                                        <div>
                                            <p className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">ค่าคอมมิชชันเลข 2 ตัว</p>
                                            <input ref={commissionTwoTopRef} type="number" name="commission_two_top" id="commission_two_top" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="2 ตัวบน" required />
                                            <input ref={commissionTwoBottomRef} type="number" name="commission_two_bottom" id="commission_two_bottom" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="2 ตัวล่าง" required />
                                        </div>
                                        <div>
                                            <p className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">ค่าคอมมิชชันเลข 3 ตัว</p>
                                            <input ref={commissionThreeTopRef} type="number" name="commission_three_top" id="commission_three_top" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="3 ตัวบน" required />
                                            <input ref={commissionThreeBottomRef} type="number" name="commission_three_bottom" id="commission_three_bottom" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="3 ตัวโต๊ด" required />
                                        </div>

                                        <div>
                                            <p className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">อัตราจ่ายวิ่งบน</p>
                                            <input ref={oneTopRef} type="number" name="one_top" id="one_top" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="อัตราจ่าย" required />
                                            <input ref={oneTopMinRef} type="number" name="one_top_min" id="one_top_min" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="แทงขั้นต่ำ" required />
                                            <input ref={oneTopMaxRef} type="number" name="one_top_max" id="one_top_max" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="แทงสูงสุด" required />
                                            <input ref={oneTopLimitRef} type="number" name="one_top_limit" id="one_top_limit" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="ลิมิต" required />
                                        </div>
                                        <div>
                                            <p className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">อัตราจ่ายวิ่งล่าง</p>
                                            <input ref={oneBottomRef} type="number" name="one_bottom" id="one_bottom" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="อัตราจ่าย" required />
                                            <input ref={oneBottomMinRef} type="number" name="one_bottom_min" id="one_bottom_min" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="แทงขั้นต่ำ" required />
                                            <input ref={oneBottomMaxRef} type="number" name="one_bottom_max" id="one_bottom_max" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="แทงสูงสุด" required />
                                            <input ref={oneBottomLimitRef} type="number" name="one_bottom_limit" id="one_bottom_limit" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="ลิมิต" required />
                                        </div>
                                        <div>
                                            <p className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">อัตราจ่าย 2 ตัวบน</p>
                                            <input ref={twoTopRef} type="number" name="two_top" id="two_top" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="อัตราจ่าย" required />
                                            <input ref={twoTopMinRef} type="number" name="two_top_min" id="two_top_min" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="แทงขั้นต่ำ" required />
                                            <input ref={twoTopMaxRef} type="number" name="two_top_max" id="two_top_max" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="แทงสูงสุด" required />
                                            <input ref={twoTopLimitRef} type="number" name="two_top_limit" id="two_top_limit" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="ลิมิต" required />
                                        </div>
                                        <div>
                                            <p className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">อัตราจ่าย 2 ตัวล่าง</p>
                                            <input ref={twoBottomRef} type="number" name="two_bottom" id="two_bottom" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="อัตราจ่าย" required />
                                            <input ref={twoBottomMinRef} type="number" name="two_bottom_min" id="two_bottom_min" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="แทงขั้นต่ำ" required />
                                            <input ref={twoBottomMaxRef} type="number" name="two_bottom_max" id="two_bottom_max" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="แทงสูงสุด" required />
                                            <input ref={twoBottomLimitRef} type="number" name="two_bottom_limit" id="two_bottom_limit" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="ลิมิต" required />
                                        </div>
                                        <div>
                                            <p className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">อัตราจ่าย 3 ตัวบน</p>
                                            <input ref={threeTopRef} type="number" name="three_top" id="three_top" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="อัตราจ่าย" required />
                                            <input ref={threeTopMinRef} type="number" name="three_top_min" id="three_top_min" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="แทงขั้นต่ำ" required />
                                            <input ref={threeTopMaxRef} type="number" name="three_top_max" id="three_top_max" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="แทงสูงสุด" required />
                                            <input ref={threeTopLimitRef} type="number" name="three_top_limit" id="three_top_limit" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="ลิมิต" required />
                                        </div>
                                        <div>
                                            <p className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">อัตราจ่าย 3 ตัวโต๊ด</p>
                                            <input ref={threeBottomRef} type="number" name="three_bottom" id="three_bottom" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="อัตราจ่าย" required />
                                            <input ref={threeBottomMinRef} type="number" name="three_bottom_min" id="three_bottom_min" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="แทงขั้นต่ำ" required />
                                            <input ref={threeBottomMaxRef} type="number" name="three_bottom_max" id="three_bottom_max" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="แทงสูงสุด" required />
                                            <input ref={threeBottomLimitRef} type="number" name="three_bottom_limit" id="three_bottom_limit" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="ลิมิต" required />
                                        </div>
                                        <button type="submit" onClick={addRate} className="w-full text-white bg-blue-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">เพิ่มเรทการจ่าย</button>
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

export default ManageRate