import { Fragment, useContext, useEffect, useRef, useState } from "react";
import Datepicker from "react-tailwindcss-datepicker";
import { IBillMySQL, TBillStatus } from "../../models/Bill";
import axios, { AxiosRequestConfig } from "axios";
import moment from "moment";
import { ICheckRewardMySQL } from "../../models/CheckReward";
import { TDate, TypeDate } from "../../models/Main";
import { stateModal } from "../../redux/features/modal/modalSlice";
import { Modal } from "../modal/Modal";
import { useAppDispatch } from "../../redux/hooks";
import { AuthContext } from "../../context/AuthContextProvider";
import { IPromotionMySQL } from "../../models/Promotion";
import { IDigitSemiMySQL } from "../../models/DigitSemi";

interface Reward {
    id: string;
    one_digit?: {
        top?: string[]
        bottom?: string[]
    }
    two_digit?: {
        top?: string[]
        bottom?: string[]
    }
    three_digit?: {
        top?: string[]
        toad?: string[]
    }
    bill_price: number;
    total_win: number;
    rebate: number;
    status: TBillStatus;
}
export function OrderList() {

    const [isDate, setDate] = useState<TypeDate>({
        startDate: new Date(),
        endDate: new Date()
    });

    const [disabledDatepicker, setDisabledDatepicker] = useState<boolean>(true)
    const [disabledMonth, setDisabledMonth] = useState<boolean>(true)
    const [bills, setBills] = useState<IBillMySQL[]>([])
    const [lottoGroup, setLottoGroup] = useState<string[]>([])
    const [billId, setBillId] = useState<IBillMySQL>()
    const [billReward, setBillReward] = useState<Reward[]>([])
    const [deleteBillModal, setDeleteBillModal] = useState<boolean>(false)
    const [detailBillModal, setDetailBillModal] = useState<boolean>(false)
    const dispatch = useAppDispatch()
    const { isUser } = useContext(AuthContext)
    const [promotions, setPromotions] = useState<IPromotionMySQL[]>([])
    const day = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const dateNow = new Date();



    const handleDateChange = (newDate: TypeDate) => {
        setDate(newDate)
    }

    const toggleDisabled = (disabledMonth: boolean, disabledDatePicker: boolean) => {
        setDisabledMonth(disabledMonth)
        setDisabledDatepicker(disabledDatePicker)
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

    const [digitSemi, setDigitSemi] = useState<IDigitSemiMySQL | null>(null)
    const fetchDigitSemi = async (id: string) => {
        try {
            const start = new Date(isDate!.startDate!)
            const end = new Date(isDate!.endDate!)

            const ds = `${start.getDate()}-${start.getMonth() + 1}-${start.getFullYear()}`
            const de = `${end.getDate()}-${end.getMonth() + 1}-${end.getFullYear()}`
            const access_token = localStorage.getItem(import.meta.env.VITE_OPS_TOKEN);
            const axiosConfig: AxiosRequestConfig = { withCredentials: true, timeout: 10000, headers: { Authorization: `Bearer ${access_token}` } }
            const res = await axios.get(import.meta.env.VITE_OPS_URL + `/get/digitsemi/${id}/${isUser!.store_id}/${ds}/${de}`, axiosConfig)
            if (res.data && res.status == 200) {
                setDigitSemi(res.data)
            } else {
                setDigitSemi(null)
            }

        } catch (error) {
        }

    }

    const isLoading = document.getElementById("loading")
    const fetchBills = async () => {
        try {
            isLoading!.removeAttribute("style")
            isLoading!.style.position = "fixed"
            const start = new Date(isDate!.startDate!)
            const end = new Date(isDate!.endDate!)

            const ds = `${start.getDate()}-${start.getMonth() + 1}-${start.getFullYear()}`
            const de = `${end.getDate()}-${end.getMonth() + 1}-${end.getFullYear()}`

            fetchPromotions()
            const access_token = localStorage.getItem(import.meta.env.VITE_OPS_TOKEN);
            const axiosConfig: AxiosRequestConfig = { withCredentials: true, timeout: 10000, headers: { Authorization: `Bearer ${access_token}` } }
            const res = await axios.get(`${import.meta.env.VITE_OPS_URL}/get/bill/me/${ds}/${de}`, axiosConfig)
            if (res && res.status == 200) {
                const data = res.data as IBillMySQL[]
                let group: string[] = []
                setBills(data)
                const fetchReward = await axios.get(`${import.meta.env.VITE_OPS_URL}/reward/lottos/${isUser?.store_id}/${ds}/${de}`, axiosConfig)
                if (fetchReward && fetchReward.status == 200) {
                    const reward = fetchReward.data as ICheckRewardMySQL[]
                    const bill_reward: Reward[] = []
                    if (reward.length > 0) {
                        data.map((bill, i) => {
                            bill_reward[i] = {
                                id: bill.b_id!,
                                bill_price: bill.price,
                                total_win: bill.win,
                                rebate: bill.rebate,
                                one_digit: { top: [], bottom: [] },
                                two_digit: { top: [], bottom: [] },
                                three_digit: { top: [], toad: [] },
                                status: "REWARD",
                            }
                            reward.map((r, j) => {
                                if (bill.l_id == r.l_id && bill.times == r.times) {
                                    bill.b_one_digits && (JSON.parse(bill.b_one_digits) as string[])?.map(one => {
                                        const ONE = one.split(":")
                                        if (r.top?.match(ONE[0])) bill_reward[i].one_digit?.top?.push(`${ONE[0]}:${ONE[1]}`)
                                        if (r.bottom?.match(ONE[0])) bill_reward[i].one_digit?.bottom?.push(`${ONE[0]}:${ONE[2]}`)
                                    })
                                    bill.b_two_digits && (JSON.parse(bill.b_two_digits) as string[]).map(two => {
                                        const TWO = two.split(":")
                                        if (r.top?.substring(1).match(TWO[0])) bill_reward[i].two_digit?.top?.push(`${TWO[0]}:${TWO[1]}`)
                                        if (r.bottom?.match(TWO[0])) bill_reward[i].two_digit?.bottom?.push(`${TWO[0]}:${TWO[2]}`)
                                    })
                                    bill.b_three_digits && (JSON.parse(bill.b_three_digits) as string[]).map(three => {
                                        const THREE = three.split(":")
                                        if (r.top?.match(THREE[0])) {
                                            if (THREE[1] != "0") bill_reward[i].three_digit?.top?.push(`${THREE[0]}:${THREE[1]}`)
                                            if (THREE[2] != "0") bill_reward[i].three_digit?.toad?.push(`${THREE[0]}:${THREE[2]}`)
                                        } else {
                                            const tmpFilter: string[] = []
                                            const tmp: string[] = []
                                            const split = r.top?.split("")
                                            split?.map((_, index) => {
                                                const arrTemp: number[] = []
                                                for (let i = 0; i < 3; i++) (i !== index) && arrTemp.push(i)
                                                tmp.push(split[index].concat(split[arrTemp[0]], split[arrTemp[1]]))
                                                tmp.push(split[index].concat(split[arrTemp[1]], split[arrTemp[0]]))
                                            })
                                            const filter = Array.from(new Set(tmp))
                                            filter.map((digit, index) => index > 0 && tmpFilter.push(digit))
                                            if (tmpFilter.includes(THREE[0])) bill_reward[i].three_digit?.toad?.push(`${THREE[0]}:${THREE[2]}`)
                                        }
                                    })
                                }
                            })
                        })
                    }
                    setBillReward(bill_reward)
                }

                data.map((bill, index) => {
                    if (group.length == 0) {
                        group.push(bill.l_name!)
                    } else if (!group.includes(bill.l_name!)) {
                        group.push(bill.l_name!)
                    }
                })

                setLottoGroup(group)
                isLoading!.style.display = "none";
            }


        } catch (error) {

        }


    }

    const detail = (bill: IBillMySQL) => {
        fetchDigitSemi(bill.l_id);
        setBillId(bill);
        setDeleteBillModal(false)
        setDetailBillModal(true)
        dispatch(stateModal({ show: true, openModal: "CONFIG", confirm: false }))
    }

    const deleteBill = (bill: IBillMySQL) => {
        setBillId(bill);
        setDeleteBillModal(true)
        setDetailBillModal(false)
        dispatch(stateModal({ show: true, openModal: "CONFIG", confirm: true }))
    }

    const confirmDelete = async () => {
        if (billId) {
            const access_token = localStorage.getItem(import.meta.env.VITE_OPS_TOKEN);
            const axiosConfig: AxiosRequestConfig = { withCredentials: true, timeout: 10000, headers: { Authorization: `Bearer ${access_token}` } }
            await axios.put(`${import.meta.env.VITE_OPS_URL}/delete/bill`, billId, axiosConfig)
        }
        fetchBills()
        setDeleteBillModal(false)
        setDetailBillModal(false)
        dispatch(stateModal({ show: false, openModal: "CONFIG" }))
    }

    const fetchPromotions = () => {
        try {
            const access_token = localStorage.getItem(import.meta.env.VITE_OPS_TOKEN);
            const axiosConfig: AxiosRequestConfig = { withCredentials: true, timeout: 10000, headers: { Authorization: `Bearer ${access_token}` } }
            axios.get(`${import.meta.env.VITE_OPS_URL}/promotions/${isUser!.store_id}/used`, axiosConfig)
                .then((response) => {
                    setPromotions(response.data)
                })

        } catch (error) {
        }
    }

    // const fetAPI = async () => {
    //     const updateCheckReward = await axios.get(import.meta.env.VITE_OPS_URL + `/result/api`, axiosConfig)

    //     if (updateCheckReward && updateCheckReward.status == 200) {
    //         fetchBills()
    //     }
    // }

    useEffect(() => {
        fetchBills()
    }, [])

    const render = () => {
        return (
            <>
                <div id="order_list" className="flex flex-row">
                    <div id="order_content" className="w-full">
                        <div id="order_header" className="flex flex-col w-full">
                            <strong className="text-lg h-10 text-[blue]">รายการแทง (ตามชนิดหวย)</strong>
                            <div className="flex flex-col border rounded w-full p-4">
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
                                    <div className="flex items-center mr-10">
                                        <input onChange={() => { toggleDisabled(true, true); selectDateType("THIS_WEEK"); }} id="weeked" type="radio" name="order_filter" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                        <label htmlFor="weeked" className="font-bold ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">สัปดาห์นี้</label>
                                    </div>
                                    <div className="flex items-center mr-10">
                                        <input onChange={() => { toggleDisabled(true, true); selectDateType("LAST_WEEK"); }} id="last_week" type="radio" name="order_filter" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                        <label htmlFor="last_week" className="font-bold ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">สัปดาห์ที่แล้ว</label>
                                    </div>
                                </div>

                                <div className="flex flex-row mt-3">
                                    <div style={{ width: "90px" }} className="flex items-center">
                                        <input onChange={() => { toggleDisabled(false, true); selectDateType("MONTH"); }} id="month" type="radio" name="order_filter" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                        <label htmlFor="month" className="font-bold ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">เดือน</label>
                                    </div>
                                    <div className="flex items-center mr-6">
                                        <label htmlFor="select_month" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"></label>
                                        <select onChange={(e) => { selectDateType("MONTH", parseInt(e.currentTarget.value)) }} style={{ width: "320px" }} disabled={disabledMonth} id="select_month" className="text-center transition-all duration-300 py-2.5 w-full border border-gray-300 dark:bg-slate-800 dark:text-white/80 dark:border-slate-600 rounded-lg tracking-wide font-light text-sm placeholder-gray-400 bg-white focus:ring disabled:opacity-40 disabled:cursor-not-allowed focus:border-indigo-500 focus:ring-indigo-500/20">
                                            <option className="font-normal">-- เลือกเดือน --</option>
                                            <option value="1" className="font-normal">มกราคม</option>
                                            <option value="2" className="font-normal">กุมภาพันธ์</option>
                                            <option value="3" className="font-normal">มีนาคม</option>
                                            <option value="4" className="font-normal">เมษายน</option>
                                            <option value="5" className="font-normal">พฤษภาคม</option>
                                            <option value="6" className="font-normal">มิถุนายน</option>
                                            <option value="7" className="font-normal">กรกฎาคม</option>
                                            <option value="8" className="font-normal">สิงหาคม</option>
                                            <option value="9" className="font-normal">กันยายน</option>
                                            <option value="10" className="font-normal">ตุลาคม</option>
                                            <option value="11" className="font-normal">พฤษจิกายน</option>
                                            <option value="12" className="font-normal">ธันวาคม</option>
                                        </select>
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
                                            placeholder="วัน/เดือน/ปี - วัน/เดือน/ปี"
                                            value={isDate}
                                            useRange={false}
                                            showFooter={true}
                                            separator="-"
                                            inputClassName={"relative text-center transition-all duration-300 py-2.5 pl-4 pr-14 w-full border-gray-300 dark:bg-slate-800 dark:text-white/80 dark:border-slate-600 rounded-lg tracking-wide font-light text-sm placeholder-gray-400 bg-white focus:ring disabled:opacity-40 disabled:cursor-not-allowed focus:border-indigo-500 focus:ring-indigo-500/20"}
                                            displayFormat={"DD/MM/YYYY"}
                                            onChange={handleDateChange}
                                            readOnly={true}
                                            disabled={disabledDatepicker}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-row mt-3">
                                    <button onClick={fetchBills} className="inline-flex font-bold text-xs bg-blue-800 hover:bg-blue-700 text-white font-light p-2 px-4 rounded-md shadow">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                        </svg>
                                        ค้นหา</button>
                                </div>
                                {

                                    <div className="flex flex-row mt-3">
                                        <table className="border-collapse border border-slate-400 w-full text-center">
                                            <thead className="bg-blue-800 text-white text-xs">
                                                <tr>
                                                    <th style={{ width: "150px" }}>วันที่</th>
                                                    <th style={{ width: "170px" }}>ชนิดหวย</th>
                                                    <th style={{ width: "90px" }}>งวดที่</th>
                                                    <th style={{ width: "130px" }}>ยอดแทง</th>
                                                    <th style={{ width: "80px" }}>ส่วนลด</th>
                                                    <th style={{ width: "150px" }}>ถูกรางวัล</th>
                                                    <th style={{ width: "100px" }}>แพ้/ชนะ</th>
                                                    <th style={{ width: "100px" }}>หมายเหตุ</th>
                                                    <th>#</th>
                                                    <th>#</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    Object.values(bills).map((bill, i) => {
                                                        return (
                                                            <Fragment key={i}>
                                                                {
                                                                    <>
                                                                        {
                                                                            billReward?.map(bill_reward => (
                                                                                (bill_reward.id == bill.b_id) &&
                                                                                <tr key={i} className={bill.b_status == "CANCEL" ? "bg-red-200" : bill_reward.total_win > 0 ? "bg-blue-200" : ""}>
                                                                                    <td className="border border-slate-300 font-light">{moment(new Date(bill.b_created_at)).format("DD-MM-YYYY HH:mm:ss")}</td>
                                                                                    <td className="border border-slate-300 font-light">{bill.l_name!}</td>
                                                                                    <td className="border border-slate-300 font-light">{moment(new Date(bill.times)).format("DD-MM-YYYY")}</td>
                                                                                    <td className="border border-slate-300 text-green-600">{bill.b_status == "CANCEL" ? "0.00" : (parseFloat(bill_reward.bill_price.toString()) - parseFloat(bill_reward.rebate.toString())) ? (parseFloat(bill_reward.bill_price.toString()) - parseFloat(bill_reward.rebate.toString())).toFixed(2) : "0.00"}</td>
                                                                                    <td className="border border-slate-300">{bill.b_status == "CANCEL" ? "0.00" : parseFloat(bill_reward.rebate.toString()) ? parseFloat(bill_reward.rebate.toString()).toFixed(2) : "0.00"}</td>
                                                                                    <td className={`border border-slate-300 ${bill.b_status == "CANCEL" ? "text-red-600" : bill_reward.total_win > 0 ? 'text-blue-600' : 'text-red-500'}`}>{bill.b_status == "WAIT" ? "รอผล" : bill.b_status == "CANCEL" ? "ยกเลิก" : bill.b_status == "REWARD" ? bill_reward.total_win > 0 ? parseFloat(bill_reward.total_win.toString()).toLocaleString('en-US', { minimumFractionDigits: 2 }) : "ไม่ถูกรางวัล" : "ไม่ถูกรางวัล"}</td>
                                                                                    <td className={`border border-slate-300 ${bill.b_status == "CANCEL" ? "text-red-600" : (bill_reward.total_win - parseFloat(bill_reward.bill_price.toString()) > 0) ? " text-blue-600" : " text-red-500"}`}>{bill.b_status == "CANCEL" ? "" : bill.b_status == "WAIT" ? "" : (bill_reward.total_win - bill_reward.bill_price) ? (parseFloat(bill_reward.total_win.toString()) + parseFloat(bill_reward.rebate.toString()) - parseFloat(bill_reward.bill_price.toString())).toLocaleString('en-us', { minimumFractionDigits: 2 }) : "0.00"}</td>
                                                                                    <td className="border border-slate-300 font-light">{bill.note}</td>
                                                                                    <td className="border border-slate-300 font-light">
                                                                                        <button onClick={() => detail(bill)} className="text-[blue] hover:text-blue-500 hover:text-blue-800 px-2">ดูรายละเอียด</button>
                                                                                    </td>
                                                                                    <td className="border border-slate-300 font-light">
                                                                                        {
                                                                                            bill.b_status == "WAIT" && <button onClick={() => deleteBill(bill)} className="text-xs text-red-600 hover:text-red-400 font-bold p-2 rounded shadow mx-2">
                                                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                                                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                                                                </svg></button>
                                                                                        }
                                                                                    </td>
                                                                                </tr>
                                                                            ))
                                                                        }
                                                                        {
                                                                            (billReward.length == 0) &&
                                                                            <tr key={i} className={bill.b_status == "CANCEL" ? "bg-red-200" : ""}>
                                                                                <td className="border border-slate-300 font-light">{moment(new Date(bill.b_created_at)).format("DD-MM-YYYY HH:mm:ss")}</td>
                                                                                <td className="border border-slate-300 font-light">{bill.l_name!}</td>
                                                                                <td className="border border-slate-300 font-light">{moment(new Date(bill.times)).format("DD-MM-YYYY")}</td>
                                                                                <td className="border border-slate-300 text-green-600">{bill.b_status == "CANCEL" ? "0.00" : (parseFloat(bill.price.toString()) - parseFloat(bill.rebate.toString())) ? (parseFloat(bill.price.toString()) - parseFloat(bill.rebate.toString())).toFixed(2) : "0.00"}</td>
                                                                                <td className="border border-slate-300">{bill.b_status == "CANCEL" ? "0.00" : parseFloat(bill.rebate.toString()) ? parseFloat(bill.rebate.toString()).toFixed(2) : "0.00"}</td>
                                                                                <td className={`border border-slate-300 ${bill.b_status == "WAIT" ? "text-blue-600" : bill.b_status == "CANCEL" ? "text-red-600" : bill.b_status == "REWARD" ? "text-blue-600" : ""}`}>{bill.b_status == "WAIT" ? "รอผล" : bill.b_status == "CANCEL" ? "ยกเลิก" : bill.b_status == "REWARD" ? "" : ""}</td>
                                                                                <td className={`border border-slate-300`}></td>
                                                                                <td className="border border-slate-300 font-light">{bill.note}</td>
                                                                                <td className="border border-slate-300 font-light">
                                                                                    <button onClick={() => detail(bill)} className="text-[blue] hover:text-blue-500 hover:text-blue-800 px-2">ดูรายละเอียด</button>
                                                                                </td>
                                                                                <td className="border border-slate-300 font-light">

                                                                                    {bill.b_status == "WAIT" && <button onClick={() => deleteBill(bill)} className="text-xs text-red-600 hover:text-red-400 font-bold p-2 rounded shadow mx-2">
                                                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                                                        </svg></button>}

                                                                                </td>
                                                                            </tr>
                                                                        }
                                                                    </>
                                                                }
                                                            </Fragment>
                                                        )
                                                    })

                                                }

                                                <tr>
                                                    <td colSpan={3} className="border border-slate-300 bg-gray-200">รวม</td>
                                                    <td className="border border-slate-300 bg-gray-200 text-green-600">{
                                                        (Object.values(bills).map<number>((b: IBillMySQL, i) => {
                                                            let iTotal = 0;
                                                            if (b.b_status == "CANCEL") return iTotal = 0
                                                            iTotal += parseFloat(b.price) - parseFloat(b.rebate)
                                                            return iTotal
                                                        }).reduce((price, cur) => price + cur, 0).toLocaleString('en-us', { minimumFractionDigits: 2 }))
                                                    }</td>
                                                    <td className="border border-slate-300 bg-gray-200">{
                                                        Object.values(bills).map<number>((b: IBillMySQL, i) => {
                                                            let iTotal = 0;
                                                            if (b.b_status == "CANCEL") return iTotal = 0
                                                            iTotal += parseFloat(b.rebate)
                                                            return iTotal
                                                        }).reduce((price, cur) => price + cur, 0).toLocaleString('en-us', { minimumFractionDigits: 2 })
                                                    }</td>
                                                    <td className="border border-slate-300 bg-gray-200 text-green-600"></td>
                                                    <td className={"border border-slate-300 bg-gray-200" + (
                                                        Object.values(bills).map<number>((b: IBillMySQL, i) => {
                                                            if (b.b_status == "WAIT" || b.b_status == "CANCEL") return 0
                                                            let iTotal = 0;
                                                            if (billReward) {
                                                                Object.values(billReward).map(bill_reward => {
                                                                    if (bill_reward.id == b.b_id) iTotal += parseFloat(bill_reward.total_win.toString()) + parseFloat(b.rebate) - parseFloat(bill_reward.bill_price.toString())
                                                                })
                                                            }

                                                            return iTotal
                                                        }).reduce((price, cur) => price + cur, 0) > 0 ? " text-blue-600" : " text-red-600"
                                                    )}>
                                                        {
                                                            Object.values(bills).map<number>((b: IBillMySQL, i) => {
                                                                if (b.b_status == "WAIT" || b.b_status == "CANCEL") return 0
                                                                let iTotal = 0;
                                                                if (billReward) {
                                                                    Object.values(billReward).map(bill_reward => {
                                                                        if (bill_reward.id == b.b_id) iTotal += parseFloat(bill_reward.total_win.toString()) + parseFloat(b.rebate) - parseFloat(bill_reward.bill_price.toString())
                                                                    })
                                                                }

                                                                return iTotal
                                                            }).reduce((price, cur) => price + cur, 0).toLocaleString('en-us', { minimumFractionDigits: 2 })
                                                        }
                                                    </td>
                                                    <td colSpan={3} className="border border-slate-300 bg-gray-200"></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>

                {detailBillModal &&
                    <Modal>
                        <div id="bill_check" className="flex flex-col">
                            <div className="flex flex-row text-sm">
                                <div className="basis-6/6 w-full p-2">
                                    <div id="bill_content" className="flex flex-col items-center">
                                        <div id="bill_header" className="flex flex-col items-start rounded-sm w-full mb-3 p-2">
                                            <span>
                                                [{billId?.l_name!}]  &nbsp;
                                                {billId?.times ? moment(new Date(billId?.times)).format("DD-MM-YYYY") : ""} &nbsp;
                                                {billId?.b_status == "WAIT" && <span className="bg-yellow-500 text-sm px-1 rounded">ส่งโพย</span>}
                                                {billId?.b_status == "REWARD" && <span className="bg-blue-500 text-white text-sm px-1 rounded">ออกรางวัล</span>}
                                                {billId?.b_status == "CANCEL" && <span className="bg-red-500 text-white text-sm px-1 rounded">ยกเลิกโพย</span>}
                                            </span>
                                        </div>
                                        <div id="bill_body" className="flex flex-col items-center w-full p-2">
                                            <table className="border-collapse border border-slate-300 w-full text-xs">
                                                <thead className="bg-blue-800 text-white text-center">
                                                    <tr>
                                                        <th className="border border-slate-300">ประเภท @ หมายเลข</th>
                                                        <th className="border border-slate-300">ยอดเดิมพัน</th>
                                                        <th className="border border-slate-300">ส่วนลด</th>
                                                        <th className="border border-slate-300">
                                                            <div className="flex justify-between px-1">
                                                                <span>
                                                                    จ่าย
                                                                </span>
                                                                <span>
                                                                    รวม
                                                                </span>
                                                            </div>

                                                        </th>
                                                        <th className="border border-slate-300">สถานะ</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        billId?.b_one_digits && (JSON.parse(billId?.b_one_digits) as string[]).map((one, i) => (
                                                            parseInt(one.split(":")[1]) > 0 &&
                                                            <tr key={i} className={billId?.b_status != "CANCEL" && billReward.find((r) => (r.one_digit?.top?.includes(`${one.split(":")[0]}:${one.split(":")[1]}`) && r.id == billId?.b_id)) ? "bg-blue-200" : ""}>
                                                                <td className={`border border-slate-300 text-center font-light`}>วิ่งบน @ {one.split(":")[0]}</td>
                                                                <td className={`border border-slate-300 text-center font-light`}>{parseInt(one.split(":")[1]).toFixed(2)}</td>
                                                                <td className={`border border-slate-300 text-center font-light`}>{(parseInt(one.split(":")[1]) * parseInt(JSON.parse(billId?.c_one_digits).top)) / 100}</td>
                                                                <td className="border border-slate-300 text-center">
                                                                    <div className="flex justify-between px-1">
                                                                        <span className="font-light">{
                                                                            billId?.promotion == "USED" && promotions[0] && JSON.parse(promotions[0]?.p_promotion.toString()).includes(day[new Date(billId?.times).getDay()]) ?
                                                                                digitSemi && JSON.parse(digitSemi!.one_digits as string).top.includes(one.split(":")[0]) ?
                                                                                    (JSON.parse(promotions[0]?.rt_one_digits).top / 2).toFixed(2) :
                                                                                    JSON.parse(promotions[0]?.rt_one_digits).top :

                                                                                digitSemi && JSON.parse(digitSemi!.one_digits as string).top.includes(one.split(":")[0]) ?
                                                                                    (JSON.parse(billId?.rt_one_digits).top / 2).toFixed(2) :
                                                                                    JSON.parse(billId?.rt_one_digits).top}
                                                                        </span>
                                                                        <span className="font-light">{
                                                                            billId?.promotion == "USED" && promotions[0] && JSON.parse(promotions[0]?.p_promotion.toString()).includes(day[new Date(billId?.times).getDay()]) ?
                                                                                digitSemi && JSON.parse(digitSemi!.one_digits as string).top.includes(one.split(":")[0]) ?
                                                                                    (parseInt(JSON.parse(promotions[0]?.rt_one_digits).top) / 2 * parseInt(one.split(":")[1])).toFixed(2) :
                                                                                    parseInt(JSON.parse(promotions[0]?.rt_one_digits).top) * parseInt(one.split(":")[1]) :

                                                                                digitSemi && JSON.parse(digitSemi!.one_digits as string).top.includes(one.split(":")[0]) ?
                                                                                    (parseInt(JSON.parse(billId?.rt_one_digits).top) / 2 * parseInt(one.split(":")[1])).toFixed(2) :
                                                                                    parseInt(JSON.parse(billId?.rt_one_digits).top) * parseInt(one.split(":")[1])}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td className={`border border-slate-300 text-center font-light ${billId?.b_status != "CANCEL" ? billReward.find((r) => (r.one_digit?.top?.includes(`${one.split(":")[0]}:${one.split(":")[1]}`) && r.id == billId?.b_id)) ? "text-blue-600" : billId?.b_status == "REWARD" ? "text-red-600" : "text-blue-600" : "text-red-600"}`}>
                                                                    {billId?.b_status != "CANCEL" ? billReward.find((r) => (r.one_digit?.top?.includes(`${one.split(":")[0]}:${one.split(":")[1]}`) && r.id == billId?.b_id)) ? "ถูกรางวัล" : billId?.b_status == "REWARD" ? "ไม่ถูกรางวัล" : "รอผล" : "ยกเลิก"}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    }
                                                    {
                                                        billId?.b_one_digits && (JSON.parse(billId?.b_one_digits) as string[]).map((one, i) => (
                                                            parseInt(one.split(":")[2]) > 0 &&
                                                            <tr key={i} className={billId?.b_status != "CANCEL" && billReward.find((r) => (r.one_digit?.bottom?.includes(`${one.split(":")[0]}:${one.split(":")[2]}`) && r.id == billId?.b_id)) ? "bg-blue-200" : ""}>
                                                                <td className={`border border-slate-300 text-center font-light`}>วิ่งล่าง @ {one.split(":")[0]}</td>
                                                                <td className={`border border-slate-300 text-center font-light`}>{parseInt(one.split(":")[2]).toFixed(2)}</td>
                                                                <td className={`border border-slate-300 text-center font-light`}>{(parseInt(one.split(":")[2]) * parseInt(JSON.parse(billId?.c_one_digits).bottom)) / 100}</td>
                                                                <td className="border border-slate-300 text-center">
                                                                    <div className="flex justify-between px-1">
                                                                        <span className="font-light">{
                                                                            billId?.promotion == "USED" && promotions[0] && JSON.parse(promotions[0]?.p_promotion.toString()).includes(day[new Date(billId?.times).getDay()]) ?
                                                                                digitSemi && JSON.parse(digitSemi!.one_digits as string).bottom.includes(one.split(":")[0]) ?
                                                                                    (JSON.parse(promotions[0]?.rt_one_digits).bottom / 2).toFixed(2) :
                                                                                    JSON.parse(promotions[0]?.rt_one_digits).bottom :

                                                                                digitSemi && JSON.parse(digitSemi!.one_digits as string).bottom.includes(one.split(":")[0]) ?
                                                                                    (JSON.parse(billId?.rt_one_digits).bottom / 2).toFixed(2) :
                                                                                    JSON.parse(billId?.rt_one_digits).bottom}
                                                                        </span>
                                                                        <span className="font-light">{
                                                                            billId?.promotion == "USED" && promotions[0] && JSON.parse(promotions[0]?.p_promotion.toString()).includes(day[new Date(billId?.times).getDay()]) ?
                                                                                digitSemi && JSON.parse(digitSemi!.one_digits as string).bottom.includes(one.split(":")[0]) ?
                                                                                    (parseInt(JSON.parse(promotions[0]?.rt_one_digits).bottom) / 2 * parseInt(one.split(":")[1])).toFixed(2) :
                                                                                    parseInt(JSON.parse(promotions[0]?.rt_one_digits).bottom) * parseInt(one.split(":")[2]) :

                                                                                digitSemi && JSON.parse(digitSemi!.one_digits as string).bottom.includes(one.split(":")[0]) ?
                                                                                    (parseInt(JSON.parse(billId?.rt_one_digits).bottom) / 2 * parseInt(one.split(":")[1])).toFixed(2) :
                                                                                    parseInt(JSON.parse(billId?.rt_one_digits).bottom) * parseInt(one.split(":")[2])}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td className={`border border-slate-300 text-center font-light ${billId?.b_status != "CANCEL" ? billReward.find((r) => (r.one_digit?.bottom?.includes(`${one.split(":")[0]}:${one.split(":")[2]}`) && r.id == billId?.b_id)) ? "text-blue-600" : billId?.b_status == "REWARD" ? "text-red-600" : "text-blue-600" : "text-red-600"}`}>
                                                                    {billId?.b_status != "CANCEL" ? billReward.find((r) => (r.one_digit?.bottom?.includes(`${one.split(":")[0]}:${one.split(":")[2]}`) && r.id == billId?.b_id)) ? "ถูกรางวัล" : billId?.b_status == "REWARD" ? "ไม่ถูกรางวัล" : "รอผล" : "ยกเลิก"}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    }
                                                    {
                                                        billId?.b_two_digits && (JSON.parse(billId?.b_two_digits) as string[]).map((two, i) => (
                                                            parseInt(two.split(":")[1]) > 0 &&
                                                            <tr key={i} className={billId?.b_status != "CANCEL" && billReward.find((r) => (r.two_digit?.top?.includes(`${two.split(":")[0]}:${two.split(":")[1]}`)) && r.id == billId?.b_id) ? "bg-blue-200" : ""}>
                                                                <td className={`border border-slate-300 text-center font-light`}>2 ตัวบน @ {two.split(":")[0]}</td>
                                                                <td className={`border border-slate-300 text-center font-light`}>{parseInt(two.split(":")[1]).toFixed(2)}</td>
                                                                <td className={`border border-slate-300 text-center font-light`}>{(parseInt(two.split(":")[1]) * parseInt(JSON.parse(billId?.c_two_digits).top)) / 100}</td>
                                                                <td className="border border-slate-300 text-center">
                                                                    <div className="flex justify-between px-1">
                                                                        <span className="font-light">{
                                                                            billId?.promotion == "USED" && promotions[0] && JSON.parse(promotions[0]?.p_promotion.toString()).includes(day[new Date(billId?.times).getDay()]) ?
                                                                                digitSemi && JSON.parse(digitSemi!.two_digits as string).top.includes(two.split(":")[0]) ?
                                                                                    (JSON.parse(promotions[0]?.rt_two_digits).top / 2).toFixed(2) :
                                                                                    JSON.parse(promotions[0]?.rt_two_digits).top :

                                                                                digitSemi && JSON.parse(digitSemi!.two_digits as string).top.includes(two.split(":")[0]) ?
                                                                                    (JSON.parse(billId?.rt_two_digits).top / 2).toFixed(2) :
                                                                                    JSON.parse(billId?.rt_two_digits).top}
                                                                        </span>
                                                                        <span className="font-light">{
                                                                            billId?.promotion == "USED" && promotions[0] && JSON.parse(promotions[0]?.p_promotion.toString()).includes(day[new Date(billId?.times).getDay()]) ?
                                                                                digitSemi && JSON.parse(digitSemi!.two_digits as string).top.includes(two.split(":")[0]) ?
                                                                                    (parseInt(JSON.parse(promotions[0]?.rt_two_digits).top) / 2 * parseInt(two.split(":")[1])).toFixed(2) :
                                                                                    parseInt(JSON.parse(promotions[0]?.rt_two_digits).top) * parseInt(two.split(":")[1]) :

                                                                                digitSemi && JSON.parse(digitSemi!.two_digits as string).top.includes(two.split(":")[0]) ?
                                                                                    (parseInt(JSON.parse(billId?.rt_two_digits).top) / 2 * parseInt(two.split(":")[1])).toFixed(2) :
                                                                                    parseInt(JSON.parse(billId?.rt_two_digits).top) * parseInt(two.split(":")[1])}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td className={`border border-slate-300 text-center font-light ${billId?.b_status != "CANCEL" ? billReward.find((r) => (r.two_digit?.top?.includes(`${two.split(":")[0]}:${two.split(":")[1]}`)) && r.id == billId?.b_id) ? "text-blue-600" : billId?.b_status == "REWARD" ? "text-red-600" : "text-blue-600" : "text-red-600"}`}>
                                                                    {billId?.b_status != "CANCEL" ? billReward.find((r) => (r.two_digit?.top?.includes(`${two.split(":")[0]}:${two.split(":")[1]}`)) && r.id == billId?.b_id) ? "ถูกรางวัล" : billId?.b_status == "REWARD" ? "ไม่ถูกรางวัล" : "รอผล" : "ยกเลิก"}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    }
                                                    {
                                                        billId?.b_two_digits && (JSON.parse(billId?.b_two_digits) as string[]).map((two, i) => (
                                                            parseInt(two.split(":")[2]) > 0 &&
                                                            <tr key={i} className={billId?.b_status != "CANCEL" && billReward.find((r) => (r.two_digit?.bottom?.includes(`${two.split(":")[0]}:${two.split(":")[2]}`) && r.id == billId?.b_id)) ? "bg-blue-200" : ""}>
                                                                <td className={`border border-slate-300 text-center font-light`}>2 ตัวล่าง @ {two.split(":")[0]}</td>
                                                                <td className={`border border-slate-300 text-center font-light`}>{parseInt(two.split(":")[2]).toFixed(2)}</td>
                                                                <td className={`border border-slate-300 text-center font-light`}>{(parseInt(two.split(":")[2]) * parseInt(JSON.parse(billId?.c_two_digits).bottom)) / 100}</td>
                                                                <td className="border border-slate-300 text-center">
                                                                    <div className="flex justify-between px-1">
                                                                        <span className="font-light">{
                                                                            billId?.promotion == "USED" && promotions[0] && JSON.parse(promotions[0]?.p_promotion.toString()).includes(day[new Date(billId?.times).getDay()]) ?
                                                                                digitSemi && JSON.parse(digitSemi!.two_digits as string).bottom.includes(two.split(":")[0]) ?
                                                                                    (JSON.parse(promotions[0]?.rt_two_digits).bottom / 2).toFixed(2) :
                                                                                    JSON.parse(promotions[0]?.rt_two_digits).bottom :

                                                                                digitSemi && JSON.parse(digitSemi!.two_digits as string).bottom.includes(two.split(":")[0]) ?
                                                                                    (JSON.parse(billId?.rt_two_digits).bottom / 2).toFixed(2) :
                                                                                    JSON.parse(billId?.rt_two_digits).bottom}
                                                                        </span>
                                                                        <span className="font-light">{
                                                                            billId?.promotion == "USED" && promotions[0] && JSON.parse(promotions[0]?.p_promotion.toString()).includes(day[new Date(billId?.times).getDay()]) ?
                                                                                digitSemi && JSON.parse(digitSemi!.two_digits as string).bottom.includes(two.split(":")[0]) ?
                                                                                    (parseInt(JSON.parse(promotions[0]?.rt_two_digits).bottom) / 2 * parseInt(two.split(":")[1])).toFixed(2) :
                                                                                    parseInt(JSON.parse(promotions[0]?.rt_two_digits).bottom) * parseInt(two.split(":")[2]) :

                                                                                digitSemi && JSON.parse(digitSemi!.two_digits as string).bottom.includes(two.split(":")[0]) ?
                                                                                    (parseInt(JSON.parse(billId?.rt_two_digits).bottom) / 2 * parseInt(two.split(":")[1])).toFixed(2) :
                                                                                    parseInt(JSON.parse(billId?.rt_two_digits).bottom) * parseInt(two.split(":")[2])}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td className={`border border-slate-300 text-center font-light ${billId?.b_status != "CANCEL" ? billReward.find((r) => (r.two_digit?.bottom?.includes(`${two.split(":")[0]}:${two.split(":")[2]}`) && r.id == billId?.b_id)) ? "text-blue-600" : billId?.b_status == "REWARD" ? "text-red-600" : "text-blue-600" : "text-red-600"}`}>
                                                                    {billId?.b_status != "CANCEL" ? billReward.find((r) => (r.two_digit?.bottom?.includes(`${two.split(":")[0]}:${two.split(":")[2]}`) && r.id == billId?.b_id)) ? "ถูกรางวัล" : billId?.b_status == "REWARD" ? "ไม่ถูกรางวัล" : "รอผล" : "ยกเลิก"}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    }
                                                    {
                                                        billId?.b_three_digits && (JSON.parse(billId?.b_three_digits) as string[]).map((three, i) => (
                                                            parseInt(three.split(":")[1]) > 0 &&
                                                            <tr key={i} className={billId?.b_status != "CANCEL" && billReward.find((r) => (r.three_digit?.top?.includes(`${three.split(":")[0]}:${three.split(":")[1]}`) && r.id == billId?.b_id)) ? "bg-blue-200" : ""}>
                                                                <td className={`border border-slate-300 text-center font-light`}>3 ตัวบน @ {three.split(":")[0]}</td>
                                                                <td className={`border border-slate-300 text-center font-light`}>{parseInt(three.split(":")[1]).toFixed(2)}</td>
                                                                <td className={`border border-slate-300 text-center font-light`}>{(parseInt(three.split(":")[1]) * parseInt(JSON.parse(billId?.c_three_digits).top)) / 100}</td>
                                                                <td className="border border-slate-300 text-center">
                                                                    <div className="flex justify-between px-1">
                                                                        <span className="font-light">{
                                                                            billId?.promotion == "USED" && promotions[0] && JSON.parse(promotions[0]?.p_promotion.toString()).includes(day[new Date(billId?.times).getDay()]) ?
                                                                                digitSemi && JSON.parse(digitSemi!.three_digits as string).top.includes(three.split(":")[0]) ?
                                                                                    (JSON.parse(promotions[0]?.rt_three_digits).top / 2).toFixed(2) :
                                                                                    JSON.parse(promotions[0]?.rt_three_digits).top :

                                                                                digitSemi && JSON.parse(digitSemi!.three_digits as string).top.includes(three.split(":")[0]) ?
                                                                                    (JSON.parse(billId?.rt_three_digits).top / 2).toFixed(2) :
                                                                                    JSON.parse(billId?.rt_three_digits).top}</span>
                                                                        <span className="font-light">{
                                                                            billId?.promotion == "USED" && promotions[0] && JSON.parse(promotions[0]?.p_promotion.toString()).includes(day[new Date(billId?.times).getDay()]) ?
                                                                                digitSemi && JSON.parse(digitSemi!.rt_three_digits as string).top.includes(three.split(":")[0]) ?
                                                                                    (parseInt(JSON.parse(promotions[0]?.rt_three_digits).top) / 2 * parseInt(three.split(":")[1])).toFixed(2) :
                                                                                    parseInt(JSON.parse(promotions[0]?.rt_three_digits).top) * parseInt(three.split(":")[1]) :

                                                                                digitSemi && JSON.parse(digitSemi!.three_digits as string).top.includes(three.split(":")[0]) ?
                                                                                    (parseInt(JSON.parse(billId?.rt_three_digits).top) / 2 * parseInt(three.split(":")[1])).toFixed(2) :
                                                                                    parseInt(JSON.parse(billId?.rt_three_digits).top) * parseInt(three.split(":")[1])}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td className={`border border-slate-300 text-center font-light ${billId?.b_status != "CANCEL" ? billReward.find((r) => (r.three_digit?.top?.includes(`${three.split(":")[0]}:${three.split(":")[1]}`) && r.id == billId?.b_id)) ? "text-blue-600" : billId?.b_status == "REWARD" ? "text-red-600" : "text-blue-600" : "text-red-600"}`}>
                                                                    {billId?.b_status != "CANCEL" ? billReward.find((r) => (r.three_digit?.top?.includes(`${three.split(":")[0]}:${three.split(":")[1]}`) && r.id == billId?.b_id)) ? "ถูกรางวัล" : billId?.b_status == "REWARD" ? "ไม่ถูกรางวัล" : "รอผล" : "ยกเลิก"}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    }
                                                    {
                                                        billId?.b_three_digits && (JSON.parse(billId?.b_three_digits) as string[]).map((three, i) => (
                                                            parseInt(three.split(":")[2]) > 0 &&
                                                            <tr key={i} className={billId?.b_status != "CANCEL" && billReward.find((r) => (r.three_digit?.toad?.includes(`${three.split(":")[0]}:${three.split(":")[2]}`) && r.id == billId?.b_id)) ? "bg-blue-200" : ""}>
                                                                <td className={`border border-slate-300 text-center font-light`}>3 ตัวโต๊ด @ {three.split(":")[0]}</td>
                                                                <td className={`border border-slate-300 text-center font-light`}>{parseInt(three.split(":")[2]).toFixed(2)}</td>
                                                                <td className={`border border-slate-300 text-center font-light`}>{(parseInt(three.split(":")[2]) * parseInt(JSON.parse(billId?.c_three_digits).toad)) / 100}</td>
                                                                <td className="border border-slate-300 text-center">
                                                                    <div className="flex justify-between px-1">
                                                                        <span className="font-light">{
                                                                            billId?.promotion == "USED" && promotions[0] && JSON.parse(promotions[0]?.p_promotion.toString()).includes(day[new Date(billId?.times).getDay()]) ?
                                                                                digitSemi && JSON.parse(digitSemi!.rt_three_digits as string).toad.includes(three.split(":")[0]) ?
                                                                                    (parseInt(JSON.parse(promotions[0]?.rt_three_digits).toad) / 2 * parseInt(three.split(":")[1])).toFixed(2) :
                                                                                    JSON.parse(promotions[0]?.rt_three_digits).toad :

                                                                                digitSemi && JSON.parse(digitSemi!.rt_three_digits as string).toad.includes(three.split(":")[0]) ?
                                                                                    (parseInt(JSON.parse(billId?.rt_three_digits).toad) / 2 * parseInt(three.split(":")[1])).toFixed(2) :
                                                                                    JSON.parse(billId?.rt_three_digits).toad}</span>
                                                                        <span className="font-light">{
                                                                            billId?.promotion == "USED" && promotions[0] && JSON.parse(promotions[0]?.p_promotion.toString()).includes(day[new Date(billId?.times).getDay()]) ?
                                                                                digitSemi && JSON.parse(digitSemi!.rt_three_digits as string).toad.includes(three.split(":")[0]) ?
                                                                                    (parseInt(JSON.parse(promotions[0]?.rt_three_digits).toad) / 2 * parseInt(three.split(":")[1])).toFixed(2) :
                                                                                    parseInt(JSON.parse(promotions[0]?.rt_three_digits).toad) * parseInt(three.split(":")[2]) :

                                                                                digitSemi && JSON.parse(digitSemi!.rt_three_digits as string).toad.includes(three.split(":")[0]) ?
                                                                                    (parseInt(JSON.parse(billId?.rt_three_digits).toad) / 2 * parseInt(three.split(":")[1])).toFixed(2) :
                                                                                    parseInt(JSON.parse(billId?.rt_three_digits).toad) * parseInt(three.split(":")[2])}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td className={`border border-slate-300 text-center font-light ${billId?.b_status != "CANCEL" ? billReward.find((r) => (r.three_digit?.toad?.includes(`${three.split(":")[0]}:${three.split(":")[2]}`) && r.id == billId?.b_id)) ? "text-blue-600" : billId?.b_status == "REWARD" ? "text-red-600" : "text-blue-600" : "text-red-600"}`}>
                                                                    {billId?.b_status != "CANCEL" ? billReward.find((r) => (r.three_digit?.toad?.includes(`${three.split(":")[0]}:${three.split(":")[2]}`) && r.id == billId?.b_id)) ? "ถูกรางวัล" : billId?.b_status == "REWARD" ? "ไม่ถูกรางวัล" : "รอผล" : "ยกเลิก"}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    }

                                                </tbody>
                                            </table>
                                        </div>

                                        <div id="bill_footer" className="flex flex-col items-center rounded-lg w-full mb-3 p-2">

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Modal>
                }
                {
                    deleteBillModal &&
                    <Modal>
                        <div id="bill_check" className="flex flex-col">
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
                                                ต้องการลบบิลหรือไม่ ?
                                            </h4>
                                            <div className="items-center gap-2 mt-3 sm:flex">
                                                <button
                                                    className="w-full mt-2 p-2.5 flex-1 text-white bg-red-600 rounded-md outline-none ring-offset-2 ring-red-600 focus:ring-2"
                                                    onClick={confirmDelete}
                                                >
                                                    ลบ
                                                </button>
                                                <button
                                                    className="w-full mt-2 p-2.5 flex-1 text-gray-800 rounded-md outline-none border ring-offset-2 ring-indigo-600 focus:ring-2"
                                                    onClick={() => dispatch(stateModal({ show: false, openModal: "DELETE" }))}
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
                <></>

            </>
        )
    }

    return (
        render()
    )
}