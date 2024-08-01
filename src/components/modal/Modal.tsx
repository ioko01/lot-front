import { Fragment, useRef } from "react";
import { stateModal } from "../../redux/features/modal/modalSlice";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { Dialog, Transition } from '@headlessui/react'

interface Props {
    children: JSX.Element
}

export function Modal({ children }: Props) {
    const dispatch = useAppDispatch()
    const modal = useAppSelector(state => state.modal)
    const cancelButtonRef = useRef(null)
    return (
        <>
            {
                modal.openModal == "CONFIG" && <Transition.Root show={modal.show} as={Fragment}>
                    <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={() => dispatch(stateModal({ show: false, openModal: "CONFIG" }))}>
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                        </Transition.Child>

                        <div className="fixed inset-0 z-10 overflow-y-auto">
                            <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-out duration-300"
                                    enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                    enterTo="opacity-100 translate-y-0 sm:scale-100"
                                    leave="ease-in duration-200"
                                    leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                    leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                >
                                    <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all my-8 w-full max-w-lg">
                                        {children}
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </Dialog>
                </Transition.Root>
            }
        </>
    );
}