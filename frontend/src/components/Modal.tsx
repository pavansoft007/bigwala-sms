import { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    disableClose?: boolean;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, disableClose = false }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black opacity-50"
                // onClick={onClose}
            ></div>

            {/* Modal Container */}
            <div className="relative w-auto max-w-3xl mx-auto my-6">
                <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none">
                    {/* Modal Header */}
                    <div className="flex items-start justify-between p-5 border-b border-solid rounded-t border-blueGray-200">
                        <h3 className="text-2xl font-semibold">{title}</h3>
                        {!disableClose && (
                            <button
                                className="float-right p-1 ml-auto text-black bg-transparent border-0 text-3xl leading-none font-semibold outline-none focus:outline-none"
                                onClick={onClose}
                            >
                                <X className="w-6 h-6 text-gray-500 hover:text-gray-700" />
                            </button>
                        )}
                    </div>

                    {/* Modal Body */}
                    <div className="relative flex-auto p-6">
                        {children}
                    </div>

                    {/* Modal Footer (Optional) */}
                    {!disableClose && (
                        <div className="flex items-center justify-end p-6 border-t border-solid rounded-b border-blueGray-200">
                            <button
                                className="px-6 py-2 mb-1 mr-1 text-sm font-bold text-red-500 uppercase outline-none background-transparent focus:outline-none"
                                type="button"
                                onClick={onClose}
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Modal;
