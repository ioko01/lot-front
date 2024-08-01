
import { Modal, stateModal } from "../../redux/features/modal/modalSlice";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";


export function ModalNotice() {
    const dispatch = useAppDispatch()
    const modal = useAppSelector(state => state.modal)
    // const navigate = useNavigate()

    const returnToHome = () => {
        const isTypeModal: Modal[] = ["ADDBILLFALSE", "NO_CREDIT"]
        dispatch(stateModal({ show: false, openModal: modal.openModal }))
        if (!isTypeModal.includes(modal.openModal)) {
            const id = location.pathname.split("/")[3]
            window.location.href = "/bill/" + id
        }
    }

    return (
        <>
            {modal.show ? (
                <>
                    <div className="overlay-timeout">
                        <div className="fixed inset-0 z-10 overflow-y-auto">
                            <div className="fixed inset-0 w-full h-full bg-black opacity-40" ></div>
                            <div className="flex items-center min-h-screen px-4 py-8">
                                <div style={{ width: "300px" }} className="relative max-w-lg p-4 mx-auto bg-white shadow-lg">
                                    <div className="mt-3">
                                        <div className="w-full text-lg">
                                            แจ้งเตือน
                                        </div>
                                        <div className="mt-2 text-center w-full">
                                            <h4 className="text-lg font-medium text-gray-800">
                                                {modal.openModal == "TIMEOUT" && "หมดเวลาแล้ว"}
                                                {modal.openModal == "ADDBILLTRUE" && "เพิ่มบิลสำเร็จ"}
                                                {modal.openModal == "ADDBILLFALSE" && "ผิดพลาด"}
                                                {modal.openModal == "NO_CREDIT" && "ยอดเงินไม่พอ"}
                                                {modal.openModal == "SUCCESS" && "สำเร็จ"}
                                                {modal.openModal == "DIGITS_CLOSE" && "มีเลขปิดรับ - จ่ายครึ่ง กรุณาเช็คบิล"}
                                                {modal.openModal == "DIGITS_SEMI" && "มีเลขปิดรับ - จ่ายครึ่ง กรุณาเช็คบิล"}
                                            </h4>
                                            <div className="text-right mt-3">
                                                {
                                                    modal.openModal != "SUCCESS" ?
                                                        modal.openModal == "DIGITS_CLOSE" || modal.openModal == "DIGITS_SEMI" ?
                                                            <button
                                                                className="mt-2 p-2 px-5 flex-1 text-gray-800 outline-none border ring-offset-2 ring-indigo-600 focus:ring-2"
                                                                onClick={() => dispatch(stateModal({ show: false, openModal: modal.openModal }))}
                                                            >
                                                                ปิด
                                                            </button>
                                                            :
                                                            <button
                                                                className="mt-2 p-2 px-5 flex-1 text-gray-800 outline-none border ring-offset-2 ring-indigo-600 focus:ring-2"
                                                                onClick={returnToHome}
                                                            >
                                                                ปิด
                                                            </button>
                                                        :
                                                        <button
                                                            className="mt-2 p-2 px-5 flex-1 text-gray-800 outline-none border ring-offset-2 ring-indigo-600 focus:ring-2"
                                                            onClick={() => dispatch(stateModal({ show: false, openModal: modal.openModal }))}
                                                        >
                                                            ปิด
                                                        </button>

                                                }

                                            </div>
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