import { useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { addBill, deleteBill } from "../../redux/features/bill/billSlice";
import { TWO, THREE, ONE, TDigit } from "../../models/Type";
import { stateModal } from "../../redux/features/modal/modalSlice";
import { ModalConfirm } from "./ModalConfirm";
import { INote, addNotePrice } from "../../redux/features/bill/notePriceSlice";
import { AuthContext } from "../../context/AuthContextProvider";
import axios, { AxiosRequestConfig } from "axios";
import { IDigitCloseMySQL } from "../../models/DigitClose";
// import { io } from "../../utils/socket-io";
import { ILottoMySQL, TLottoDateEnum, TLottoStatusEnum } from "../../models/Lotto";
import html2canvas from 'html2canvas';
import { countdown, countdownDate } from "../../utils/countdown";
import { Time } from "../../models/Time";
import { IRateMySQL } from "../../models/Rate";
import { ICommissionMySQL } from "../../models/Commission";
import { addCommission } from "../../redux/features/bill/commissionSlice";
import { ModalNotice } from "./ModalNotice";
import { IBillMySQL } from "../../models/Bill";
import moment from "moment";
import { Modal } from "../modal/Modal";
import { TypeDate } from "../../models/Main";
import { ICheckRewardMySQL } from "../../models/CheckReward";
import { IPromotionMySQL } from "../../models/Promotion";
import { IDigitSemiMySQL } from "../../models/DigitSemi";

function isMobile() {
    return navigator.userAgent.match(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i);
}


function copyElementToClipboard(element: HTMLElement) {
    html2canvas(element).then(canvas => {
        const dataUrl = canvas.toDataURL('image/jpeg');
        // Convert the canvas to a Blob object
        if (navigator.clipboard && navigator.clipboard.write) {
            if (isMobile()) {
                console.log(navigator.clipboard.write);
            } else {
                canvas.toBlob(blob => {
                    if (blob) {
                        // Create a new ClipboardItem with the Blob
                        const clipboardItem = new ClipboardItem({ 'image/png': blob });

                        // Use the Clipboard API to copy the Blob to the clipboard
                        navigator.clipboard.write([clipboardItem])
                            .then(() => {
                                console.log('Element copied to clipboard.');
                            })
                            .catch(error => {
                                console.error('Failed to copy element to clipboard:', error);
                            });
                    }
                }, 'image/png');
            }

        } else {

            // Fallback for mobile devices without Clipboard API
            const tempInput = document.createElement('input');
            // tempInput.style.position = 'fixed';
            // tempInput.style.opacity = '0';
            tempInput.value = dataUrl;

            document.body.appendChild(tempInput);
            tempInput.focus();
            tempInput.select();
            try {
                // tempInput.setSelectionRange(0, dataUrl.length);
                document.execCommand('copy');
                console.log('Element copied to clipboard.');
            } catch (error) {
                console.error('Unable to copy to clipboard', error)
            }
            document.body.removeChild(tempInput);
        }

    });
}


export interface Bill {
    digit_type: TDigit
    digit: string[]
}

export function Bill() {
    const [promotions, setPromotions] = useState<IPromotionMySQL[]>([])
    const [digitsType, setDigitsType] = useState<TDigit>("TWO")
    const [digitsTypeTemp, setDigitsTypeTemp] = useState<TDigit>("TWO")
    const [digitsTemp, setDigitsTemp] = useState<string[]>([])
    const [billTemp, setBillTemp] = useState<Bill[]>([])
    const [price, setPrice] = useState<number[]>([])
    const [isNotePrice, setIsNotePrice] = useState<INote>({ note: "", price: [] })
    // const [isCommission, setIsCommission] = useState<string>("")
    const [bill15last, setBill15last] = useState<IBillMySQL[]>([])
    const [reward5last, setReward5last] = useState<ICheckRewardMySQL[]>([])
    const [billId, setBillId] = useState<IBillMySQL>()
    const [digitWin, setDigitWin] = useState<number[]>([])
    const digitRef = useRef<HTMLInputElement>(null)
    const priceTopRef = useRef<HTMLInputElement>(null)
    const priceBottomRef = useRef<HTMLInputElement>(null)
    const noteRef = useRef<HTMLInputElement>(null)
    const commissionRef = useRef<HTMLInputElement>(null)
    const [deleteBillModal, setDeleteBillModal] = useState<boolean>(false)
    const [deleteDigitsTempModal, setDeleteDigitsTempModal] = useState<boolean>(false)
    const regex = /[\D\sa-zA-Zก-ฮ]/;
    const navigate = useNavigate();
    const [dateTimes, setDateTimes] = useState("")
    const day = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const dateNow = new Date();
    const [image, setImage] = useState<string | ArrayBuffer | null>(null);
    const [time, setTime] = useState<Time>()
    const [isDate, setDate] = useState<TypeDate>({
        startDate: new Date(),
        endDate: new Date()
    });
    let newTime: Time;


    const dispatch = useAppDispatch()
    const bills = useAppSelector(state => state.bill)
    const modal = useAppSelector(state => state.modal)
    const notePrice = useAppSelector(state => state.notePrice)
    // const commissionRedux = useAppSelector(state => state.commission)

    const setDigitValue = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        const value = e.currentTarget!.value as TDigit
        setDigitsTypeTemp(value)
        if (digitsTemp.length > 0) {
            setDeleteBillModal(false)
            setDeleteDigitsTempModal(true)
            dispatch(stateModal({ show: true, openModal: "CONFIG" }))
        } else {
            setDigitsType(value)
            document.getElementById("input_digits")!.focus()
        }
    }


    const addDigitDoubleAndTripleValue = () => {
        if (TWO.includes(digitsType)) {
            setDigitsTemp([...digitsTemp, "00", "11", "22", "33", "44", "55", "66", "77", "88", "99"])
        } else if (THREE.includes(digitsType)) {
            setDigitsTemp([...digitsTemp, "000", "111", "222", "333", "444", "555", "666", "777", "888", "999"])
        }
        document.getElementById("input_digits")!.focus()
    }

    const addDigitSiblingValue = () => {
        if (TWO.includes(digitsType)) {
            setDigitsTemp([...digitsTemp, "01", "12", "23", "34", "45", "56", "67", "78", "89", "90"])
        }
        document.getElementById("input_digits")!.focus()
    }

    const addDigitTripleFrontValue = () => {
        if (THREE.includes(digitsType)) {
            setDigitsTemp([...digitsTemp,
                "001", "002", "003", "004", "005", "006", "007", "008", "009",
                "112", "113", "114", "115", "116", "117", "118", "119", "110",
                "221", "223", "224", "225", "226", "227", "228", "229", "220",
                "331", "332", "334", "335", "336", "337", "338", "339", "330",
                "441", "442", "443", "445", "446", "447", "448", "449", "440",
                "551", "552", "553", "554", "556", "557", "558", "559", "550",
                "661", "662", "663", "664", "665", "667", "668", "669", "660",
                "771", "772", "773", "774", "775", "776", "778", "779", "770",
                "881", "882", "883", "884", "885", "886", "887", "889", "880",
                "991", "992", "993", "994", "995", "996", "997", "998", "990"
            ])
        }
        document.getElementById("input_digits")!.focus()
    }

    const addDigitTripleBacktValue = () => {
        if (THREE.includes(digitsType)) {
            setDigitsTemp([...digitsTemp,
                "100", "200", "300", "400", "500", "600", "700", "800", "900",
                "211", "311", "411", "511", "611", "711", "811", "911", "011",
                "122", "322", "422", "522", "622", "722", "822", "922", "022",
                "133", "233", "433", "533", "633", "733", "833", "933", "033",
                "144", "244", "344", "544", "644", "744", "844", "944", "044",
                "155", "255", "355", "455", "655", "755", "855", "955", "055",
                "166", "266", "366", "466", "566", "766", "866", "966", "066",
                "177", "277", "377", "477", "577", "677", "877", "977", "077",
                "188", "288", "388", "488", "588", "688", "788", "988", "088",
                "199", "299", "399", "499", "599", "699", "799", "899", "099"
            ])
        }
        document.getElementById("input_digits")!.focus()
    }

    const addDigitTripleFrontBackValue = () => {
        if (THREE.includes(digitsType)) {
            setDigitsTemp([...digitsTemp,
                "010", "020", "030", "040", "050", "060", "070", "080", "090",
                "121", "131", "141", "151", "161", "171", "181", "191", "101",
                "212", "232", "242", "252", "262", "272", "282", "292", "202",
                "313", "323", "343", "353", "363", "373", "383", "393", "303",
                "414", "424", "434", "454", "464", "474", "484", "494", "404",
                "515", "525", "535", "545", "565", "575", "585", "595", "505",
                "616", "626", "636", "646", "656", "676", "686", "696", "606",
                "717", "727", "737", "747", "757", "767", "787", "797", "707",
                "818", "828", "838", "848", "858", "868", "878", "898", "808",
                "919", "929", "939", "949", "959", "969", "979", "989", "909"
            ])
        }
        document.getElementById("input_digits")!.focus()
    }

    const inputTemps = () => {
        if (ONE.includes(digitsType)) {
            const digits = digitRef.current!.value.split(regex);
            digits.map((digit) => {
                if (digit.length === 1) {
                    digitRef.current!.value = ""
                    const digitFilter = digits.filter((digit) => digit != "" && digit.length === 1)
                    setDigitsTemp([...digitsTemp].concat(digitFilter))
                }
            })
        } else if (TWO.includes(digitsType)) {
            const digits = digitRef.current!.value.split(regex);
            digits.map((digit) => {
                if (digitsType === "TWO") {
                    if (digit.length === 2) {
                        digitRef.current!.value = ""
                        const digitFilter = digits.filter((digit) => digit != "" && digit.length === 2)
                        setDigitsTemp([...digitsTemp].concat(digitFilter))
                    }
                } else if (digitsType === "NINETEEN") {
                    if (digit.length === 1) {
                        digitRef.current!.value = ""
                        const digitFilter = digits.filter((digit) => digit != "" && digit.length === 1)

                        let digitNineteen = []
                        let digitNineteenRevers = []
                        for (let i = 0; i < 10; i++) {
                            digitNineteen[i] = digitFilter.concat(String(i)).join("")
                            digitNineteenRevers[i] = digitFilter.concat(String(i)).reverse().join("")
                        }
                        const digitNineteenReversResult = digitNineteenRevers.filter(digit => digit[0] != digit[1])
                        setDigitsTemp([...digitsTemp].concat(digitNineteen.concat(digitNineteenReversResult)))
                    }
                }
            })
        } else if (THREE.includes(digitsType)) {
            const digits = digitRef.current!.value.split(regex);
            digits.map((digit) => {
                if (digit.length == 3) {
                    digitRef.current!.value = ""
                    const digitFilter = digits.filter((digit) => digit != "" && digit.length === 3)
                    setDigitsTemp([...digitsTemp].concat(digitFilter))
                    if (digitsType === "SIX") {
                        setTimeout(() => {
                            document.getElementById("revert")!.click()
                        }, 50)
                    }
                }
            })
        }
    }

    const inputTempsKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const spacebar = "space"
        const enter = "enter"
        const numpadenter = "numpadenter"
        if (e.code.toLowerCase() === spacebar) {
            digitRevers()
            digitRef.current!.value = ""
        }
        if (e.code.toLowerCase() === enter || e.code.toLowerCase() === numpadenter) {
            document.getElementById("input_price_top")?.focus()
        }
    }

    const digitRevers = () => {
        // console.log(digitsType);
        if (TWO.includes(digitsType)) {
            if (digitsType === "TWO" || digitsType == "WIN_TWO") {
                const digitRevers = digitsTemp.map((digitTemp) => {
                    const split = digitTemp.split("")
                    return split.reverse().join("")
                })
                const digitFilter = digitRevers.filter(digit => digit[0] != digit[1])
                setDigitsTemp([...digitsTemp].concat(digitFilter))
            } else if (digitsType === "THREE" || digitsType == "WIN_THREE") {
                const tmpFilter: string[] = []
                digitsTemp.map((digitTemp) => {
                    const tmp: string[] = []
                    const split = digitTemp.split("")
                    split.map((_, index) => {
                        const arrTemp: number[] = []
                        for (let i = 0; i < 3; i++) (i !== index) && arrTemp.push(i)
                        tmp.push(split[index].concat(split[arrTemp[0]], split[arrTemp[1]]))
                        tmp.push(split[index].concat(split[arrTemp[1]], split[arrTemp[0]]))
                    })
                    const filter = Array.from(new Set(tmp))
                    filter.map((digit, index) => index > 0 && tmpFilter.push(digit))
                })
                setDigitsTemp([...digitsTemp].concat(tmpFilter))
            }
        } else if (THREE.includes(digitsType)) {
            const tmpFilter: string[] = []
            digitsTemp.map((digitTemp) => {
                const tmp: string[] = []
                const split = digitTemp.split("")
                split.map((_, index) => {
                    const arrTemp: number[] = []
                    for (let i = 0; i < 3; i++) (i !== index) && arrTemp.push(i)
                    tmp.push(split[index].concat(split[arrTemp[0]], split[arrTemp[1]]))
                    tmp.push(split[index].concat(split[arrTemp[1]], split[arrTemp[0]]))
                })
                const filter = Array.from(new Set(tmp))
                filter.map((digit, index) => index > 0 && tmpFilter.push(digit))
            })
            setDigitsTemp([...digitsTemp].concat(tmpFilter))
        }
    }

    const toggleDigitWin = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        const value = parseInt(e.currentTarget.value)
        if (digitWin.includes(value)) {
            const index = digitWin.indexOf(value)
            const setIndex: number[] = []
            if (index > -1) {
                setIndex.concat(digitWin.splice(index, 1))
            }
            setDigitWin([])
            setDigitWin([...digitWin].concat(setIndex))
        } else {
            setDigitWin([...digitWin, value])
        }
    }

    const calculateDigitWin = () => {
        const iDigitWin = []
        if (digitsType == "WIN_TWO") {
            for (let i = 0; i < digitWin.length; i++) {
                for (let j = 0; j < digitWin.length; j++) {
                    if (j + 1 < digitWin.length && j >= i) {
                        const calculate = String(digitWin[i]) + String(digitWin[j + 1])
                        iDigitWin.push(calculate)
                    }
                }
            }
        } else if (digitsType == "WIN_THREE") {
            for (let i = 0; i < digitWin.length; i++) {
                for (let j = 0; j < digitWin.length; j++) {
                    for (let k = 0; k < digitWin.length; k++) {
                        if (j + 1 < digitWin.length && j >= i) {
                            if (k + 2 < digitWin.length && k >= j) {
                                const calculate = String(digitWin[i]) + String(digitWin[j + 1]) + String(digitWin[k + 2])
                                iDigitWin.push(calculate)
                            }
                        }
                    }
                }
            }
        }
        // console.log(iDigitWin);
        setDigitsTemp(iDigitWin)
        setDigitWin([])

        setTimeout(() => {
            document.getElementById("input_digits")!.focus()

        }, 100)
    }

    const addBillTempKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const tab = "tab"
        const enter = "enter"
        const numpadenter = "numpadenter"
        if (e.code.toLowerCase() === tab) {
            addBillTemp()
        } else if (e.code.toLowerCase() === enter || e.code.toLowerCase() === numpadenter) {
            document.getElementById("add_bill")?.focus()
        }
    }

    const nextFocus = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const enter = "enter"
        const numpadenter = "numpadenter"
        if (e.code.toLowerCase() === enter || e.code.toLowerCase() === numpadenter) {
            document.getElementById("input_price_bottom")?.focus()
        }
    }

    const addBillTemp = () => {
        const bill = digitsTemp.map((digitTemp) => {
            return digitTemp + ":" + (priceTopRef.current?.value ? priceTopRef.current!.value : "0") + ":" + (priceBottomRef.current?.value ? priceBottomRef.current!.value : "0")
        })

        if (bill.length > 0) {
            if (!priceTopRef.current?.value && !priceBottomRef.current?.value) {
                alert("กรุณาใส่ราคา");
            } else {
                const priceSum = ((priceTopRef.current!.value ? parseInt(priceTopRef.current!.value) : 0) * bill.length) + ((priceBottomRef.current?.value ? parseInt(priceBottomRef.current!.value) : 0) * bill.length)
                setPrice([...price, priceSum])
                setBillTemp([...billTemp, { digit_type: digitsType, digit: bill }])
                priceTopRef.current!.value = ""
                priceBottomRef.current!.value = ""
                setDigitsTemp([])
            }
        }

        setTimeout(() => {
            document.getElementById("input_digits")!.focus()

        }, 100)
    }

    const removeDigitTemp = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) =>
        setDigitsTemp(digitsTemp.filter((_, index) => index !== parseInt(e.currentTarget.value)))


    const removeBillTemp = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        setBillTemp(billTemp.filter((_, index) => index !== parseInt(e.currentTarget.value)))
        setPrice(price.filter((_, index) => index !== parseInt(e.currentTarget.value)))
    }



    const saveBill = () => {
        if (billTemp.length > 0) {
            dispatch(addBill(billTemp))
            dispatch(addNotePrice(isNotePrice))
            // if (isCommission) {
            //     dispatch(addCommission({
            //         one_digits: {
            //             top: isCommission,
            //             bottom: isCommission
            //         },
            //         two_digits: {
            //             top: isCommission,
            //             bottom: isCommission
            //         },
            //         three_digits: {
            //             top: isCommission,
            //             toad: isCommission
            //         },
            //         constructor: { name: "RowDataPacket" }
            //     }))
            // }
        }
    }

    const deleteBillId = (bill: IBillMySQL) => {
        setDeleteDigitsTempModal(false)
        setDeleteBillModal(true)
        dispatch(stateModal({ show: true, openModal: "CONFIG", confirm: true }))
        setBillId(bill);
    }

    const confirmDelete = async () => {
        if (billId) {
            const access_token = localStorage.getItem(import.meta.env.VITE_OPS_TOKEN);
            const axiosConfig: AxiosRequestConfig = { withCredentials: true, timeout: 10000, headers: { Authorization: `Bearer ${access_token}` } }
            await axios.put(`${import.meta.env.VITE_OPS_URL}/delete/bill`, billId, axiosConfig)
        }
        fetchLotto15Last(dateTimes)
        dispatch(stateModal({ show: false, openModal: "CONFIG" }))
    }

    const confirmDeleteDigitsTemp = () => {
        setDigitsTemp([])
        // dispatch(stateModal({ show: false, openModal: "CONFIRM" }))
        setDigitsType(digitsTypeTemp)
        dispatch(deleteBill())
        dispatch(stateModal({ show: false, openModal: "CONFIG" }))
    }


    const { isUser } = useContext(AuthContext)
    const [lotto, setLotto] = useState<ILottoMySQL | null>(null)
    const [digitClose, setDigitClose] = useState<IDigitCloseMySQL | null>(null)
    const [digitSemi, setDigitSemi] = useState<IDigitSemiMySQL | null>(null)
    const location = useLocation()


    const initialLotto = async () => {
        const id = location.pathname.split("/")[2]
        fetchPromotions()
        const access_token = localStorage.getItem(import.meta.env.VITE_OPS_TOKEN);
        const axiosConfig: AxiosRequestConfig = { withCredentials: true, timeout: 10000, headers: { Authorization: `Bearer ${access_token}` } }
        const lotto = await axios.get(import.meta.env.VITE_OPS_URL + `/get/lotto/id/${id}`, axiosConfig)
        fetchReward5Last()

        const this_hours = new Date().getHours()
        const this_minutes = new Date().getMinutes()
        const t = `${this_hours}:${this_minutes}`

        if (lotto.data && lotto.status == 200) {
            const data = lotto.data as ILottoMySQL

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
            fetchLotto15Last(`${year}-${month}-${day}`)
            if (data.l_status == TLottoStatusEnum.OPEN) {
                fetchImage(data.img_flag);
                setLotto(data)
                timer(data.l_id, data.open, data.close, data.l_status as TLottoStatusEnum, 1, data.date_type as TLottoDateEnum, data.thai_this_times, data.thai_open_date!, data.now)
            } else {
                setLotto(null)
                navigate("/")
            }
        } else {
            setLotto(null)
            navigate("/")
        }

        if (lotto.data && lotto.status == 200) {
            const data = lotto.data as IRateMySQL
            const commission: ICommissionMySQL = {
                one_digits: {
                    top: data.c_one_digits.top,
                    bottom: data.c_one_digits.bottom
                },
                two_digits: {
                    top: data.c_two_digits.top,
                    bottom: data.c_two_digits.bottom
                },
                three_digits: {
                    top: data.c_three_digits.top,
                    toad: data.c_three_digits.toad
                },
                constructor: { name: "RowDataPacket" }
            }
            if (!commissionRef.current?.value) {
                dispatch(addCommission(commission))
            }
        }
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

    const fetchDigitClose = async () => {
        try {
            const id = location.pathname.split("/")[2]
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
            } else {
                setDigitClose(null)
            }

        } catch (error) {
        }

    }

    const fetchDigitSemi = async () => {
        try {
            const id = location.pathname.split("/")[2]
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
                setDigitSemi(res.data)
            } else {
                setDigitSemi(null)
            }

        } catch (error) {
        }

    }

    const fetchImage = async (flag_name: string) => {
        try {
            const access_token = localStorage.getItem(import.meta.env.VITE_OPS_TOKEN);
            const axiosConfig: AxiosRequestConfig = { withCredentials: true, timeout: 10000, headers: { Authorization: `Bearer ${access_token}` } }
            const res = await axios.get(`${import.meta.env.VITE_OPS_URL}/get/file/${flag_name}`, {
                responseType: 'blob',
                timeout: axiosConfig.timeout
            })
            if (res && res.status == 200) {
                const reader = new FileReader();
                reader.readAsDataURL(res.data);

                reader.onloadend = function () {
                    const base64data = reader.result;
                    setImage(base64data);
                };
            }
        } catch (error) {

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

    const fetchLotto15Last = async (times: string) => {
        const id = location.pathname.split("/")[2]
        const access_token = localStorage.getItem(import.meta.env.VITE_OPS_TOKEN);
        const axiosConfig: AxiosRequestConfig = { withCredentials: true, timeout: 10000, headers: { Authorization: `Bearer ${access_token}` } }
        const res = await axios.get(import.meta.env.VITE_OPS_URL + `/get/bill/last/${id}/${times}`, axiosConfig)
        if (res && res.status == 200) {
            const bill15 = res.data as IBillMySQL[]
            setBill15last(bill15)
        }
    }

    const fetchReward5Last = async () => {
        const id = location.pathname.split("/")[2]
        const access_token = localStorage.getItem(import.meta.env.VITE_OPS_TOKEN);
        const axiosConfig: AxiosRequestConfig = { withCredentials: true, timeout: 10000, headers: { Authorization: `Bearer ${access_token}` } }
        const res = await axios.get(import.meta.env.VITE_OPS_URL + `/get/reward/last/${id}`, axiosConfig)
        if (res && res.status == 200) {
            const reward5 = res.data as ICheckRewardMySQL[]
            setReward5last(reward5)
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

    const getCountdownTime = (t1: string, t2: string, t3: string) => {
        //t1 เวลาเปิด t2 เวลาปิด t3 เวลาปัจจุบัน
        //check เวลาปิดน้อยกว่าหรือเท่ากับเวลาเปิด ถ้าน้อยกว่า จะเท่ากับงวด พรุ่งนี้
        if (parseInt(t2.split(":")[0]) <= parseInt(t1.split(":")[0])) {
            // ถ้าเวลาปิด == เวลาเปิด
            if (parseInt(t2.split(":")[0]) == parseInt(t1.split(":")[0])) {
                // ให้เช็ค นาที ปิด น้อยกว่า นาทีเปิด
                if (parseInt(t2.split(":")[1]) < parseInt(t1.split(":")[1])) return true
                return false
            }
            return true
        } else {
            if (parseInt(t3.split(":")[0]) <= parseInt(t2.split(":")[0])) {
                if (parseInt(t3.split(":")[0]) == parseInt(t2.split(":")[0])) {
                    // ให้เช็ค นาที ปิด น้อยกว่า นาทีเปิด
                    if (parseInt(t3.split(":")[1]) < parseInt(t2.split(":")[1])) return true
                    return false
                }
                return true
            }
            return false
        }
    }

    useEffect(() => {
        initialLotto()

    }, [])

    useEffect(() => {
        // io.on("get_digit_close", () => fetchDigitClose())
        // io.on("get_digit_semi", () => fetchDigitSemi())
        fetchDigitClose()
        fetchDigitSemi()
    }, [lotto])

    useEffect(() => {
        if (isUser) {
            if (lotto) {
                if (bills.length > 0) {
                    setBillTemp(bills)
                    dispatch(deleteBill())
                    setIsNotePrice(notePrice)
                    setPrice(notePrice.price)
                }
                if (price.length > 0) {
                    setIsNotePrice({ note: noteRef.current?.value, price: price })
                }
            }
        }

    }, [digitsTemp, billTemp, modal, price, digitWin, lotto])

    const render = () => {
        return (
            <>
                {
                    billTimeout && <div className="overlay-timeout">
                        {modal.openModal === "TIMEOUT" && <ModalNotice />}
                    </div>
                }
                <div id="bill" className="flex flex-col" onLoad={() => document.getElementById("input_digits")!.focus()}>
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
                                        <span>{lotto ? lotto.l_name : ""}</span>
                                        <span>{`${moment(dateTimes).format("DD-MM-YYYY")}`}</span>
                                    </div>
                                    <div className="flex justify-between w-full p-2">
                                        <span>อัตราจ่าย</span>
                                        <span>{lotto ? lotto.promotion == "USED" && promotions[0] && JSON.parse(promotions[0].p_promotion.toString()).includes(day[new Date(dateTimes).getDay()]) ? JSON.parse(promotions[0].rt_two_digits).top : JSON.parse(lotto.rt_two_digits).top : ""} อัตราจ่ายเริ่มต้น</span>
                                        <span>ดูรายละเอียด</span>
                                        <span><img width={60} src={`${image}`} alt="flag" className="object-cover" /></span>
                                    </div>
                                </div>
                                <div id="bill_screenshot" className="pt-3">
                                    <div id="bill_body" className="flex flex-col items-center rounded-lg border border-green-400 bg-green-100 w-full mb-3 p-2">
                                        <div className="w-full p-2">
                                            <span>แทงเร็ว</span>
                                        </div>
                                        <div className="flex justify-between w-full p-2">
                                            <span>{lotto ? lotto.l_name : ""}</span>
                                            <span>{`${moment(dateTimes).format("DD-MM-YYYY")}`}</span>
                                        </div>
                                        <div className="border-t w-full"></div>
                                        <div className="flex justify-evenly w-full p-2">
                                            <div className="w-full">
                                                <button value={"TWO" as TDigit} onClick={setDigitValue} style={{ width: "60px" }} className={"text-xs bg-white text-gray-800 font-semibold p-2 border rounded shadow mx-2 mb-2 " + (digitsType === "TWO" ? "bg-green-400 border-green-500" : "bg-gray-100 border-gray-400 hover:bg-gray-200")}>2 ตัว</button>
                                                <button value={"THREE" as TDigit} onClick={setDigitValue} style={{ width: "60px" }} className={"text-xs bg-white text-gray-800 font-semibold p-2 border rounded shadow mx-2 mb-2 " + (digitsType === "THREE" ? "bg-green-400 border-green-500" : "bg-gray-100 border-gray-400 hover:bg-gray-200")}>3 ตัว</button>
                                                {/* <button value={"SIX" as TDigit} onClick={setDigitValue} style={{ width: "60px" }} className={"text-xs bg-white text-gray-800 font-semibold p-2 border rounded shadow mx-2 mb-2 " + (digitsType === "SIX" ? "bg-green-400 border-green-500" : "bg-gray-100 border-gray-400 hover:bg-gray-200")}>6 กลับ</button> */}
                                                <button value={"NINETEEN" as TDigit} onClick={setDigitValue} style={{ width: "60px" }} className={"text-xs bg-white text-gray-800 font-semibold p-2 border rounded shadow mx-2 mb-2 " + (digitsType === "NINETEEN" ? "bg-green-400 border-green-500" : "bg-gray-100 border-gray-400 hover:bg-gray-200")}>19 ประตู</button>
                                                <button value={"ONE" as TDigit} onClick={setDigitValue} style={{ width: "60px" }} className={"text-xs bg-white text-gray-800 font-semibold p-2 border rounded shadow mx-2 mb-2 " + (digitsType === "ONE" ? "bg-green-400 border-green-500" : "bg-gray-100 border-gray-400 hover:bg-gray-200")}>เลขวิ่ง</button>
                                                <button value={"WIN_TWO" as TDigit} onClick={setDigitValue} style={{ width: "60px" }} className={"text-xs bg-white text-gray-800 font-semibold p-2 border rounded shadow mx-2 mb-2 " + (digitsType === "WIN_TWO" || digitsType == "WIN_THREE" ? "bg-green-400 border-green-500" : "bg-gray-100 border-gray-400 hover:bg-gray-200")}>วินเลข</button>
                                            </div>
                                            <div>
                                                <img width={60} src={`${image}`} alt="flag" />
                                            </div>
                                        </div>
                                        {
                                            (digitsType === "WIN_TWO" || digitsType === "WIN_THREE") &&
                                            <div className="flex justify-between w-full p-2">
                                                <div id="btn_digit_win" className="w-full mb-2 p-2">

                                                    <div className="flex flex-wrap">
                                                        <div className="flex items-center mr-4 mb-3">
                                                            <input checked={digitsType == "WIN_TWO" ? true : false} onChange={() => { setDigitWin([]); setDigitsTemp([]); setDigitsType("WIN_TWO") }} id="two-win-radio" type="radio" value="" name="colored-radio" className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 focus:ring-red-500 dark:focus:ring-red-600 focus:ring-2" />
                                                            <label htmlFor="two-win-radio" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">วิน 2 ตัว</label>
                                                        </div>
                                                        <div className="flex items-center mr-4 mb-3">
                                                            <input checked={digitsType == "WIN_THREE" ? true : false} onChange={() => { setDigitWin([]); setDigitsTemp([]); setDigitsType("WIN_THREE") }} id="three-win-radio" type="radio" value="" name="colored-radio" className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 focus:ring-green-500 dark:focus:ring-green-600 focus:ring-2" />
                                                            <label htmlFor="three-win-radio" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">วิน 3 ตัว</label>
                                                        </div>
                                                    </div>

                                                    <div className="digit">
                                                        <div className="w-full">
                                                            <button onClick={toggleDigitWin} value={1} style={{ width: "50px", height: "50px" }} className={"text-md font-semibold p-2 border shadow px-2 " + (digitWin.includes(1) ? "border-blue-600 bg-blue-600 text-white" : "border-blue-200 hover:text-white hover:border-blue-500 bg-blue-100 hover:bg-blue-500 text-gray-800")}>1</button>
                                                            <button onClick={toggleDigitWin} value={2} style={{ width: "50px", height: "50px" }} className={"text-md font-semibold p-2 border shadow px-2 " + (digitWin.includes(2) ? "border-blue-600 bg-blue-600 text-white" : "border-blue-200 hover:text-white hover:border-blue-500 bg-blue-100 hover:bg-blue-500 text-gray-800")}>2</button>
                                                            <button onClick={toggleDigitWin} value={3} style={{ width: "50px", height: "50px" }} className={"text-md font-semibold p-2 border shadow px-2 " + (digitWin.includes(3) ? "border-blue-600 bg-blue-600 text-white" : "border-blue-200 hover:text-white hover:border-blue-500 bg-blue-100 hover:bg-blue-500 text-gray-800")}>3</button>
                                                            <button onClick={toggleDigitWin} value={4} style={{ width: "50px", height: "50px" }} className={"text-md font-semibold p-2 border shadow px-2 " + (digitWin.includes(4) ? "border-blue-600 bg-blue-600 text-white" : "border-blue-200 hover:text-white hover:border-blue-500 bg-blue-100 hover:bg-blue-500 text-gray-800")}>4</button>
                                                            <button onClick={toggleDigitWin} value={5} style={{ width: "50px", height: "50px" }} className={"text-md font-semibold p-2 border shadow px-2 " + (digitWin.includes(5) ? "border-blue-600 bg-blue-600 text-white" : "border-blue-200 hover:text-white hover:border-blue-500 bg-blue-100 hover:bg-blue-500 text-gray-800")}>5</button>
                                                        </div>
                                                        <div className="w-full">
                                                            <button onClick={toggleDigitWin} value={6} style={{ width: "50px", height: "50px" }} className={"text-md font-semibold p-2 border shadow px-2 " + (digitWin.includes(6) ? "border-blue-600 bg-blue-600 text-white" : "border-blue-200 hover:text-white hover:border-blue-500 bg-blue-100 hover:bg-blue-500 text-gray-800")}>6</button>
                                                            <button onClick={toggleDigitWin} value={7} style={{ width: "50px", height: "50px" }} className={"text-md font-semibold p-2 border shadow px-2 " + (digitWin.includes(7) ? "border-blue-600 bg-blue-600 text-white" : "border-blue-200 hover:text-white hover:border-blue-500 bg-blue-100 hover:bg-blue-500 text-gray-800")}>7</button>
                                                            <button onClick={toggleDigitWin} value={8} style={{ width: "50px", height: "50px" }} className={"text-md font-semibold p-2 border shadow px-2 " + (digitWin.includes(8) ? "border-blue-600 bg-blue-600 text-white" : "border-blue-200 hover:text-white hover:border-blue-500 bg-blue-100 hover:bg-blue-500 text-gray-800")}>8</button>
                                                            <button onClick={toggleDigitWin} value={9} style={{ width: "50px", height: "50px" }} className={"text-md font-semibold p-2 border shadow px-2 " + (digitWin.includes(9) ? "border-blue-600 bg-blue-600 text-white" : "border-blue-200 hover:text-white hover:border-blue-500 bg-blue-100 hover:bg-blue-500 text-gray-800")}>9</button>
                                                            <button onClick={toggleDigitWin} value={0} style={{ width: "50px", height: "50px" }} className={"text-md font-semibold p-2 border shadow px-2 " + (digitWin.includes(0) ? "border-blue-600 bg-blue-600 text-white" : "border-blue-200 hover:text-white hover:border-blue-500 bg-blue-100 hover:bg-blue-500 text-gray-800")}>0</button>
                                                        </div>
                                                    </div>
                                                    <div className="calculate w-full mt-2">
                                                        <button onClick={calculateDigitWin} style={{ minWidth: "60px" }} className="whitespace-nowrap items-center text-xs bg-orange-400 hover:bg-orange-500 text-white font-semibold p-2 rounded shadow">คำนวณ</button>
                                                    </div>


                                                </div>
                                            </div>
                                        }

                                        <div className="flex justify-between w-full p-2">
                                            <div id="show_digit_temps">
                                                {
                                                    digitsTemp.map((digit, index) => <button onClick={removeDigitTemp} value={index} key={index} style={{ width: "40px" }} className={"text-xs text-white font-semibold bg-blue-600 hover:bg-blue-700 p-3 border rounded shadow mx-1 mb-2"}>{digit}</button>)
                                                }

                                            </div>
                                            <div id="remove_digit_temps">
                                                <button onClick={() => setDigitsTemp([])} style={{ width: "60px" }} className="whitespace-nowrap inline-flex text-xs bg-red-500 hover:bg-red-400 text-white font-light p-2 rounded shadow mx-2 mb-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                    </svg>
                                                    &nbsp;ยกเลิก</button>
                                            </div>
                                        </div>

                                        <div className="flex justify-start w-full p-2">
                                            {
                                                TWO.includes(digitsType) && digitsType !== "WIN_TWO" ?
                                                    <>
                                                        <button onClick={addDigitDoubleAndTripleValue} style={{ width: "60px" }} className="whitespace-nowrap inline-flex text-xs bg-green-600 hover:bg-green-700 text-white font-light p-2 rounded shadow mx-2 mb-2">
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                                            </svg>
                                                            &nbsp;เลขเบิ้ล</button>
                                                        {digitsType != "NINETEEN" &&
                                                            <button onClick={addDigitSiblingValue} style={{ width: "60px" }} className="whitespace-nowrap inline-flex text-xs bg-orange-600 hover:bg-orange-700 text-white font-light p-2 rounded shadow mx-2 mb-2">
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                                                </svg>
                                                                &nbsp;พี่น้อง</button>}
                                                    </>
                                                    : (THREE.includes(digitsType) && digitsType !== "WIN_THREE") &&
                                                    <>
                                                        <button onClick={addDigitDoubleAndTripleValue} style={{ width: "60px" }} className="whitespace-nowrap inline-flex text-xs bg-green-600 hover:bg-green-700 text-white font-light p-2 rounded shadow mx-2 mb-2">
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                                            </svg>
                                                            &nbsp;เลขตอง</button>
                                                        <button onClick={addDigitTripleFrontValue} style={{ width: "60px" }} className="whitespace-nowrap inline-flex text-xs bg-orange-600 hover:bg-orange-700 text-white font-light p-2 rounded shadow mx-2 mb-2">
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                                            </svg>
                                                            &nbsp;เบิ้ลหน้า</button>
                                                        <button onClick={addDigitTripleBacktValue} style={{ width: "60px" }} className="whitespace-nowrap inline-flex text-xs bg-orange-600 hover:bg-orange-700 text-white font-light p-2 rounded shadow mx-2 mb-2">
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                                            </svg>
                                                            &nbsp;เบิ้ลหลัง</button>
                                                        <button onClick={addDigitTripleFrontBackValue} style={{ width: "60px" }} className="whitespace-nowrap inline-flex text-xs bg-orange-600 hover:bg-orange-700 text-white font-light p-2 rounded shadow mx-2 mb-2">
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                                            </svg>
                                                            &nbsp;เลขหาม</button>
                                                    </>


                                            }

                                        </div>
                                        <div className="border-t w-full"></div>
                                        <div className="flex justify-around p-2 pt-4 gap-4">
                                            <div className="relative z-0">
                                                <input tabIndex={1} ref={digitRef} onKeyUp={inputTempsKey} onChange={inputTemps} type={"text"} id="input_digits" className="bg-white rounded-none block h-8 py-2 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
                                                <label htmlFor="input_digits" style={{ transition: ".3s" }} className="cursor-text peer-focus:cursor-default pl-1 absolute text-sm text-gray-500 dark:text-gray-400 transform -translate-y-6 scale-75 top-3 z-50 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-7">ใส่เลข</label>
                                            </div>
                                            <button id="revert" onClick={digitRevers} style={{ minWidth: "60px" }} className="whitespace-nowrap items-center text-xs bg-orange-500 hover:bg-orange-400 text-white font-light p-2 rounded shadow">กลับเลข</button>
                                            <div className="relative z-0">
                                                <input onKeyDown={nextFocus} tabIndex={2} ref={priceTopRef} type={"number"} id="input_price_top" className="bg-white rounded-none block h-8 py-2 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
                                                <label htmlFor="input_price_top" style={{ transition: ".3s" }} className="cursor-text peer-focus:cursor-default pl-1 absolute text-sm text-gray-500 dark:text-gray-400 transform -translate-y-6 scale-75 top-3 z-50 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-7">บน</label>
                                            </div>
                                            <div className="relative z-0">
                                                <input onKeyDown={addBillTempKey} tabIndex={3} ref={priceBottomRef} type={"number"} id="input_price_bottom" className="bg-white rounded-none block h-8 py-2 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
                                                <label htmlFor="input_price_bottom" style={{ transition: ".3s" }} className="cursor-text peer-focus:cursor-default pl-1 absolute text-sm text-gray-500 dark:text-gray-400 transform -translate-y-6 scale-75 top-3 z-50 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-7">{["ONE", "TWO", "NINETEEN", "WIN_TWO"].includes(digitsType) ? "ล่าง" : "โต๊ด"}</label>
                                            </div>
                                            <button id="add_bill" onKeyDown={addBillTemp} onChange={addBillTemp} onMouseUp={addBillTemp} tabIndex={4} style={{ minWidth: "60px" }} className="whitespace-nowrap items-center inline-flex text-xs bg-green-600 hover:bg-green-500 text-white font-light p-2 rounded shadow">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                                </svg>
                                                &nbsp;เพิ่มบิล</button>
                                        </div>
                                        <div className="flex justify-between w-full p-2">
                                            <div id="show_digit_orders" className="flex flex-col w-full">
                                                {
                                                    billTemp!.map((bill, index) => (
                                                        <div key={"bill_" + index} className="flex flex-row w-full bg-gray-100 justify-center items-center my-2">
                                                            {
                                                                bill.digit[0] && ONE.includes(bill.digit_type) ?
                                                                    <div className="p-2 px-4 mx-auto text-center">วิ่ง<br />บน x ล่าง<br />{bill.digit[0].split(":")[1]} x {bill.digit[0].split(":")[2]}</div>
                                                                    : bill.digit[0] && TWO.includes(bill.digit_type) ?
                                                                        <div className="p-2 px-4 mx-auto text-center">2 ตัว<br />บน x ล่าง<br />{bill.digit[0].split(":")[1]} x {bill.digit[0].split(":")[2]}</div>
                                                                        : bill.digit[0] && THREE.includes(bill.digit_type) &&
                                                                        <div className="p-2 px-4 mx-auto text-center">3 ตัว<br />บน x โต๊ด<br />{bill.digit[0].split(":")[1]} x {bill.digit[0].split(":")[2]}</div>
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

                                    <div id="bill_footer" className="flex flex-col items-center rounded-lg w-full mb-3 p-2">
                                        {/* <div className="flex justify-center w-full p-2 gap-2">
                                            <label htmlFor="input_commission">ส่วนลด: </label>
                                            <input type="text" className="rounded-none border w-50" ref={commissionRef} id="input_commission" onChange={(e) => {setIsCommission(e.currentTarget.value);console.log(isCommission);}} value={isCommission} />
                                            <span>%</span>
                                        </div> */}
                                        <div className="flex justify-center w-full p-2 gap-2">
                                            <label htmlFor="input_note">หมายเหตุ: </label>
                                            <input type="text" className="rounded-none border-b w-full" ref={noteRef} id="input_note" onChange={(e) => setIsNotePrice({ note: e.currentTarget.value, price: isNotePrice.price })} value={isNotePrice.note} />
                                        </div>
                                        <div style={{ fontSize: "25px" }} className="flex justify-center w-full p-2 gap-2">
                                            <span>รวม:</span>
                                            <span>{price.reduce((price, current) => price + current, 0)} บาท</span>
                                        </div>
                                        <div className="flex justify-center w-full p-2 gap-2">
                                            {!isMobile() ? <button onClick={() => copyElementToClipboard(document.getElementById("bill_screenshot")!)} style={{ minWidth: "60px" }} className="whitespace-nowrap inline-flex text-xs bg-green-600 hover:bg-green-500 text-white font-light p-2 rounded shadow">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                                                </svg>
                                                &nbsp;Screenshot</button> : null}

                                            <Link to={billTemp.length > 0 ? `/bill/check/${location.pathname.split("/")[2]}` : "#"}>
                                                <button onClick={saveBill} style={{ minWidth: "60px" }} className={"whitespace-nowrap text-xs text-white font-light p-2 rounded shadow " + (billTemp.length === 0 ? "bg-gray-200 cursor-default" : "bg-blue-600 hover:bg-blue-500")}>บันทึก</button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                        <div className="basis-3/6 w-full p-2">
                            {/* <table id="statics" className="w-full mb-3">
                                <thead className="bg-red-500 text-white">
                                    <tr>
                                        <th>สถิติรางวัล</th>
                                        <th>5 งวดล่าสุด</th>
                                        <th>3 ตัวบน</th>
                                        <th>2 ตัวบน</th>
                                        <th>2 ตัวล่าง</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="border px-1 font-light">ดาวน์โจนส์ VIP</td>
                                        <td className="border px-1 font-light">2022-12-09</td>
                                        <td className="border px-1 font-light">231</td>
                                        <td className="border px-1 font-light">31</td>
                                        <td className="border px-1 font-light">22</td>
                                    </tr>
                                </tbody>
                            </table> */}

                            <table id="digits_close" className="w-full mb-3">
                                <thead className="bg-blue-800 text-white">
                                    <tr>
                                        <th>เลขมาแรง</th>
                                        <th>จ่ายครึ่ง</th>
                                        <th>ปิดรับ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="border px-1 font-light">2 ตัวบน</td>
                                        <td className="border px-1 font-light">
                                            {digitSemi?.two_digits && JSON.parse(digitSemi?.two_digits.toString()).top && (JSON.parse(digitSemi?.two_digits.toString()).top + " ").replaceAll(",", ", ")}
                                        </td>
                                        <td className="border px-1 font-light">
                                            {digitClose?.two_digits && JSON.parse(digitClose?.two_digits.toString()).top && (JSON.parse(digitClose?.two_digits.toString()).top + " ").replaceAll(",", ", ")}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border px-1 font-light">2 ตัวล่าง</td>
                                        <td className="border px-1 font-light">
                                            {digitSemi?.two_digits && JSON.parse(digitSemi?.two_digits.toString()).bottom && (JSON.parse(digitSemi?.two_digits.toString()).bottom + " ").replaceAll(",", ", ")}
                                        </td>
                                        <td className="border px-1 font-light">
                                            {digitClose?.two_digits && JSON.parse(digitClose?.two_digits.toString()).bottom && (JSON.parse(digitClose?.two_digits.toString()).bottom + " ").replaceAll(",", ", ")}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border px-1 font-light">3 ตัวบน</td>
                                        <td className="border px-1 font-light">
                                            {digitSemi?.three_digits && JSON.parse(digitSemi?.three_digits.toString()).top && (JSON.parse(digitSemi?.three_digits.toString()).top + " ").replaceAll(",", ", ")}
                                        </td>
                                        <td className="border px-1 font-light">
                                            {digitClose?.three_digits && JSON.parse(digitClose?.three_digits.toString()).top && (JSON.parse(digitClose?.three_digits.toString()).top + " ").replaceAll(",", ", ")}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border px-1 font-light">3 ตัวโต๊ด</td>
                                        <td className="border px-1 font-light">
                                            {digitSemi?.three_digits && JSON.parse(digitSemi?.three_digits.toString()).toad && (JSON.parse(digitSemi?.three_digits.toString()).toad + " ").replaceAll(",", ", ")}
                                        </td>
                                        <td className="border px-1 font-light">
                                            {digitClose?.three_digits && JSON.parse(digitClose?.three_digits.toString()).toad && (JSON.parse(digitClose?.three_digits.toString()).toad + " ").replaceAll(",", ", ")}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border px-1 font-light">วิ่งบน</td>
                                        <td className="border px-1 font-light">
                                            {digitSemi?.one_digits && JSON.parse(digitSemi?.one_digits.toString()).top && (JSON.parse(digitSemi?.one_digits.toString()).top + " ").replaceAll(",", ", ")}
                                        </td>
                                        <td className="border px-1 font-light">
                                            {digitClose?.one_digits && JSON.parse(digitClose?.one_digits.toString()).top && (JSON.parse(digitClose?.one_digits.toString()).top + " ").replaceAll(",", ", ")}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border px-1 font-light">วิ่งล่าง</td>
                                        <td className="border px-1 font-light">
                                            {digitSemi?.one_digits && JSON.parse(digitSemi?.one_digits.toString()).bottom && (JSON.parse(digitSemi?.one_digits.toString()).bottom + " ").replaceAll(",", ", ")}
                                        </td>
                                        <td className="border px-1 font-light">
                                            {digitClose?.one_digits && JSON.parse(digitClose?.one_digits.toString()).bottom && (JSON.parse(digitClose?.one_digits.toString()).bottom + " ").replaceAll(",", ", ")}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            <table id="last_order" className="w-full mb-3">
                                <caption className="text-start">รายการบิลล่าสุด (แสดง 15 รายการ)</caption>
                                <thead className="bg-blue-800 text-white">
                                    <tr>
                                        <th>เวลาแทง</th>
                                        <th>ตลาด</th>
                                        <th>บาท</th>
                                        <th>หมายเหตุ</th>
                                        <th>ลบโพย</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        bill15last.map((b15, index) => (
                                            <tr key={index} className={b15.b_status == "CANCEL" ? "bg-red-200" : ""}>
                                                <td className="border px-1 font-light text-center">{moment(`${new Date(b15.b_created_at).toUTCString()}`).utcOffset('+0700').format("DD-MM-YYYY HH:mm:ss")}</td>
                                                <td className="border px-1 font-light text-center">{b15.l_name}#{moment(`${new Date(b15.times).toUTCString()}`).utcOffset('+0700').format("DD-MM-YYYY")}</td>
                                                <td className="border px-1 font-light text-center">{(parseFloat(b15.price) - parseFloat(b15.rebate)).toFixed(2)}</td>
                                                <td className="border px-1 font-light text-center">{b15.note}</td>
                                                <td className="border px-1 font-light text-center">
                                                    {
                                                        b15.b_status == "WAIT" && <button onClick={() => deleteBillId(b15)} className="text-xs text-red-600 hover:text-red-400 font-bold p-2 rounded shadow mx-2">
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                            </svg></button>
                                                    }
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {modal.openModal === "CONFIRM" && <ModalConfirm />}
                </div>

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
                                            {deleteDigitsTempModal ? "ต้องการล้างรายการหรือไม่ ?" : "ต้องการลบบิลหรือไม่ ?"}
                                        </h4>
                                        <div className="items-center gap-2 mt-3 sm:flex">
                                            <button
                                                className="w-full mt-2 p-2.5 flex-1 text-white bg-red-600 rounded-md outline-none ring-offset-2 ring-red-600 focus:ring-2"
                                                onClick={deleteDigitsTempModal ? confirmDeleteDigitsTemp : confirmDelete}
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
            </>
        )
    }

    const isLoading = document.getElementById("loading")

    const checkRender = () => {
        if (!lotto) {
            isLoading!.removeAttribute("style")
            isLoading!.style.position = "fixed"
            return <></>
        } else {
            isLoading!.removeAttribute("style")
            isLoading!.style.display = "none"
            return render()
        }

    }

    return (
        isUser && checkRender()
    )
}