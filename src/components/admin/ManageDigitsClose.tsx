import axios, { AxiosRequestConfig } from 'axios'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { ICheckRewardMySQL } from '../../models/CheckReward'
import { Modal } from '../modal/Modal'
import { useDispatch } from 'react-redux'
import { stateModal } from '../../redux/features/modal/modalSlice'
import Datepicker from 'react-tailwindcss-datepicker'
import { TDate, TypeDate } from '../../models/Main'
import moment from 'moment'
import { ILottoMySQL } from '../../models/Lotto'
import { ONE, TDigit, THREE, TWO } from '../../models/Type'
import { deleteBill } from '../../redux/features/bill/billSlice'
import { AuthContext } from '../../context/AuthContextProvider'
import { IStoreMySQL } from '../../models/Store'

type Props = {}
type DigitsCloseTopBottomToad = {
    one?: {
        top?: boolean,
        bottom?: boolean
    },
    two?: {
        top?: boolean,
        bottom?: boolean
    },
    three?: {
        top?: boolean,
        toad?: boolean
    }
}


type TDigit_POSITION = "TOP" | "BOTTOM" | "TOAD"

export interface DigitsClose {
    digit_type: TDigit
    digit: string[]
    position: TDigit_POSITION
}

const ManageDigitsClose = (props: Props) => {

    const [detailAll, setDetailAll] = useState<ICheckRewardMySQL[]>([])
    const [checkReward, setCheckReward] = useState<ICheckRewardMySQL>();
    const { isUser } = useContext(AuthContext)
    const initialDigitClose: DigitsCloseTopBottomToad = {
        one: {
            top: false,
            bottom: false
        },
        two: {
            top: false,
            bottom: false
        },
        three: {
            top: false,
            toad: false
        }
    }
    const [digitsCloseTopBottomToad, setDigitsCloseTopBottomToad] = useState<DigitsCloseTopBottomToad>(initialDigitClose)

    const [digitsCloseTopBottomToadTemp, setDigitsCloseTopBottomToadTemp] = useState<DigitsCloseTopBottomToad>(initialDigitClose)

    const [disabledDatepicker, setDisabledDatepicker] = useState<boolean>(true)
    const [disabledMonth, setDisabledMonth] = useState<boolean>(true)
    const [dateReward, setDateReward] = useState<TypeDate>({
        startDate: new Date(),
        endDate: new Date()
    })

    const [dateRewardThai, setDateRewardThai] = useState<TypeDate>({
        startDate: new Date(),
        endDate: new Date()
    })

    const [store, setStore] = useState<IStoreMySQL[]>([])

    const [digitsCloseTemp, setDigitCloseTemp] = useState<DigitsClose[]>([])
    const [digitCloseAndSemi, setDigitCloseAndSemi] = useState<"CLOSE" | "SEMI">("CLOSE")
    const [digitsTypeTemp, setDigitsTypeTemp] = useState<TDigit>("TWO")
    const [digitsType, setDigitsType] = useState<TDigit>("TWO")
    const [deleteDigitsTempModal, setDeleteDigitsTempModal] = useState<boolean>(false)
    const [digitsTemp, setDigitsTemp] = useState<string[]>([])
    const digitRef = useRef<HTMLInputElement>(null)
    const regex = /[\D\sa-zA-Zก-ฮ]/;

    const [isDate, setDate] = useState<TypeDate>({
        startDate: new Date(),
        endDate: new Date()
    });


    const handleDateChange = (newDate: TypeDate) => {
        setDate(newDate)
    }

    const fetchStore = (id: string) => {
        try {
            const access_token = localStorage.getItem(import.meta.env.VITE_OPS_TOKEN);
            const axiosConfig: AxiosRequestConfig = { withCredentials: true, timeout: 10000, headers: { Authorization: `Bearer ${access_token}` } }
            axios.get(`${import.meta.env.VITE_OPS_URL}/store/${id}`, axiosConfig)
                .then((response) => {
                    setStore(response.data)
                })
        } catch (error) {
        }
    }

    const toggleDisabled = (disabledMonth: boolean, disabledDatePicker: boolean) => {
        setDisabledMonth(disabledMonth)
        setDisabledDatepicker(disabledDatePicker)
    }

    const setDigitValue = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        const value = e.currentTarget!.value as TDigit
        setDigitsTypeTemp(value)
        setDigitsType(value)
        document.getElementById("input_digits")!.focus()
    }

    const removeDigitTemp = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) =>
        setDigitsTemp(digitsTemp.filter((_, index) => index !== parseInt(e.currentTarget.value)))

    const inputTemps = () => {
        if (ONE.includes(digitsType)) {
            const digits = digitRef.current!.value.split(regex);
            digits.map((digit) => {
                if (digit.length === 1) {
                    digitRef.current!.value = ""
                    const digitFilter = digits.filter((digit) => digit != "" && digit.length === 1)
                    if (digitsTemp.includes(digitFilter[0])) {
                        alert("มีเลขนี้แล้ว")
                    } else {
                        setDigitsTemp([...digitsTemp].concat(digitFilter))
                    }
                }
            })
        } else if (TWO.includes(digitsType)) {
            const digits = digitRef.current!.value.split(regex);
            digits.map((digit) => {
                if (digitsType === "TWO") {
                    if (digit.length === 2) {
                        digitRef.current!.value = ""
                        const digitFilter = digits.filter((digit) => digit != "" && digit.length === 2)
                        if (digitsTemp.includes(digitFilter[0])) {
                            alert("มีเลขนี้แล้ว")
                        } else {
                            setDigitsTemp([...digitsTemp].concat(digitFilter))
                        }
                    }
                }
            })
        } else if (THREE.includes(digitsType)) {
            const digits = digitRef.current!.value.split(regex);
            digits.map((digit) => {
                if (digit.length == 3) {
                    digitRef.current!.value = ""
                    const digitFilter = digits.filter((digit) => digit != "" && digit.length === 3)
                    if (digitsTemp.includes(digitFilter[0])) {
                        alert("มีเลขนี้แล้ว")
                    } else {
                        setDigitsTemp([...digitsTemp].concat(digitFilter))
                    }
                }
            })
        }
    }

    const addDigitsCloseTemp = () => {
        // const digits = digitsTemp.map((digitTemp) => {
        //     return digitTemp + ":" + (priceTopRef.current?.value ? priceTopRef.current!.value : "0") + ":" + (priceBottomRef.current?.value ? priceBottomRef.current!.value : "0")
        // })

        if (digitsTemp.length > 0) {
            const top = document.getElementById("top") as HTMLInputElement
            const bottom_or_toad = document.getElementById("bottom_or_toad") as HTMLInputElement
            if (!top.checked && !bottom_or_toad.checked) {
                alert("กรุณาเลือก บน/ล่าง")
            } else {

                setDigitCloseTemp([...digitsCloseTemp, { digit_type: digitsType, digit: digitsTemp, position: "TOP" }])
                setDigitsCloseTopBottomToadTemp(digitsCloseTopBottomToad)
                setDigitsTemp([])
                setDigitsCloseTopBottomToad(initialDigitClose)

                top.checked = false
                bottom_or_toad.checked = false
            }
        }

        setTimeout(() => {
            document.getElementById("input_digits")!.focus()

        }, 100)
    }

    const removeBillTemp = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        setDigitCloseTemp(digitsCloseTemp.filter((_, index) => index !== parseInt(e.currentTarget.value)))
    }

    const confirmDeleteDigitsTemp = () => {
        setDigitsTemp([])
        setDigitsType(digitsTypeTemp)
        dispatch(deleteBill())
        setDeleteDigitsTempModal(false)
    }

    const selectDateType = (date: TDate, month: number = 0) => {
        const thisDateStart = new Date()
        const thisDateEnd = new Date()
        let start = new Date()
        let end = new Date()

        if (date == "TODAY") {
            start = thisDateStart
            end = thisDateEnd
        }

        if (date == "YESTERDAY") {
            thisDateStart.setDate(thisDateStart.getDate() - 1).toString()
            thisDateEnd.setDate(thisDateEnd.getDate() - 1).toString()

            start = thisDateStart
            end = thisDateEnd
        }

        if (date == "THIS_WEEK") {
            thisDateStart.setDate(thisDateStart.getDate() - thisDateStart.getDay() + 1).toString()
            start = thisDateStart

            end = thisDateEnd
        }

        if (date == "LAST_WEEK") {
            thisDateStart.setDate(thisDateStart.getDate() - thisDateStart.getDay() - 7).toString()
            start = thisDateStart

            thisDateEnd.setDate(thisDateEnd.getDate() - thisDateEnd.getDay()).toString()
            end = thisDateEnd
        }

        if (date == "MONTH") {
            thisDateStart.setDate(1).toString()
            thisDateStart.setMonth(month - 1)
            start = thisDateStart

            thisDateEnd.setMonth(month, 0)
            end = thisDateEnd
        }

        if (date == "SELECT_DATE") {
            start = new Date(isDate!.startDate!)
            end = new Date(isDate!.endDate!)
        }

        setDate({
            startDate: start,
            endDate: end
        })
    }

    const dispatch = useDispatch();

    const fetchLottosAll = async () => {
        try {
            const store_id = location.pathname.split("/")[2]
            fetchStore(store_id)
            const access_token = localStorage.getItem(import.meta.env.VITE_OPS_TOKEN);
            const axiosConfig: AxiosRequestConfig = { withCredentials: true, timeout: 10000, headers: { Authorization: `Bearer ${access_token}` } }
            const fetchLottos = await axios.get(`${import.meta.env.VITE_OPS_URL}/lottos/${store_id}`, axiosConfig)
            if (fetchLottos) {
                let start = new Date(isDate!.startDate!)
                let end = new Date(isDate!.endDate!)



                const ds = `${start.getDate()}-${start.getMonth() + 1}-${start.getFullYear()}`
                const de = `${end.getDate()}-${end.getMonth() + 1}-${end.getFullYear()}`

                const lottos = fetchLottos.data as ILottoMySQL[]
                const isDateThai: TypeDate = {
                    startDate: new Date(),
                    endDate: new Date()
                }
                const fetchRewards = await axios.get(`${import.meta.env.VITE_OPS_URL}/reward/lottos/${store_id}/${ds}/${de}`, axiosConfig)
                if (fetchRewards) {
                    const rewards = fetchRewards.data as ICheckRewardMySQL[]
                    let getRewardAll: ICheckRewardMySQL[] = []
                    let times = new Date(Date.now())

                    lottos.map((lotto, index) => {
                        if (lotto.date_type == "THAI") {
                            isDateThai.startDate = new Date(lotto.thai_this_times)
                            isDateThai.endDate = new Date(lotto.thai_this_times)
                            times = new Date(lotto.thai_this_times)
                        } else {
                            times = new Date(Date.now())
                        }
                        getRewardAll.push({ top: "", bottom: "", l_name: lotto.l_name, l_id: lotto.l_id, times: times, date_type: lotto.date_type, constructor: { name: "RowDataPacket" } })
                        rewards.map(reward => {
                            if (reward.l_id == lotto.l_id) {
                                getRewardAll[index] = reward
                            }
                        })
                    })

                    setDetailAll(getRewardAll)
                    setDateReward(isDate)
                    setDateRewardThai(isDateThai)
                }

            }
        } catch (error) {
        }
    }

    const isLoading = document.getElementById("loading")
    const addDigitClose = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, reward: ICheckRewardMySQL) => {
        try {
            isLoading!.removeAttribute("style")
            isLoading!.style.position = "fixed"
            const one = document.querySelectorAll("#one_close_and_semi button")
            const two = document.querySelectorAll("#two_close_and_semi button")
            const three = document.querySelectorAll("#three_close_and_semi button")
            let data = {
                times: reward.times,
                store_id: location.pathname.split("/")[2],
                lotto_id: reward.l_id,
                one: {
                    top: [] as string[],
                    bottom: [] as string[]
                },
                two: {
                    top: [] as string[],
                    bottom: [] as string[]
                },
                three: {
                    top: [] as string[],
                    toad: [] as string[]
                }
            }
            one.forEach(txt => {
                data.one.top.push(txt.textContent!)
                data.one.bottom.push(txt.textContent!)
            });
            two.forEach(txt => {
                data.two.top.push(txt.textContent!)
                data.two.bottom.push(txt.textContent!)
            });
            three.forEach(txt => {
                data.three.top.push(txt.textContent!)
                data.three.toad.push(txt.textContent!)
            });

            const access_token = localStorage.getItem(import.meta.env.VITE_OPS_TOKEN);
            const axiosConfig: AxiosRequestConfig = { withCredentials: true, timeout: 10000, headers: { Authorization: `Bearer ${access_token}` } }
            const fetchDigitsClose = await axios.post(`${import.meta.env.VITE_OPS_URL}/add/digitclose`, data, axiosConfig)
            if (fetchDigitsClose) {
                isLoading!.style.display = "none"
                if (fetchDigitsClose.status == 200) {
                    dispatch(stateModal({ show: false, openModal: "SUCCESS", confirm: false }))
                    fetchLottosAll()
                } else {
                }
            }
        } catch (error) {
        }
    }

    const addDigitSemi = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, reward: ICheckRewardMySQL) => {
        try {
            isLoading!.removeAttribute("style")
            isLoading!.style.position = "fixed"
            const one = document.querySelectorAll("#one_close_and_semi button")
            const two = document.querySelectorAll("#two_close_and_semi button")
            const three = document.querySelectorAll("#three_close_and_semi button")
            console.log(reward.times);
            let data = {
                times: reward.times,
                store_id: location.pathname.split("/")[2],
                lotto_id: reward.l_id,
                one: {
                    top: [] as string[],
                    bottom: [] as string[]
                },
                two: {
                    top: [] as string[],
                    bottom: [] as string[]
                },
                three: {
                    top: [] as string[],
                    toad: [] as string[]
                }
            }
            one.forEach(txt => {
                data.one.top.push(txt.textContent!)
                data.one.bottom.push(txt.textContent!)
            });
            two.forEach(txt => {
                data.two.top.push(txt.textContent!)
                data.two.bottom.push(txt.textContent!)
            });
            three.forEach(txt => {
                data.three.top.push(txt.textContent!)
                data.three.toad.push(txt.textContent!)
            });

            const access_token = localStorage.getItem(import.meta.env.VITE_OPS_TOKEN);
            const axiosConfig: AxiosRequestConfig = { withCredentials: true, timeout: 10000, headers: { Authorization: `Bearer ${access_token}` } }
            const fetchDigitsClose = await axios.post(`${import.meta.env.VITE_OPS_URL}/add/digitsemi`, data, axiosConfig)
            if (fetchDigitsClose) {
                isLoading!.style.display = "none"
                if (fetchDigitsClose.status == 200) {
                    dispatch(stateModal({ show: false, openModal: "SUCCESS", confirm: false }))
                    fetchLottosAll()
                } else {
                }
            }
        } catch (error) {
        }
    }

    const openCheckRewardModal = (reward: ICheckRewardMySQL) => {
        dispatch(stateModal({ show: true, openModal: "CONFIG", confirm: true }))
        setCheckReward(reward);
    }

    useEffect(() => {
        fetchLottosAll()
    }, [])

    return (
        <>
            <strong>ตัวเลือกการค้นหา</strong>
            <div className="flex flex-row mt-3">
                <div className="flex items-center mr-10">
                    <input onChange={() => { toggleDisabled(true, true); selectDateType("TODAY"); }} defaultChecked id="today" type="radio" name="order_filter" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                    <label htmlFor="today" className="font-bold ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">วันนี้</label>
                </div>
                <div className="flex items-center mr-10">
                    <input onChange={() => { toggleDisabled(true, true); selectDateType("YESTERDAY"); }} id="yesterday" type="radio" name="order_filter" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                    <label htmlFor="yesterday" className="font-bold ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">เมื่อวาน</label>
                </div>
            </div>

            <div className="flex flex-row mt-3 whitespace-nowrap w-full">
                <div style={{ width: "90px" }} className="flex items-center">
                    <input onChange={() => { toggleDisabled(true, false); selectDateType("SELECT_DATE"); }} id="custom_date" type="radio" name="order_filter" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                    <label htmlFor="custom_date" className="font-bold ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">เลือกวันที่</label>
                </div>
                <div style={{ width: "320px" }} className="border rounded-lg">
                    <Datepicker
                        primaryColor="indigo"
                        i18n="th"
                        configs={{
                            footer: {
                                apply: "ยืนยัน",
                                cancel: "ยกเลิก"
                            }
                        }}
                        placeholder="วัน/เดือน/ปี"
                        value={isDate}
                        useRange={false}
                        asSingle={true}
                        inputClassName={"relative text-center transition-all duration-300 py-2.5 pl-4 pr-14 w-full border-gray-300 dark:bg-slate-800 dark:text-white/80 dark:border-slate-600 rounded-lg tracking-wide font-light text-sm placeholder-gray-400 bg-white focus:ring disabled:opacity-40 disabled:cursor-not-allowed focus:border-indigo-500 focus:ring-indigo-500/20"}
                        displayFormat={"DD/MM/YYYY"}
                        onChange={handleDateChange}
                        readOnly={true}
                        maxDate={new Date(Date.now())}
                        disabled={disabledDatepicker}
                    />
                </div>
            </div>

            <div className="flex flex-row mt-3">
                <button onClick={fetchLottosAll} className="inline-flex font-bold text-xs bg-blue-800 hover:bg-blue-700 text-white font-light p-2 px-4 rounded-md shadow">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    ค้นหา</button>
            </div>
            <br />
            <div className="text-gray-900">
                <div className="p-4 flex">
                    <h1 className="text-3xl">
                        จัดการเลขปิดรับร้าน <span className='text-blue-500'>{store[0]?.name}</span>
                    </h1>
                </div>
                <div className="overflow-x-auto px-3 py-4 w-full">
                    <table className="border border-neutral-200 text-md bg-white shadow-md rounded mb-4 w-full">
                        <thead className='border-b border-neutral-200'>
                            <tr className="border-b">
                                <th className="border-r whitespace-nowrap border-neutral-200 text-center p-3 px-5">#</th>
                                <th className="border-r whitespace-nowrap border-neutral-200 text-center p-3 px-5">ชื่อหวย</th>
                                <th className="border-r whitespace-nowrap border-neutral-200 text-center p-3 px-5">งวดที่</th>
                                <th className="border-r whitespace-nowrap border-neutral-200 text-center p-3 px-5">ปิดรับ</th>
                                <th className="border-r whitespace-nowrap border-neutral-200 text-center p-3 px-5">จ่ายครึ่ง</th>
                            </tr>
                        </thead>
                        <tbody>
                            {detailAll.length > 0 && detailAll[0].l_name ? detailAll.map((detail, index) => (
                                <tr key={index} className={"border-b hover:bg-orange-100 bg-gray-100 text-center"}>
                                    <td className="p-3 border-r whitespace-nowrap border-neutral-200" width={"10%"}>{index + 1}</td>
                                    <td className="p-3 border-r whitespace-nowrap border-neutral-200">{detail.l_name}</td>
                                    <td className="p-3 border-r whitespace-nowrap border-neutral-200">{detail.date_type == "THAI" ? dateRewardThai!.startDate ? moment(new Date(dateRewardThai!.startDate!)).format("DD-MM-YYYY") : moment(new Date(detail.times!)).format("DD-MM-YYYY") : dateReward!.startDate! ? moment(new Date(dateReward!.startDate!)).format("DD-MM-YYYY") : moment(new Date(detail.times!)).format("DD-MM-YYYY")}</td>
                                    <td className="p-3 border-r whitespace-nowrap border-neutral-200"><button className={'text-end mb-3 text-sm bg-blue-500 hover:bg-blue-700 text-white py-1 px-2 rounded focus:outline-none focus:shadow-outline'} onClick={() => { openCheckRewardModal(detail); setDigitCloseAndSemi("CLOSE") }}>ใส่เลขปิดรับ</button></td>
                                    <td className="p-3 border-r whitespace-nowrap border-neutral-200"><button className={'text-end mb-3 text-sm bg-blue-500 hover:bg-blue-700 text-white py-1 px-2 rounded focus:outline-none focus:shadow-outline'} onClick={() => { openCheckRewardModal(detail); setDigitCloseAndSemi("SEMI") }}>ใส่เลขจ่ายครึ่ง</button></td>
                                </tr>
                            )) :
                                <tr className="border-b hover:bg-orange-100 bg-gray-100 text-center">
                                    <td colSpan={5} className="p-3" width={"100%"}>ไม่มีรายการหวย</td>
                                </tr>
                            }

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
                                        {digitCloseAndSemi == "CLOSE" ? "ใส่เลขปิดรับ" : "ใส่เลขจ่ายครึ่ง"}
                                    </h1>
                                    <button data-modal-hide="default_modal" onClick={() => dispatch(stateModal({ show: false, openModal: "CONFIG" }))} className="text-xs text-gray-400 hover:text-gray-300 font-bold p-2 rounded shadow mx-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                                    <div className="space-y-4 md:space-y-6">


                                        <div>
                                            <label htmlFor="role" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">หวย {checkReward?.l_name}</label>
                                            <label htmlFor="role" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">งวดที่ {checkReward?.date_type == "THAI" ? moment(dateRewardThai!.startDate!).format("DD-MM-YYYY") : moment(isDate!.startDate!).format("DD-MM-YYYY")}</label>
                                        </div>
                                        <div>
                                            <label htmlFor="store" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">ชื่อร้าน: {store[0]?.name}</label>
                                        </div>

                                        <div className="w-full">
                                            <div id="bill_content" className="flex flex-col items-center">
                                                <div id="bill_screenshot" className="pt-3 w-full">
                                                    <div id="bill_body" className="flex flex-col items-center rounded-lg w-full mb-3 p-2">
                                                        <div className="flex flex-col w-full">
                                                            <button value={"TWO" as TDigit} onClick={setDigitValue} className={"w-full text-xs bg-white text-gray-800 font-semibold p-2 border rounded shadow mb-2 " + (digitsType === "TWO" ? "bg-blue-400 border-blue-500" : "bg-gray-100 border-gray-400 hover:bg-gray-200")}>2 ตัว</button>
                                                            <button value={"THREE" as TDigit} onClick={setDigitValue} className={"w-full text-xs bg-white text-gray-800 font-semibold p-2 border rounded shadow mb-2 " + (digitsType === "THREE" ? "bg-blue-400 border-blue-500" : "bg-gray-100 border-gray-400 hover:bg-gray-200")}>3 ตัว</button>
                                                            <button value={"ONE" as TDigit} onClick={setDigitValue} className={"w-full text-xs bg-white text-gray-800 font-semibold p-2 border rounded shadow mb-2 " + (digitsType === "ONE" ? "bg-blue-400 border-blue-500" : "bg-gray-100 border-gray-400 hover:bg-gray-200")}>เลขวิ่ง</button>
                                                        </div>

                                                        <div className="flex flex-col justify-between w-full">
                                                            <div id='one_close_and_semi' style={{ minHeight: "45px" }} className="bg-gray-100 my-4 py-1 relative">
                                                                <p style={{ fontSize: "10px", top: "-15px" }} className='absolute'>เลขวิ่ง</p>
                                                                {
                                                                    digitsTemp.map((digit, index) => digit.length == 1 && <button onClick={removeDigitTemp} value={index} key={index} className={"text-xs text-white font-semibold bg-blue-600 hover:bg-blue-700 p-3 border rounded shadow mx-1"}>{digit}</button>)
                                                                }
                                                            </div>
                                                            <div id='two_close_and_semi' style={{ minHeight: "45px" }} className="bg-gray-100 my-4 py-1 relative">
                                                                <p style={{ fontSize: "10px", top: "-15px" }} className='absolute'>เลข 2 ตัว</p>
                                                                {
                                                                    digitsTemp.map((digit, index) => digit.length == 2 && <button onClick={removeDigitTemp} value={index} key={index} className={"text-xs text-white font-semibold bg-blue-600 hover:bg-blue-700 p-3 border rounded shadow mx-1"}>{digit}</button>)
                                                                }
                                                            </div>
                                                            <div id='three_close_and_semi' style={{ minHeight: "45px" }} className="bg-gray-100 my-4 py-1 relative">
                                                                <p style={{ fontSize: "10px", top: "-15px" }} className='absolute'>เลข 3 ตัว</p>
                                                                {
                                                                    digitsTemp.map((digit, index) => digit.length == 3 && <button onClick={removeDigitTemp} value={index} key={index} className={"text-xs text-white font-semibold bg-blue-600 hover:bg-blue-700 p-3 border rounded shadow mx-1"}>{digit}</button>)
                                                                }
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col justify-around pt-4 gap-4 w-full">
                                                            <div className="relative z-0">
                                                                {/* <input tabIndex={1} ref={digitRef} onKeyUp={inputTempsKey} onChange={inputTemps} type={"text"} id="input_digits" className="bg-white rounded-none block h-8 py-2 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " /> */}
                                                                <input tabIndex={1} ref={digitRef} onChange={inputTemps} type={"text"} id="input_digits" className="bg-white rounded-none block h-8 py-2 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
                                                                <label htmlFor="input_digits" style={{ transition: ".3s" }} className="cursor-text peer-focus:cursor-default pl-1 absolute text-sm text-gray-500 dark:text-gray-400 transform -translate-y-6 scale-75 top-3 z-50 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-7">ใส่เลข</label>
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-between w-full p-2">
                                                            <div id="show_digit_orders" className="flex flex-col w-full">
                                                                {
                                                                    digitsCloseTemp!.map((bill, index) => (
                                                                        <div key={"bill_" + index} className="flex flex-row w-full bg-gray-100 justify-center items-center my-2">
                                                                            {
                                                                                bill.digit[0] && ONE.includes(bill.digit_type) ?
                                                                                    <div className="p-2 px-4 mx-auto text-center">วิ่ง<br />{digitsCloseTopBottomToadTemp.one?.top && " บน "}{digitsCloseTopBottomToadTemp.one?.bottom && " ล่าง "}</div>
                                                                                    : bill.digit[0] && TWO.includes(bill.digit_type) ?
                                                                                        <div className="p-2 px-4 mx-auto text-center">2 ตัว<br />{digitsCloseTopBottomToadTemp.two?.top && " บน "}{digitsCloseTopBottomToadTemp.two?.bottom && " ล่าง "}</div>
                                                                                        : bill.digit[0] && THREE.includes(bill.digit_type) &&
                                                                                        <div className="p-2 px-4 mx-auto text-center">3 ตัว<br />{digitsCloseTopBottomToadTemp.three?.top && " บน "}{digitsCloseTopBottomToadTemp.three?.toad && " โต๊ด "}</div>
                                                                            }
                                                                            <div key={"digit_" + index} className="w-3/5 h-full bg-white p-2 mx-auto">
                                                                                {
                                                                                    bill.digit.map((digit, index) => (
                                                                                        <span style={{ width: "15px" }} key={"number_" + index} className="inline-block font-light mx-2">{digit!.split(":")[0]!}&nbsp;</span>
                                                                                    ))
                                                                                }
                                                                            </div>
                                                                            <div key={"delete_" + index} className="mx-auto text-center">
                                                                                <button onClick={removeBillTemp} value={index} className="whitespace-nowrap inline-flex text-xs text-red-600 hover:text-red-400 font-light p-2 rounded shadow mx-2 mb-2">
                                                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                                                    </svg>
                                                                                    &nbsp;</button>
                                                                            </div>
                                                                        </div>

                                                                    ))
                                                                }
                                                            </div>
                                                            <div id="remove_digit_orders"></div>
                                                        </div>
                                                    </div>

                                                    <div id="bill_footer" className="flex flex-col items-center rounded-lg w-full mb-3 p-2"></div>
                                                </div>

                                            </div>
                                        </div>
                                        <button type="button" onClick={(e) => { digitCloseAndSemi == "CLOSE" ? addDigitClose(e, checkReward!) : addDigitSemi(e, checkReward!) }} className="w-full text-white bg-blue-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">ยืนยัน</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </>
            </Modal>
            {
                deleteDigitsTempModal &&
                <Modal>
                    <div className="flex flex-col">
                        <div className="flex flex-row text-sm">
                            <div className="relative w-full max-w-lg p-4 mx-auto bg-white shadow-lg">
                                <div className="mt-3 sm:flex">
                                    <div className="flex items-center mx-auto justify-center flex-none w-12 h-12 bg-red-100 rounded-full">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-6 h-6 text-red-600"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </div>
                                    <div className="mt-2 text-center w-full">
                                        <h4 className="text-lg font-medium text-gray-800">
                                            ต้องการล้างรายการหรือไม่ ?
                                        </h4>
                                        <div className="items-center gap-2 mt-3 sm:flex">
                                            <button
                                                className="w-full mt-2 p-2.5 flex-1 text-white bg-red-600 rounded-md outline-none ring-offset-2 ring-red-600 focus:ring-2"
                                                onClick={confirmDeleteDigitsTemp}
                                            >
                                                ลบ
                                            </button>
                                            <button
                                                className="w-full mt-2 p-2.5 flex-1 text-gray-800 rounded-md outline-none border ring-offset-2 ring-indigo-600 focus:ring-2"
                                                onClick={() => dispatch(stateModal({ show: false, openModal: "CONFIG" }))}
                                            >
                                                ยกเลิก
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal >
            }

        </>
    )
}

export default ManageDigitsClose