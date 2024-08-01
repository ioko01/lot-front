import { Fragment, useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContextProvider";
import axios, { AxiosRequestConfig } from "axios";
import { ILottoMySQL, TLottoDateEnum, TLottoStatusEnum } from "../../models/Lotto";
import { countdown, countdownDate } from "../../utils/countdown";
import { Time } from "../../models/Time";
import group from "../../group.json";
import moment from "moment";

// interface ImageBase64 {
//     name: string
//     data: string
// }

interface ImageURL {
    name: string
    url: string
}

export function Home() {
    const { isUser } = useContext(AuthContext)
    const [lotto, setLotto] = useState<ILottoMySQL[] | null>(null)

    const [times, setTimes] = useState<Time[]>([])
    const [timesThai, setTimesThai] = useState<Time[]>([])
    // let newTimes: Time[] = [];
    let count = 0
    const isLoading = document.getElementById("loading")


    const day = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']


    const [imageURL, setImageURL] = useState<ImageURL[]>([]);

    const fetchLottoAll = async () => {
        try {
            if (isUser) {
                isLoading!.removeAttribute("style")
                isLoading!.style.position = "fixed"
                const access_token = localStorage.getItem(import.meta.env.VITE_OPS_TOKEN);
                const axiosConfig: AxiosRequestConfig = { withCredentials: true, timeout: 10000, headers: { Authorization: `Bearer ${access_token}` } }
                const res = await axios.get(import.meta.env.VITE_OPS_URL + `/lottos/${isUser!.store_id}`, axiosConfig)
                const lottos = res.data as ILottoMySQL[]
                setLotto(lottos)
                if (lottos && res.status == 200) {
                    mapLotto(lottos!)
                    lottos!.map((res) => {
                        if (imageURL.length < lottos.length) setImageURL(prevArray => [...prevArray, { name: res.l_name, url: `${import.meta.env.VITE_OPS_URL}/images/${res.l_img_flag}` }])
                        const date_moment = moment(new Date(res.now)).utc()
                        let this_hours = date_moment.format("HH")
                        let this_minutes = date_moment.format("mm")
                        const t = `${this_hours}:${this_minutes}`
                        let close
                        let open
                        if (res.date_type == "THAI") {
                            let cd
                            const this_thai = moment(new Date(res.thai_this_times))
                            const date_now = moment(new Date(res.now))
                            close = `${this_thai.format("YYYY-MM-DD")} ${res.close}:00`
                            open = this_thai.subtract(parseInt(res.thai_open_date!), "days").format("YYYY-MM-DD HH:mm:ss")
                            if (date_now.format("YYYY-MM-DD HH:mm:ss") > `${this_thai.format("YYYY-MM-DD")} ${res.close}:00`) {
                                cd = countdownDate(open, close!)
                            } else {
                                cd = {
                                    days: -1,
                                    hours: -1,
                                    minutes: -1,
                                    seconds: -1
                                }
                            }
                            if (cd.hours >= 0) {
                                if (res.status == TLottoStatusEnum.CLOSE) {
                                    axios.put(`${import.meta.env.VITE_OPS_URL}/status/lotto`, { id: res.l_id, status: TLottoStatusEnum.OPEN }, axiosConfig)
                                }
                            } else if (cd.hours < 0) {
                                if (res.status == TLottoStatusEnum.OPEN) {
                                    axios.put(`${import.meta.env.VITE_OPS_URL}/status/lotto`, { id: res.l_id, status: TLottoStatusEnum.CLOSE }, axiosConfig)
                                }
                            }
                        } else {
                            const cd = countdown(res.open, res.close, getTomorrow(res.open, res.close))
                            // console.log(t, cd.days, cd.hours, cd.minutes, res.name, res.open, res.close, getTomorrow(res.open, res.close));

                            if (cd.hours >= 0) {

                                // if (!res.date_open?.includes(day[new Date(res.now).getUTCDay()])) {
                                //     if (res.date_open?.includes(day[new Date(res.now).getUTCDay() - 1]) && res.status == TLottoStatusEnum.CLOSE && getTomorrow(res.open, res.close) && getTomorrow(res.open, t)) {
                                //         axios.put(`${import.meta.env.VITE_OPS_URL}/status/lotto`, { id: res.l_id, status: TLottoStatusEnum.OPEN }, axiosConfig)
                                //     }
                                // } else if (res.date_open?.includes(day[new Date(res.now).getUTCDay()])) {
                                //     if (!res.date_open?.includes(day[new Date(res.now).getUTCDay() - 1]) && res.status == TLottoStatusEnum.OPEN && getTomorrow(res.open, res.close) && getTomorrow(res.open, t)) {
                                //         axios.put(`${import.meta.env.VITE_OPS_URL}/status/lotto`, { id: res.l_id, status: TLottoStatusEnum.CLOSE }, axiosConfig)
                                //     } else if (!res.date_open?.includes(day[new Date(res.now).getUTCDay() - 1]) && res.status == TLottoStatusEnum.CLOSE && !getTomorrow(res.open, res.close) && !getTomorrow(res.open, t)) {
                                //         axios.put(`${import.meta.env.VITE_OPS_URL}/status/lotto`, { id: res.l_id, status: TLottoStatusEnum.OPEN }, axiosConfig)
                                //     } else if (res.status == TLottoStatusEnum.CLOSE && !getTomorrow(res.open, res.close) && !getTomorrow(res.open, t)) {
                                //         axios.put(`${import.meta.env.VITE_OPS_URL}/status/lotto`, { id: res.l_id, status: TLottoStatusEnum.OPEN }, axiosConfig)
                                //     }
                                // } else if (res.date_open?.includes(day[new Date(res.now).getUTCDay()]) && !res.date_open?.includes(day[new Date(res.now).getUTCDay() - 1]) && res.status == TLottoStatusEnum.CLOSE) {
                                //     axios.put(`${import.meta.env.VITE_OPS_URL}/status/lotto`, { id: res.l_id, status: TLottoStatusEnum.OPEN }, axiosConfig)
                                // } else if (!res.date_open?.includes(day[new Date(res.now).getUTCDay()]) && res.status == TLottoStatusEnum.OPEN) {
                                //     axios.put(`${import.meta.env.VITE_OPS_URL}/status/lotto`, { id: res.l_id, status: TLottoStatusEnum.CLOSE }, axiosConfig)
                                // }
                                if (res.status == TLottoStatusEnum.CLOSE) {

                                    if (res.date_open?.includes(day[new Date(res.now).getUTCDay() - 1 >= 0 ? new Date(res.now).getUTCDay() - 1 : 6])) {


                                        if (res.date_open?.includes(day[new Date(res.now).getUTCDay()]) && getTomorrow(res.open, res.close) && getTomorrow(res.open, t)) {
                                            axios.put(`${import.meta.env.VITE_OPS_URL}/status/lotto`, { id: res.l_id, status: TLottoStatusEnum.OPEN }, axiosConfig)
                                        } else if (res.date_open?.includes(day[new Date(res.now).getUTCDay()])) { // วันนี้มี
                                            axios.put(`${import.meta.env.VITE_OPS_URL}/status/lotto`, { id: res.l_id, status: TLottoStatusEnum.OPEN }, axiosConfig)
                                        } else if (!res.date_open?.includes(day[new Date(res.now).getUTCDay()]) && getTomorrow(res.open, res.close) && getTomorrow(res.open, t)) {
                                            axios.put(`${import.meta.env.VITE_OPS_URL}/status/lotto`, { id: res.l_id, status: TLottoStatusEnum.OPEN }, axiosConfig)
                                        }
                                    } else {

                                        if (!res.date_open?.includes(day[new Date(res.now).getUTCDay()]) && getTomorrow(res.open, res.close)) {

                                        } else if (res.date_open?.includes(day[new Date(res.now).getUTCDay()]) && !getTomorrow(res.open, res.close)) {
                                            axios.put(`${import.meta.env.VITE_OPS_URL}/status/lotto`, { id: res.l_id, status: TLottoStatusEnum.OPEN }, axiosConfig)
                                        } else if (res.date_open?.includes(day[new Date(res.now).getUTCDay()]) && getTomorrow(res.open, res.close)) {
                                            axios.put(`${import.meta.env.VITE_OPS_URL}/status/lotto`, { id: res.l_id, status: TLottoStatusEnum.OPEN }, axiosConfig)
                                        }
                                    }

                                } else {
                                    if (res.date_open?.includes(day[new Date(res.now).getUTCDay() - 1 >= 0 ? new Date(res.now).getUTCDay() - 1 : 6])) {
                                        if (!res.date_open?.includes(day[new Date(res.now).getUTCDay()]) && !getTomorrow(res.open, res.close)) {
                                            axios.put(`${import.meta.env.VITE_OPS_URL}/status/lotto`, { id: res.l_id, status: TLottoStatusEnum.CLOSE }, axiosConfig)
                                        } else if (!res.date_open?.includes(day[new Date(res.now).getUTCDay()]) && getTomorrow(res.open, res.close) && !getTomorrow(res.open, t)) {
                                            axios.put(`${import.meta.env.VITE_OPS_URL}/status/lotto`, { id: res.l_id, status: TLottoStatusEnum.CLOSE }, axiosConfig)
                                        }
                                    } else {
                                        if (!res.date_open?.includes(day[new Date(res.now).getUTCDay()]) && getTomorrow(res.open, res.close)) {
                                            axios.put(`${import.meta.env.VITE_OPS_URL}/status/lotto`, { id: res.l_id, status: TLottoStatusEnum.CLOSE }, axiosConfig)
                                        } else if (res.date_open?.includes(day[new Date(res.now).getUTCDay()]) && getTomorrow(res.open, res.close) && getTomorrow(res.open, t)) {
                                            axios.put(`${import.meta.env.VITE_OPS_URL}/status/lotto`, { id: res.l_id, status: TLottoStatusEnum.CLOSE }, axiosConfig)
                                        }
                                    }
                                }
                            } else if (cd.hours < 0) {
                                if (res.status == TLottoStatusEnum.OPEN) {
                                    axios.put(`${import.meta.env.VITE_OPS_URL}/status/lotto`, { id: res.l_id, status: TLottoStatusEnum.CLOSE }, axiosConfig)
                                }
                            }
                        }

                    })
                }
            }

            isLoading!.style.display = "none";
        } catch (error) {

        }
    }

    // const [image, setImage] = useState<ImageBase64[]>([]);
    // const fetchImage = async (lotto: ILottoMySQL, amount: number) => {
    //     try {
    //         const access_token = localStorage.getItem(import.meta.env.VITE_OPS_TOKEN);
    //         const axiosConfig: AxiosRequestConfig = { withCredentials: true, timeout: 10000, headers: { Authorization: `Bearer ${access_token}` } }
    //         const res = await axios.get(`${import.meta.env.VITE_OPS_URL}/get/file/${lotto.img_flag}`, {
    //             responseType: 'blob',
    //             withCredentials: axiosConfig.withCredentials,
    //             timeout: axiosConfig.timeout,
    //             headers: axiosConfig.headers
    //         })
    //         if (res && res.status == 200) {
    //             const reader = new FileReader();
    //             reader.readAsDataURL(res.data);
    //             reader.onloadend = function () {
    //                 const base64data = reader.result;
    //                 if (image.length < amount) {
    //                     setImage(prevArray => [...prevArray, { name: lotto.name, data: base64data!.toString() }])
    //                 }
    //             };
    //         }
    //     } catch (error) {

    //     }
    // }


    // const fetchAllImage = async (lotto: ILottoMySQL, amount: number) => {
    //     try {
    //         if (imageURL.length < amount) {
    //             setImageURL(prevArray => [...prevArray, { name: lotto.name, url: `${import.meta.env.VITE_OPS_URL}/images/${lotto.img_flag}` }])
    //         }
    //     } catch (error) {

    //     }
    // }

    let lottoTimes: Time[] = []
    const timer = (id: string, open: string, close: string, status: TLottoStatusEnum, amount: number, date_type: TLottoDateEnum, thai_this_times: string, thai_open_date: string, now: string) => {
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
                // clearInterval(interval)
                // if (status == TLottoStatusEnum.OPEN) {
                //     const access_token = localStorage.getItem(import.meta.env.VITE_OPS_TOKEN);
                //     const axiosConfig: AxiosRequestConfig = { withCredentials: true, timeout: 10000, headers: { Authorization: `Bearer ${access_token}` } }
                //     axios.put(`${import.meta.env.VITE_OPS_URL}/status/lotto`, { id: id, status: TLottoStatusEnum.CLOSE }, axiosConfig)
                // }
            }

            const days = status == TLottoStatusEnum.OPEN ? cd.days < 10 ? `0${cd.days.toString()}` : cd.days.toString() : "00"
            const hours = status == TLottoStatusEnum.OPEN ? cd.hours < 10 ? `0${cd.hours.toString()}` : cd.hours.toString() : "00"
            const minutes = status == TLottoStatusEnum.OPEN ? cd.minutes < 10 ? `0${cd.minutes.toString()}` : cd.minutes.toString() : "00"
            const seconds = status == TLottoStatusEnum.OPEN ? cd.seconds < 10 ? `0${cd.seconds.toString()}` : cd.seconds.toString() : "00"

            if (count >= amount) {
                count = 0
            }
            lottoTimes.push({
                id: id,
                days: days,
                hours: hours,
                minutes: minutes,
                seconds: seconds
            })
            if (count == amount - 1) {
                setTimes(lottoTimes)
                lottoTimes = []
            }
            count++
        }, 1000)

    }

    const mapLotto = (data: ILottoMySQL[]) => {
        if (data) {
            // fetchAllImage(data, data.length)
            data!.map((res) => {
                timer(res.l_id, res.open, res.close, res.status as TLottoStatusEnum, data.length, res.date_type as TLottoDateEnum, res.thai_this_times, res.thai_open_date!, res.now)
                // fetchImage(res, data.length)
                // fetchAllImage(res, data.length)
            })
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

    const previewImageURL = (lotto: ILottoMySQL) => {
        let img = ""
        imageURL.map((im) => {
            if (lotto.l_name! == im.name) img = im.url
        })
        return img
    }


    const display = () => {
        let hours = new Date().getHours().toString()
        let minutes = new Date().getMinutes().toString()
        if (parseInt(hours) < 10) {
            hours = `0${hours}`
        }
        if (parseInt(minutes) < 10) {
            minutes = `0${minutes}`
        }
        const t = `${hours}:${minutes}`
        // console.log(times);
        return group[0].map((g) => (
            <div className="contents" key={g}>
                <h2 className="block w-full">{g}</h2>
                {
                    lotto?.sort((a, b) => a.close > b.close ? 1 : -1).map((lot, index) => (
                        g == lot.groups ?
                            <Fragment key={index}>
                                <div className="p-2 xl:basis-1/5 lg:basis-1/4 basis-1/3">
                                    <Link to={lot.status == TLottoStatusEnum.OPEN ? `/bill/${lot.l_id}` : '#'} className={`flex flex-col items-center rounded-none shadow-md dark:border-gray-700 dark:bg-gray-800 ${lot.status == TLottoStatusEnum.OPEN ? `bg-green-600 text-white dark:bg-green-600 dark:text-white` : `bg-gray-300 text-dark dark:bg-gray-300 dark:text-dark`}`}>
                                        <div className="flex flex-row items-center p-2 w-full">
                                            <img style={{ height: 40 }} className="object-cover rounded-none" src={previewImageURL(lot)} alt={lot.l_name} />
                                            <div className="flex text-end w-full flex-col justify-between leading-normal">
                                                <h5 className="text-sm font-bold tracking-tight dark:text-dark">{lot.l_name}
                                                    <br />
                                                    {lot.status == TLottoStatusEnum.OPEN ? `เปิดรับ` : `ปิดรับ`}
                                                </h5>
                                            </div>
                                        </div>

                                        <hr className="w-full" />
                                        <div className="w-full text-xs px-2">
                                            <p className="flex justify-between w-full">
                                                <span className="font-light">เวลาปิด</span>
                                                <span className="font-light">{String(lot.close)}</span>
                                            </p>
                                            <p className="flex justify-between w-full">
                                                <span className="font-light">สถานะ</span>
                                                <span className="font-light">{lot.status == TLottoStatusEnum.OPEN ? lot.date_type == "THAI" ? `ปิดรับใน ${times[times.findIndex(t => t.id == lot.l_id)]?.days ?? "00"}:${times[times.findIndex(t => t.id == lot.l_id)]?.hours ?? "00"}:${times[times.findIndex(t => t.id == lot.l_id)]?.minutes ?? "00"}:${times[times.findIndex(t => t.id == lot.l_id)]?.seconds ?? "00"}` : `ปิดรับใน ${times[times.findIndex(t => t.id == lot.l_id)]?.hours ?? "00"}:${times[times.findIndex(t => t.id == lot.l_id)]?.minutes ?? "00"}:${times[times.findIndex(t => t.id == lot.l_id)]?.seconds ?? "00"}` : `-`}</span>
                                                {/* <span className="font-light">{(getCountdownTime(lot.open, lot.close, t) && (lot.date_open?.includes(day[dateNow.getDay()]) || (lot.date_open!.includes(day[dateNow.getDay() - 1]) && getTomorrow(lot.open, lot.close))) && lot.status == TLottoStatusEnum.OPEN) ? `ปิดรับใน ${times[index]?.hours ?? "00"}:${times[index]?.minutes ?? "00"}:${times[index]?.seconds ?? "00"}` : `-`}</span> */}
                                            </p>
                                        </div>
                                    </Link>
                                </div>
                            </Fragment>
                            :

                            lotto?.filter((lot) => (lot.groups == g)).length == 0 &&
                            index == 0 &&
                            <div key={index} className="w-full bg-red-200 border border-red-300 rounded font-light text-red-800 text-center p-1">
                                ไม่มีรายการหวย
                            </div>
                    ))
                }
            </div>
        ))


    }


    useEffect(() => {
        fetchLottoAll()
    }, [isUser])




    return (
        <>{
            isUser &&
            <div id="home" className="flex flex-row flex-wrap">
                {
                    display()
                }
            </div>
        }
        </>
    )
}

// `ปิดรับใน ${t.hours}:${t.minutes}:${t.seconds}` : '-'