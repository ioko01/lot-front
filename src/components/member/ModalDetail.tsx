import { stateModal } from "../../redux/features/modal/modalSlice";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";

export function ModalDetail() {
    const dispatch = useAppDispatch()
    const modal = useAppSelector(state => state.modal)
    return (
        <>
            {modal.show ? (
                <>
                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div
                            className="fixed inset-0 w-full h-full bg-black opacity-40"
                            onClick={() => dispatch(stateModal({ show: false, openModal: "DETAIL" }))}
                        ></div>
                        <div className="flex items-center min-h-screen px-4 py-8">
                            <div className="relative w-full max-w-lg p-4 mx-auto bg-white shadow-lg">
                                <div className="text-right">
                                    <button onClick={() => dispatch(stateModal({ show: false, openModal: "DETAIL" }))} className="text-xs text-gray-400 hover:text-gray-300 font-bold p-2 rounded shadow mx-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                    <table className="border-collapse border border-slate-400 w-full text-center text-xs">
                                        <caption className="text-lg text-left font-bold text-gray-800">
                                            รายละเอียดการแทง
                                        </caption>
                                        <thead className="bg-blue-800 text-white">
                                            <tr>
                                                <th>ประเภท</th>
                                                <th>หมายเลข</th>
                                                <th>ยอดเดิมพัน</th>
                                                <th>เรทจ่าย</th>
                                                <th>ส่วนลด</th>
                                                <th>รวม</th>
                                                <th>แพ้/ชนะ</th>
                                                <th>ได้เสีย</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="border border-slate-300 font-light">2 ตัวบน</td>
                                                <td className="border border-slate-300 font-light">22</td>
                                                <td className="border border-slate-300 font-light">5.00</td>
                                                <td className="border border-slate-300 font-light">95.00</td>
                                                <td className="border border-slate-300 font-light">0.00</td>
                                                <td className="border border-slate-300 font-light">5.00</td>
                                                <td className="border border-slate-300 text-green-600">รอผล</td>
                                                <td className="border border-slate-300 text-red-600">0.00</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : null}
        </>
    );
}