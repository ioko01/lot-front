import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { addBill } from "../../redux/features/bill/billSlice";
import { TWO, THREE, ONE, TDigit } from "../../models/Type";
import { addNotePrice } from "../../redux/features/bill/notePriceSlice";
import axios, { AxiosRequestConfig } from "axios";
import { ILottoMySQL, TLottoDateEnum, TLottoStatusEnum } from "../../models/Lotto";
import { countdown, countdownDate } from "../../utils/countdown";
import { Time } from "../../models/Time";
import { stateModal } from "../../redux/features/modal/modalSlice";
import { ModalNotice } from "./ModalNotice";
import { IBillMySQL } from "../../models/Bill";
import { AuthContext } from "../../context/AuthContextProvider";
import { io } from "../../utils/socket-io";
import moment from "moment";
import { TypeDate } from "../../models/Main";
import { IDigitCloseMySQL } from "../../models/DigitClose";
import { IPromotionMySQL } from "../../models/Promotion";
import { IDigitSemiMySQL } from "../../models/DigitSemi";
import { addCommission } from "../../redux/features/bill/commissionSlice";

interface Props {
    digit: string
    digit_type: TDigit
    index: number
    rate: string | string[] | undefined
    commission: number
    one_digits_close_top?: string
    one_digits_close_bottom?: string
    two_digits_close_top?: string
    two_digits_close_bottom?: string
    three_digits_close_top?: string
    three_digits_close_toad?: string
    one_digits_semi_top?: string
    one_digits_semi_bottom?: string
    two_digits_semi_top?: string
    two_digits_semi_bottom?: string
    three_digits_semi_top?: string
    three_digits_semi_toad?: string
}

function TableBill({
    digit,
    digit_type,
    index,
    rate,
    commission,
    one_digits_close_top,
    one_digits_close_bottom,
    two_digits_close_top,
    two_digits_close_bottom,
    three_digits_close_top,
    three_digits_close_toad,
    one_digits_semi_top,
    one_digits_semi_bottom,
    two_digits_semi_top,
    two_digits_semi_bottom,
    three_digits_semi_top,
    three_digits_semi_toad }: Props) {
    let type = ""
    let price = digit.split(":")[index]
    let close = false
    let semi = false
    if (ONE.includes(digit_type) && index === 1) {
        type = "วิ่งบน"
        if (one_digits_close_top?.includes(digit.split(":")[0])) {
            price = "0"
            rate = "0"
            close = true
        }
        if (one_digits_semi_top?.includes(digit.split(":")[0])) {
            rate = (parseFloat(rate as string) / 2).toFixed(2).toString()
            semi = true
        }
    } else if (ONE.includes(digit_type) && index === 2) {
        type = "วิ่งล่าง"
        if (one_digits_close_bottom?.includes(digit.split(":")[0])) {
            price = "0"
            rate = "0"
            close = true
        }
        if (one_digits_semi_bottom?.includes(digit.split(":")[0])) {
            rate = (parseFloat(rate as string) / 2).toFixed(2).toString()
            semi = true
        }
    } else if (TWO.includes(digit_type) && index === 1) {
        type = "2 ตัวบน"
        if (two_digits_close_top?.includes(digit.split(":")[0])) {
            price = "0"
            rate = "0"
            close = true
        }
        if (two_digits_semi_top?.includes(digit.split(":")[0])) {
            rate = (parseFloat(rate as string) / 2).toFixed(2).toString()
            semi = true
        }
    } else if (TWO.includes(digit_type) && index === 2) {
        type = "2 ตัวล่าง"
        if (two_digits_close_bottom?.includes(digit.split(":")[0])) {
            price = "0"
            rate = "0"
            close = true
        }
        if (two_digits_semi_bottom?.includes(digit.split(":")[0])) {
            rate = (parseFloat(rate as string) / 2).toFixed(2).toString()
            semi = true
        }
    } else if (THREE.includes(digit_type) && index === 1) {
        type = "3 ตัวบน"
        if (three_digits_close_top?.includes(digit.split(":")[0])) {
            price = "0"
            rate = "0"
            close = true
        }
        if (three_digits_semi_top?.includes(digit.split(":")[0])) {
            rate = (parseFloat(rate as string) / 2).toFixed(2).toString()
            semi = true
        }
    } else if (THREE.includes(digit_type) && index === 2) {
        type = "3 ตัวโต๊ด"
        if (three_digits_close_toad?.includes(digit.split(":")[0])) {
            price = "0"
            rate = "0"
            close = true
        }
        if (three_digits_semi_toad?.includes(digit.split(":")[0])) {
            rate = (parseFloat(rate as string) / 2).toFixed(2).toString()
            semi = true
        }
    }

    return (
        <tr className={close ? "bg-red-200" : semi ? "bg-blue-200" : ""}>
            <td className="border px-1 font-light">{type}</td>
            <td className="border px-1 font-light">{digit.split(":")[0]}</td>
            <td className="border px-1 font-light">{price}</td>
            <td className="border px-1 font-light">{rate!}</td>
            <td className="border px-1 font-light">{commission.toFixed(2)}</td>
            <td className="border px-1 font-light text-center">

                {close ? <strong className="font-bold text-red-500">ปิดรับ</strong> : semi ? <strong className="font-bold text-blue-500">จ่ายครึ่ง</strong> : ""}

                {/* <button className="text-xs text-red-600 hover:text-red-400 font-bold p-2 rounded shadow mx-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg></button> */}
            </td>
        </tr>
    )
}

export function BillCheck() {
    const dispatch = useAppDispatch()
    const bills = useAppSelector(state => state.bill)
    const notePrice = useAppSelector(state => state.notePrice)
    // const commissionRedux = useAppSelector(state => state.commission)
    const navigate = useNavigate();
    const [promotions, setPromotions] = useState<IPromotionMySQL[]>([])
    const isLoading = document.getElementById("loading")
    const location = useLocation()
    const [lotto, setLotto] = useState<ILottoMySQL | null>(null)
    const [image, setImage] = useState<string | ArrayBuffer | null>(null);
    const { isUser } = useContext(AuthContext)
    const [dateTimes, setDateTimes] = useState("")

    const modal = useAppSelector(state => state.modal)
    document.getElementById("add_bill")?.focus()
    let newTime: Time;
    const [time, setTime] = useState<Time>()
    const day = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const [isDate, setDate] = useState<TypeDate>({
        startDate: new Date(),
        endDate: new Date()
    });


    const pagePrev = () => {
        dispatch(addBill(bills))
        dispatch(addNotePrice(notePrice))
        // dispatch(addCommission(commissionRedux))
        navigate(-1)
    }

    const fetchLotto = async () => {
        const id = location.pathname.split("/")[3]
        fetchPromotions()
        const access_token = localStorage.getItem(import.meta.env.VITE_OPS_TOKEN);
        const axiosConfig: AxiosRequestConfig = { withCredentials: true, timeout: 10000, headers: { Authorization: `Bearer ${access_token}` } }
        const fetchLotto = await axios.get(import.meta.env.VITE_OPS_URL + `/get/lotto/id/${id}`, axiosConfig)
        let data = fetchLotto.data as ILottoMySQL
        if (fetchLotto && fetchLotto.status == 200) {
            const this_hours = new Date().getHours()
            const this_minutes = new Date().getMinutes()
            const t = `${this_hours}:${this_minutes}`
            const date = moment(new Date(data.now).toUTCString()).utc()

            let day = date.format("DD")
            let month = date.format("MM")
            let year = date.format("YYYY")
            if (data.open) {
                if (getTomorrow(data.open, t)) {
                    date.subtract(1, 'days')
                    day = date.format("DD")
                    month = date.format("MM")
                }
            }

            if (data.date_type == "THAI") {
                const this_thai = moment(new Date(data.thai_this_times))

                day = this_thai.format("DD")
                month = this_thai.format("MM")
                year = this_thai.format("YYYY")
            }

            setDateTimes(`${year}-${month}-${day}`)
            if (data.l_status == TLottoStatusEnum.OPEN) {
                data = Object.assign({ id: id }, data)

                setLotto(data)

                await fetchImage(data.img_flag)
                timer(data.id, data.open, data.close, data.l_status as TLottoStatusEnum, 1, data.date_type as TLottoDateEnum, data.thai_this_times, data.thai_open_date!, data.now)
            } else {
                setLotto(null)
                navigate("/")
            }

        }
    }

    const [digitClose, setDigitClose] = useState<IDigitCloseMySQL | null>(null)
    const [digitSemi, setDigitSemi] = useState<IDigitSemiMySQL | null>(null)
    const fetchDigitClose = async () => {
        try {
            const id = location.pathname.split("/")[3]
            let start = new Date(isDate!.startDate!)
            let end = new Date(isDate!.endDate!)
            if (lotto!.date_type == "THAI") {
                start = new Date(dateTimes)
                end = new Date(dateTimes)
            }

            const ds = `${start.getDate()}-${start.getMonth() + 1}-${start.getFullYear()}`
            const de = `${end.getDate()}-${end.getMonth() + 1}-${end.getFullYear()}`
            const access_token = localStorage.getItem(import.meta.env.VITE_OPS_TOKEN);
            const axiosConfig: AxiosRequestConfig = { withCredentials: true, timeout: 10000, headers: { Authorization: `Bearer ${access_token}` } }
            const res = await axios.get(import.meta.env.VITE_OPS_URL + `/get/digitclose/${id}/${isUser!.store_id}/${ds}/${de}`, axiosConfig)
            if (res.data && res.status == 200) {
                setDigitClose(res.data)
                let c = false
                for (let i = 0; i < bills.length; i++) {
                    for (let j = 0; j < bills[i].digit.length; j++) {
                        if (JSON.parse(res.data?.one_digits.toString()).top) {
                            if (JSON.parse(res.data?.one_digits.toString()).top.includes(bills[i].digit[j].split(":")[0])) {
                                c = true
                                break
                            }
                        }
                        if (JSON.parse(res.data?.one_digits.toString()).bottom) {
                            if (JSON.parse(res.data?.one_digits.toString()).bottom.includes(bills[i].digit[j].split(":")[0])) {
                                c = true
                                break
                            }
                        }
                        if (JSON.parse(res.data?.two_digits.toString()).top) {
                            if (JSON.parse(res.data?.two_digits.toString()).top.includes(bills[i].digit[j].split(":")[0])) {
                                c = true
                                break
                            }
                        }
                        if (JSON.parse(res.data?.two_digits.toString()).bottom) {
                            if (JSON.parse(res.data?.two_digits.toString()).bottom.includes(bills[i].digit[j].split(":")[0])) {
                                c = true
                                break
                            }
                        }
                        if (JSON.parse(res.data?.three_digits.toString()).top) {
                            if (JSON.parse(res.data?.three_digits.toString()).top.includes(bills[i].digit[j].split(":")[0])) {
                                c = true
                                break
                            }
                        }
                        if (JSON.parse(res.data?.three_digits.toString()).toad) {
                            if (JSON.parse(res.data?.three_digits.toString()).toad.includes(bills[i].digit[j].split(":")[0])) {
                                c = true
                                break
                            }
                        }

                    }
                    if (c) break
                }
                if (c) dispatch(stateModal({ show: true, openModal: "DIGITS_CLOSE", confirm: false }))
            } else {
                setDigitClose(null)
            }

        } catch (error) {
        }

    }

    const fetchDigitSemi = async () => {
        try {
            const id = location.pathname.split("/")[3]
            let start = new Date(isDate!.startDate!)
            let end = new Date(isDate!.endDate!)
            if (lotto!.date_type == "THAI") {
                start = new Date(dateTimes)
                end = new Date(dateTimes)
            }

            const ds = `${start.getDate()}-${start.getMonth() + 1}-${start.getFullYear()}`
            const de = `${end.getDate()}-${end.getMonth() + 1}-${end.getFullYear()}`
            const access_token = localStorage.getItem(import.meta.env.VITE_OPS_TOKEN);
            const axiosConfig: AxiosRequestConfig = { withCredentials: true, timeout: 10000, headers: { Authorization: `Bearer ${access_token}` } }
            const res = await axios.get(import.meta.env.VITE_OPS_URL + `/get/digitsemi/${id}/${isUser!.store_id}/${ds}/${de}`, axiosConfig)
            if (res.data && res.status == 200) {
                console.log(res.data);
                setDigitSemi(res.data)
                let c = false
                for (let i = 0; i < bills.length; i++) {
                    for (let j = 0; j < bills[i].digit.length; j++) {
                        if (JSON.parse(res.data?.one_digits.toString()).top) {
                            if (JSON.parse(res.data?.one_digits.toString()).top.includes(bills[i].digit[j].split(":")[0])) {
                                c = true
                                break
                            }
                        }
                        if (JSON.parse(res.data?.one_digits.toString()).bottom) {
                            if (JSON.parse(res.data?.one_digits.toString()).bottom.includes(bills[i].digit[j].split(":")[0])) {
                                c = true
                                break
                            }
                        }
                        if (JSON.parse(res.data?.two_digits.toString()).top) {
                            if (JSON.parse(res.data?.two_digits.toString()).top.includes(bills[i].digit[j].split(":")[0])) {
                                c = true
                                break
                            }
                        }
                        if (JSON.parse(res.data?.two_digits.toString()).bottom) {
                            if (JSON.parse(res.data?.two_digits.toString()).bottom.includes(bills[i].digit[j].split(":")[0])) {
                                c = true
                                break
                            }
                        }
                        if (JSON.parse(res.data?.three_digits.toString()).top) {
                            if (JSON.parse(res.data?.three_digits.toString()).top.includes(bills[i].digit[j].split(":")[0])) {
                                c = true
                                break
                            }
                        }
                        if (JSON.parse(res.data?.three_digits.toString()).toad) {
                            if (JSON.parse(res.data?.three_digits.toString()).toad.includes(bills[i].digit[j].split(":")[0])) {
                                c = true
                                break
                            }
                        }

                    }
                    if (c) break
                }
                if (c) dispatch(stateModal({ show: true, openModal: "DIGITS_SEMI", confirm: false }))
            } else {
                setDigitSemi(null)
            }

        } catch (error) {
        }

    }


    const addBillToDatabase = async () => {
        let digitOne: string[] = []
        let digitTwo: string[] = []
        let digitThree: string[] = []

        bills.map((bill, index) => {

            if (bill.digit_type == "ONE") {
                digitOne.push(...bill.digit)
            }
            if (bill.digit_type == "TWO") {
                digitTwo.push(...bill.digit)
            }
            if (bill.digit_type == "THREE") {
                digitThree.push(...bill.digit)
            }
            if (bill.digit_type == "NINETEEN") {
                digitTwo.push(...bill.digit)
            }
            if (bill.digit_type == "SIX") {
                digitThree.push(...bill.digit)
            }
            if (bill.digit_type == "WIN_TWO") {
                digitTwo.push(...bill.digit)
            }
            if (bill.digit_type == "WIN_THREE") {
                digitThree.push(...bill.digit)
            }

        })

        digitOne.map((one, index) => {
            if (digitClose?.one_digits) {
                if (JSON.parse(digitClose?.one_digits.toString()).top && JSON.parse(digitClose?.one_digits.toString()).bottom) {
                    if (JSON.parse(digitClose?.one_digits.toString()).top.includes(one.split(":")[0]) && JSON.parse(digitClose?.one_digits.toString()).bottom.includes(one.split(":")[0])) {
                        digitOne[index] = `${one.split(":")[0]}:0:0`
                    }
                }
                if (JSON.parse(digitClose?.one_digits.toString()).top) {
                    if (JSON.parse(digitClose?.one_digits.toString()).top.includes(one.split(":")[0]) && !JSON.parse(digitClose?.one_digits.toString()).bottom.includes(one.split(":")[0])) {
                        digitOne[index] = `${one.split(":")[0]}:0:${one.split(":")[2]}`
                    }
                }
                if (JSON.parse(digitClose?.one_digits.toString()).bottom) {
                    if (JSON.parse(digitClose?.one_digits.toString()).bottom.includes(one.split(":")[0]) && !JSON.parse(digitClose?.one_digits.toString()).top.includes(one.split(":")[0])) {
                        digitOne[index] = `${one.split(":")[0]}:${one.split(":")[1]}:0`
                    }
                }
            }
        })

        digitTwo.map((two, index) => {
            if (digitClose?.two_digits) {
                if (JSON.parse(digitClose?.two_digits.toString()).top && JSON.parse(digitClose?.two_digits.toString()).bottom) {
                    if (JSON.parse(digitClose?.two_digits.toString()).top.includes(two.split(":")[0]) && JSON.parse(digitClose?.two_digits.toString()).bottom.includes(two.split(":")[0])) {
                        digitTwo[index] = `${two.split(":")[0]}:0:0`
                    }
                }
                if (JSON.parse(digitClose?.two_digits.toString()).top) {
                    if (JSON.parse(digitClose?.two_digits.toString()).top.includes(two.split(":")[0]) && !JSON.parse(digitClose?.two_digits.toString()).bottom.includes(two.split(":")[0])) {
                        digitTwo[index] = `${two.split(":")[0]}:0:${two.split(":")[2]}`
                    }
                }
                if (JSON.parse(digitClose?.two_digits.toString()).bottom) {
                    if (JSON.parse(digitClose?.two_digits.toString()).bottom.includes(two.split(":")[0]) && !JSON.parse(digitClose?.two_digits.toString()).top.includes(two.split(":")[0])) {
                        digitTwo[index] = `${two.split(":")[0]}:${two.split(":")[1]}:0`
                    }
                }
            }
        })

        digitThree.map((three, index) => {
            if (digitClose?.three_digits) {
                if (JSON.parse(digitClose?.three_digits.toString()).top && JSON.parse(digitClose?.three_digits.toString()).toad) {
                    if (JSON.parse(digitClose?.three_digits.toString()).top.includes(three.split(":")[0]) && JSON.parse(digitClose?.three_digits.toString()).toad.includes(three.split(":")[0])) {
                        digitThree[index] = `${three.split(":")[0]}:0:0`
                    }
                }
                if (JSON.parse(digitClose?.three_digits.toString()).top) {
                    if (JSON.parse(digitClose?.three_digits.toString()).top.includes(three.split(":")[0]) && !JSON.parse(digitClose?.three_digits.toString()).toad.includes(three.split(":")[0])) {
                        digitThree[index] = `${three.split(":")[0]}:0:${three.split(":")[2]}`
                    }
                }
                if (JSON.parse(digitClose?.three_digits.toString()).toad) {
                    if (JSON.parse(digitClose?.three_digits.toString()).toad.includes(three.split(":")[0]) && !JSON.parse(digitClose?.three_digits.toString()).top.includes(three.split(":")[0])) {
                        digitThree[index] = `${three.split(":")[0]}:${three.split(":")[1]}:0`
                    }
                }
            }
        })

        const date = moment(new Date(lotto!.now)).utc()
        // console.log(`${dateTimes} ${date.format("HH")}:${date.format("mm")}:${date.format("ss")}`);
        const BILL: IBillMySQL = {
            store_id: isUser!.store_id!,
            lotto_id: lotto!.l_id!,
            times: new Date(`${dateTimes} ${date.format("HH")}:${date.format("mm")}:${date.format("ss")}`),
            one_digits: digitOne,
            two_digits: digitTwo,
            three_digits: digitThree,
            note: notePrice?.note ?? "",
            status: "WAIT",
            constructor: { name: "RowDataPacket" }
        }
        // console.log(BILL);

        isLoading!.removeAttribute("style")
        isLoading!.style.position = "fixed"
        const access_token = localStorage.getItem(import.meta.env.VITE_OPS_TOKEN);
        const axiosConfig: AxiosRequestConfig = { withCredentials: true, timeout: 10000, headers: { Authorization: `Bearer ${access_token}` } }
        await axios.post(import.meta.env.VITE_OPS_URL + "/add/bill", BILL, axiosConfig).then(res => {
            if (res.status == 200) {
                isLoading!.style.display = "none"
                // dispatch(deleteBill())
                dispatch(stateModal({ show: true, openModal: "ADDBILLTRUE", confirm: false }))
                // io.connect()
                io.emit("create_credit")
                // io.disconnect()
            } else if (res.status == 202 && res.data.message == "no credit") {
                isLoading!.style.display = "none"
                dispatch(stateModal({ show: true, openModal: "NO_CREDIT", confirm: false }))
            } else {
                isLoading!.style.display = "none"
                dispatch(stateModal({ show: true, openModal: "ADDBILLFALSE", confirm: false }))
            }
        }).catch(error => {
            isLoading!.style.display = "none"
            dispatch(stateModal({ show: true, openModal: "ADDBILLFALSE", confirm: false }))
            console.log(error);
        })
    }

    const fetchImage = async (img_flag: string) => {
        const axiosConfig: AxiosRequestConfig = { timeout: 10000 }
        const res = await axios.get(`${import.meta.env.VITE_OPS_URL}/get/file/${img_flag}`, {
            responseType: 'blob',
            timeout: axiosConfig.timeout,
        })
        if (res && res.status == 200) {
            const reader = new FileReader();
            reader.readAsDataURL(res.data);

            reader.onloadend = function () {
                const base64data = reader.result;
                setImage(base64data);
            };
        }
    }

    let count = 0
    const [billTimeout, setBillTimeout] = useState<boolean>(false)
    const timer = (id: string, open: string, close: string, status: TLottoStatusEnum, amount: number, date_type: TLottoDateEnum, thai_this_times: string, thai_open_date: string, now: string) => {
        if (!billTimeout) {
            const interval = setInterval(() => {
                let cd
                if (date_type == "THAI") {
                    const this_thai = moment(new Date(thai_this_times))
                    const date_now = moment(new Date(now).toUTCString())
                    let d_open
                    let d_close
                    d_close = `${this_thai.format("YYYY-MM-DD")} ${close}:00`
                    d_open = this_thai.subtract(parseInt(thai_open_date!), "days").format("YYYY-MM-DD HH:mm:ss")

                    if (date_now.format("YYYY-MM-DD") > this_thai.format("YYYY-MM-DD")) {
                        cd = countdownDate(d_open!, d_close!)
                    } else {
                        cd = {
                            days: -1,
                            hours: -1,
                            minutes: -1,
                            seconds: -1
                        }
                    }
                } else {
                    cd = countdown(open, close, getTomorrow(open, close))
                }

                if (cd.hours < 0) {
                    dispatch(stateModal({ show: true, openModal: "TIMEOUT", confirm: false }))
                    setBillTimeout(true)
                    clearInterval(interval)
                }

                const days = status == TLottoStatusEnum.OPEN ? cd.days < 10 ? `0${cd.days.toString()}` : cd.days.toString() : "00"
                const hours = status == TLottoStatusEnum.OPEN ? cd.hours < 10 ? `0${cd.hours.toString()}` : cd.hours.toString() : "00"
                const minutes = status == TLottoStatusEnum.OPEN ? cd.minutes < 10 ? `0${cd.minutes.toString()}` : cd.minutes.toString() : "00"
                const seconds = status == TLottoStatusEnum.OPEN ? cd.seconds < 10 ? `0${cd.seconds.toString()}` : cd.seconds.toString() : "00"

                newTime = {
                    id: id,
                    days: days,
                    hours: hours,
                    minutes: minutes,
                    seconds: seconds
                }
                setTime(newTime)
                count++
            }, 1000)
        }
    }

    const getTomorrow = (t1: string, t2: string) => {
        //check เวลาปิดน้อยกว่าหรือเท่ากับเวลาเปิด ถ้าน้อยกว่า จะเท่ากับงวด พรุ่งนี้
        if (parseInt(t2.split(":")[0]) <= parseInt(t1.split(":")[0])) {
            // ถ้าเวลาปิด == เวลาเปิด
            if (parseInt(t2.split(":")[0]) == parseInt(t1.split(":")[0])) {
                // ให้เช็ค นาที ปิด น้อยกว่า นาทีเปิด
                if (parseInt(t2.split(":")[1]) < parseInt(t1.split(":")[1])) return true
                return false
            }
            return true
        }
        return false
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

    useEffect(() => {
        isLoading!.removeAttribute("style")
        isLoading!.style.position = "fixed"
        if (bills.length === 0) {
            navigate('/', { replace: true });
        }
        fetchLotto()
    }, [bills, notePrice])

    useEffect(() => {
        io.on("get_digit_close", () => fetchDigitClose())
        io.on("get_digit_semi", () => fetchDigitSemi())
        fetchDigitClose()
        fetchDigitSemi()
    }, [lotto])

    const totalPrice = notePrice.price.reduce((price, current, index, arr) => {
        let close = 0

        bills.map((bill) => {
            if (ONE.includes(bill.digit_type)) {
                bill.digit.map((digit) => {
                    if (digitClose?.one_digits) {
                        if (JSON.parse(digitClose?.one_digits.toString()).top) {
                            if (JSON.parse(digitClose?.one_digits.toString()).top.includes(digit.split(":")[0])) {
                                close += parseInt(digit.split(":")[1])
                            }
                        }
                        if (JSON.parse(digitClose?.one_digits.toString()).bottom) {
                            if (JSON.parse(digitClose?.one_digits.toString()).bottom.includes(digit.split(":")[0])) {
                                close += parseInt(digit.split(":")[2])
                            }
                        }
                    }
                })
            } else if (TWO.includes(bill.digit_type)) {
                bill.digit.map((digit) => {
                    if (digitClose?.two_digits) {
                        if (JSON.parse(digitClose?.two_digits.toString()).top) {
                            if (JSON.parse(digitClose?.two_digits.toString()).top.includes(digit.split(":")[0])) {
                                close += parseInt(digit.split(":")[1])
                            }
                        }
                        if (JSON.parse(digitClose?.two_digits.toString()).bottom) {
                            if (JSON.parse(digitClose?.two_digits.toString()).bottom.includes(digit.split(":")[0])) {
                                close += parseInt(digit.split(":")[2])
                            }
                        }
                    }
                })
            } else if (THREE.includes(bill.digit_type)) {
                bill.digit.map((digit) => {
                    if (digitClose?.three_digits) {
                        if (JSON.parse(digitClose?.three_digits.toString()).top) {
                            if (JSON.parse(digitClose?.three_digits.toString()).top.includes(digit.split(":")[0])) {
                                close += parseInt(digit.split(":")[1])
                            }
                        }
                        if (JSON.parse(digitClose?.three_digits.toString()).toad) {
                            if (JSON.parse(digitClose?.three_digits.toString()).toad.includes(digit.split(":")[0])) {
                                close += parseInt(digit.split(":")[2])
                            }
                        }
                    }
                })
            }
        })
        return arr.reduce((p, c) => p + c, 0) - close
    }, 0)

    function getCommission() {
        let commission = 0
        bills.map(bill => {
            bill.digit.map(digit => {
                let top = parseFloat(digit.split(":")[1]) / 100
                let bottom = parseFloat(digit.split(":")[2]) / 100
                if (ONE.includes(bill.digit_type)) {
                    commission += lotto!.promotion == "USED" && promotions[0] && JSON.parse(promotions[0].p_promotion.toString()).includes(day[new Date(dateTimes).getDay()]) ? parseFloat((top * parseInt(JSON.parse(promotions[0]!.c_one_digits).top!)).toFixed(2)) : parseFloat((top * parseInt(JSON.parse(lotto!.c_one_digits).top!)).toFixed(2))
                    commission += lotto!.promotion == "USED" && promotions[0] && JSON.parse(promotions[0].p_promotion.toString()).includes(day[new Date(dateTimes).getDay()]) ? parseFloat((top * parseInt(JSON.parse(promotions[0]!.c_one_digits).bottom!)).toFixed(2)) : parseFloat((bottom * parseInt(JSON.parse(lotto!.c_one_digits).bottom!)).toFixed(2))
                } else if (TWO.includes(bill.digit_type)) {
                    commission += lotto!.promotion == "USED" && promotions[0] && JSON.parse(promotions[0].p_promotion.toString()).includes(day[new Date(dateTimes).getDay()]) ? parseFloat((top * parseInt(JSON.parse(promotions[0]!.c_two_digits).top!)).toFixed(2)) : parseFloat((top * parseInt(JSON.parse(lotto!.c_two_digits).top!)).toFixed(2))
                    commission += lotto!.promotion == "USED" && promotions[0] && JSON.parse(promotions[0].p_promotion.toString()).includes(day[new Date(dateTimes).getDay()]) ? parseFloat((top * parseInt(JSON.parse(promotions[0]!.c_two_digits).bottom!)).toFixed(2)) : parseFloat((bottom * parseInt(JSON.parse(lotto!.c_two_digits).bottom!)).toFixed(2))
                } else if (THREE.includes(bill.digit_type)) {
                    commission += lotto!.promotion == "USED" && promotions[0] && JSON.parse(promotions[0].p_promotion.toString()).includes(day[new Date(dateTimes).getDay()]) ? parseFloat((top * parseInt(JSON.parse(promotions[0]!.c_three_digits).top!)).toFixed(2)) : parseFloat((top * parseInt(JSON.parse(lotto!.c_three_digits).top!)).toFixed(2))
                    commission += lotto!.promotion == "USED" && promotions[0] && JSON.parse(promotions[0].p_promotion.toString()).includes(day[new Date(dateTimes).getDay()]) ? parseFloat((top * parseInt(JSON.parse(promotions[0]!.c_three_digits).toad!)).toFixed(2)) : parseFloat((bottom * parseInt(JSON.parse(lotto!.c_three_digits).toad!)).toFixed(2))
                }
            })
        })
        return commission
    }
    return (
        lotto! ? <>
            {
                billTimeout && <div className="overlay-timeout">
                    {modal.openModal === "TIMEOUT" && <ModalNotice />}
                </div>
            }
            <div id="bill_check" className="flex flex-col">
                <div className="basis-full w-full p-2">
                    <div id="bill_time" className="flex flex-col w-full mb-3 p-2 text-red-500">
                        เหลือเวลา {lotto?.date_type == "THAI" ? time?.days : "00"}:{time?.hours ?? "00"}:{time?.minutes ?? "00"}:{time?.seconds ?? "00"}
                    </div>
                </div>
                <div className="flex flex-row">
                    <div className="basis-3/6 w-full p-2">
                        <div id="bill_content" style={{ minWidth: "420px", maxWidth: "568px" }} className="flex flex-col items-center">

                            <div id="bill_header" className="flex flex-col items-center rounded-lg border border-green-400 bg-green-100 w-full mb-3 p-2">
                                <div className="flex justify-between w-full p-2">
                                    <span>{lotto?.l_name}</span>
                                    <span>{`${moment(dateTimes).format("DD-MM-YYYY")}`}</span>
                                </div>
                                <div className="flex justify-between w-full p-2">
                                    <span>อัตราจ่าย</span>
                                    <span>{lotto ? lotto.promotion == "USED" && promotions[0] && JSON.parse(promotions[0].p_promotion.toString()).includes(day[new Date(dateTimes).getDay()]) ? JSON.parse(promotions[0].rt_two_digits).top : JSON.parse(lotto.rt_two_digits).top : ""}</span>
                                    <span>ดูรายละเอียด</span>
                                    <span><img width={60} src={`${image}`} alt="flag" className="object-cover" /></span>
                                </div>
                            </div>

                            <div id="bill_body" className="flex flex-col items-center w-full mb-3 p-2">
                                <table className="w-full">
                                    <caption className="text-left text-lg">รายการแทง</caption>
                                    <thead className="bg-blue-800 text-white">
                                        <tr>
                                            <th>ประเภท</th>
                                            <th>หมายเลข</th>
                                            <th>ยอดเดิมพัน</th>
                                            <th>เรทจ่าย</th>
                                            <th>ส่วนลด</th>
                                            <th>#</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bills.map((bill) => (
                                            ONE.includes(bill.digit_type) ?
                                                bill.digit.map((digit, index) =>
                                                    <React.Fragment key={"one" + index}>
                                                        {digit.split(":")[1] != "0" && <TableBill digit={digit} digit_type={bill.digit_type} index={1} rate={lotto! && lotto.promotion == "USED" && promotions[0] && JSON.parse(promotions[0].p_promotion.toString()).includes(day[new Date(dateTimes).getDay()]) ? String(JSON.parse(promotions[0].rt_one_digits).top!) : String(JSON.parse(lotto!.rt_one_digits).top!)} commission={lotto.promotion == "USED" && promotions[0] && JSON.parse(promotions[0].p_promotion.toString()).includes(day[new Date(dateTimes).getDay()]) ? (parseFloat(digit.split(":")[1]) / 100) * parseFloat(JSON.parse(promotions[0].c_one_digits).top!) : (parseFloat(digit.split(":")[1]) / 100) * parseFloat(JSON.parse(lotto.c_one_digits).top!)} one_digits_close_top={digitClose?.one_digits && JSON.parse(digitClose?.one_digits.toString()).top && JSON.parse(digitClose?.one_digits.toString()).top} one_digits_semi_top={digitSemi?.one_digits && JSON.parse(digitSemi?.one_digits.toString()).top && JSON.parse(digitSemi?.one_digits.toString()).top} />}
                                                        {digit.split(":")[2] != "0" && <TableBill digit={digit} digit_type={bill.digit_type} index={2} rate={lotto! && lotto.promotion == "USED" && promotions[0] && JSON.parse(promotions[0].p_promotion.toString()).includes(day[new Date(dateTimes).getDay()]) ? String(JSON.parse(promotions[0].rt_one_digits).bottom!) : String(JSON.parse(lotto!.rt_one_digits).bottom!)} commission={lotto.promotion == "USED" && promotions[0] && JSON.parse(promotions[0].p_promotion.toString()).includes(day[new Date(dateTimes).getDay()]) ? (parseFloat(digit.split(":")[2]) / 100) * parseFloat(JSON.parse(promotions[0].c_one_digits).bottom!) : (parseFloat(digit.split(":")[2]) / 100) * parseFloat(JSON.parse(lotto.c_one_digits).bottom!)} one_digits_close_bottom={digitClose?.one_digits && JSON.parse(digitClose?.one_digits.toString()).bottom && JSON.parse(digitClose?.one_digits.toString()).bottom} one_digits_semi_bottom={digitSemi?.one_digits && JSON.parse(digitSemi?.one_digits.toString()).bottom && JSON.parse(digitSemi?.one_digits.toString()).bottom} />}
                                                    </React.Fragment>
                                                )
                                                : TWO.includes(bill.digit_type) ?
                                                    bill.digit.map((digit, index) =>
                                                        <React.Fragment key={"two" + index}>
                                                            {digit.split(":")[1] != "0" && <TableBill digit={digit} digit_type={bill.digit_type} index={1} rate={lotto! && lotto.promotion == "USED" && promotions[0] && JSON.parse(promotions[0].p_promotion.toString()).includes(day[new Date(dateTimes).getDay()]) ? String(JSON.parse(promotions[0].rt_two_digits).top!) : String(JSON.parse(lotto!.rt_two_digits).top!)} commission={lotto.promotion == "USED" && promotions[0] && JSON.parse(promotions[0].p_promotion.toString()).includes(day[new Date(dateTimes).getDay()]) ? (parseFloat(digit.split(":")[1]) / 100) * parseFloat(JSON.parse(promotions[0].c_two_digits).top!) : (parseFloat(digit.split(":")[1]) / 100) * parseFloat(JSON.parse(lotto.c_two_digits).top!)} two_digits_close_top={digitClose?.two_digits && JSON.parse(digitClose?.two_digits.toString()).top && JSON.parse(digitClose?.two_digits.toString()).top} two_digits_semi_top={digitSemi?.two_digits && JSON.parse(digitSemi?.two_digits.toString()).top && JSON.parse(digitSemi?.two_digits.toString()).top} />}
                                                            {digit.split(":")[2] != "0" && <TableBill digit={digit} digit_type={bill.digit_type} index={2} rate={lotto! && lotto.promotion == "USED" && promotions[0] && JSON.parse(promotions[0].p_promotion.toString()).includes(day[new Date(dateTimes).getDay()]) ? String(JSON.parse(promotions[0].rt_two_digits).bottom!) : String(JSON.parse(lotto!.rt_two_digits).bottom!)} commission={lotto.promotion == "USED" && promotions[0] && JSON.parse(promotions[0].p_promotion.toString()).includes(day[new Date(dateTimes).getDay()]) ? (parseFloat(digit.split(":")[2]) / 100) * parseFloat(JSON.parse(promotions[0].c_two_digits).bottom!) : (parseFloat(digit.split(":")[2]) / 100) * parseFloat(JSON.parse(lotto.c_two_digits).bottom!)} two_digits_close_bottom={digitClose?.two_digits && JSON.parse(digitClose?.two_digits.toString()).bottom && JSON.parse(digitClose?.two_digits.toString()).bottom} two_digits_semi_bottom={digitSemi?.two_digits && JSON.parse(digitSemi?.two_digits.toString()).bottom && JSON.parse(digitSemi?.two_digits.toString()).bottom} />}
                                                        </React.Fragment>
                                                    )
                                                    : THREE.includes(bill.digit_type) &&
                                                    bill.digit.map((digit, index) =>
                                                        <React.Fragment key={"three" + index}>
                                                            {digit.split(":")[1] != "0" && <TableBill key={"three_t" + index} digit={digit} digit_type={bill.digit_type} index={1} rate={lotto! && lotto.promotion == "USED" && promotions[0] && JSON.parse(promotions[0].p_promotion.toString()).includes(day[new Date(dateTimes).getDay()]) ? String(JSON.parse(promotions[0].rt_three_digits).top!) : String(JSON.parse(lotto!.rt_three_digits).top!)} commission={lotto.promotion == "USED" && promotions[0] && JSON.parse(promotions[0].p_promotion.toString()).includes(day[new Date(dateTimes).getDay()]) ? (parseFloat(digit.split(":")[1]) / 100) * parseFloat(JSON.parse(promotions[0].c_three_digits).top!) : (parseFloat(digit.split(":")[1]) / 100) * parseFloat(JSON.parse(lotto.c_three_digits).top!)} three_digits_close_top={digitClose?.three_digits && JSON.parse(digitClose?.three_digits.toString()).top && JSON.parse(digitClose?.three_digits.toString()).top} three_digits_semi_top={digitSemi?.three_digits && JSON.parse(digitSemi?.three_digits.toString()).top && JSON.parse(digitSemi?.three_digits.toString()).top} />}
                                                            {digit.split(":")[2] != "0" && <TableBill key={"three_b" + index} digit={digit} digit_type={bill.digit_type} index={2} rate={lotto! && lotto.promotion == "USED" && promotions[0] && JSON.parse(promotions[0].p_promotion.toString()).includes(day[new Date(dateTimes).getDay()]) ? String(JSON.parse(promotions[0].rt_three_digits).toad!) : String(JSON.parse(lotto!.rt_three_digits).toad!)} commission={lotto.promotion == "USED" && promotions[0] && JSON.parse(promotions[0].p_promotion.toString()).includes(day[new Date(dateTimes).getDay()]) ? (parseFloat(digit.split(":")[2]) / 100) * parseFloat(JSON.parse(promotions[0].c_three_digits).toad!) : (parseFloat(digit.split(":")[2]) / 100) * parseFloat(JSON.parse(lotto.c_three_digits).toad!)} three_digits_close_toad={digitClose?.three_digits && JSON.parse(digitClose?.three_digits.toString()).toad && JSON.parse(digitClose?.three_digits.toString()).toad} three_digits_semi_toad={digitSemi?.three_digits && JSON.parse(digitSemi?.three_digits.toString()).toad && JSON.parse(digitSemi?.three_digits.toString()).toad} />}
                                                        </React.Fragment>
                                                    )
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div id="bill_footer" className="flex flex-col items-center rounded-lg w-full mb-3 p-2">
                                <div className="flex justify-center w-full p-2 gap-2">
                                    <span>หมายเหตุ: {notePrice.note}</span>
                                </div>
                                <div className="flex justify-center w-full gap-2">
                                    <span>ยอดเดิมพัน:</span>
                                    <span>{totalPrice.toFixed(2)} บาท</span>
                                </div>
                                <div className="flex justify-center w-full gap-2 text-red-500">
                                    <span>ส่วนลด:</span>
                                    <span>{getCommission().toFixed(2)} บาท</span>
                                </div>
                                <div className="flex justify-center w-full gap-2">
                                    <span>รวม:</span>
                                    <span>{(totalPrice - getCommission()).toFixed(2)} บาท</span>
                                </div>
                                <div className="flex justify-center w-full p-2 gap-2">
                                    <button onClick={pagePrev} style={{ minWidth: "60px" }} className="whitespace-nowrap text-xs bg-gray-400 hover:bg-gray-500 text-white font-light p-2 rounded shadow">ย้อนกลับ</button>
                                    <button id="add_bill" onClick={addBillToDatabase} style={{ minWidth: "60px" }} className="whitespace-nowrap text-xs bg-blue-600 hover:bg-blue-500 text-white font-light p-2 rounded shadow">ยืนยัน</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {
                (modal.openModal === "ADDBILLTRUE" || modal.openModal === "ADDBILLFALSE" || modal.openModal === "NO_CREDIT" || modal.openModal === "DIGITS_CLOSE" || modal.openModal === "DIGITS_SEMI") && <ModalNotice />
            }

        </> : <>ไม่มีอัตราการจ่าย</>

    )
}
