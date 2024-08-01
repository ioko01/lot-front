import axios, { AxiosRequestConfig } from "axios";
import { stateModal } from "../../redux/features/modal/modalSlice";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { IBillMySQL } from "../../models/Bill";

interface Id {
    billId?: IBillMySQL
}

export function ModalDelete({ billId }: Id) {
    const dispatch = useAppDispatch()
    const modal = useAppSelector(state => state.modal)

    const confirmDelete = async () => {
        if (billId) {
            const access_token = localStorage.getItem(import.meta.env.VITE_OPS_TOKEN);
            const axiosConfig: AxiosRequestConfig = { withCredentials: true, timeout: 10000, headers: { Authorization: `Bearer ${access_token}` } }
            await axios.put(`${import.meta.env.VITE_OPS_URL}/delete/bill`, billId, axiosConfig)
        }

        dispatch(stateModal({ show: false, openModal: "DELETE" }))
    }

    return (
        <>
            {modal.show && modal.openModal == "DELETE" ? (
                <>
                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div
                            className="fixed inset-0 w-full h-full bg-black opacity-40"
                            onClick={() => dispatch(stateModal({ show: false, openModal: "DELETE" }))}
                        ></div>
                        <div className="flex items-center min-h-screen px-4 py-8">
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
                </>
            ) : null}
        </>
    );
}