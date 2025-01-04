import { useState, useEffect } from 'react';
import axiosInstance from "@/services/axiosInstance";

interface Message{
    message_id:number,
    student_id?:number,
    classroom_id?:number,
    text_message?:string,
    message_type:string,
    voice_location?:string,
    added_by:string,
    added_member_id:number,
    type:string
}

const AdminMessageBoard = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [filter, setFilter] = useState({ classroom_id: '', student_id: ''});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchMessages('fetchAll').then(()=>console.log('called the messages'));
    }, []);

    const fetchMessages = async (type:string='') => {
        setLoading(true);
        setError('');

        try {
            const response = await axiosInstance.post('/mobileAPI/getMessages', {
                ...filter,
                type
            });
            setMessages(response.data);
        } catch (err:unknown) {
            console.error('error in getting data:',err);
            setError('Failed to fetch messages. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilter({ ...filter, [name]: value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchMessages();
    };

    return (
        <div className="admin-message-board p-6 bg-white rounded-xl min-h-screen">
            <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
                Admin Message Board
            </h1>

            <form
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded-lg shadow-md grid grid-cols-4 gap-4"
            >
                <div className="flex flex-col">
                    <label htmlFor="classroom_id" className="text-gray-700 font-medium">
                        Classroom ID:
                    </label>
                    <input
                        type="text"
                        id="classroom_id"
                        name="classroom_id"
                        value={filter.classroom_id}
                        onChange={handleInputChange}
                        className="mt-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                    />
                </div>

                <div className="flex flex-col">
                    <label htmlFor="student_id" className="text-gray-700 font-medium">
                        Student ID:
                    </label>
                    <input
                        type="text"
                        id="student_id"
                        name="student_id"
                        value={filter.student_id}
                        onChange={handleInputChange}
                        className="mt-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                    />
                </div>

                <div className="flex items-end ">
                    <button
                        type="submit"
                        className="py-2 px-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200"
                    >
                        Fetch Messages
                    </button>
                    <button
                        type="button"
                        onClick={()=>{
                            setFilter({ classroom_id: '', student_id: ''})
                            fetchMessages('fetchAll').then(()=>console.log('called the messages'));
                        }}
                        className="py-2 px-2 mx-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition duration-200"
                    >
                        Clear
                    </button>
                </div>
            </form>

            {loading && (
                <p className="text-center text-gray-500 mt-6 animate-pulse">Loading messages...</p>
            )}
            {error && (
                <p className="text-center text-red-500 mt-6 font-medium">{error}</p>
            )}

            <div className="messages-list mt-8 grid grid-cols-3 gap-4">
            {messages.map((message) => (
                    <div
                        key={message.message_id}
                        className="message-item bg-white p-4 rounded-lg shadow-md"
                    >
                        <p className="text-gray-700">
                            <strong className="font-semibold text-gray-900">Type:</strong> {message.message_type}
                        </p>
                        {message.message_type === 'text' ? (
                            <p className="text-gray-700">
                                <strong className="font-semibold text-gray-900">Message:</strong> {message.text_message}
                            </p>
                        ) : (
                            <audio controls className="mt-2 w-full">
                                <source
                                    src={`${import.meta.env.VITE_API_URL}/staticFiles/voiceMessage/${message.voice_location}`}
                                    type="audio/mpeg"
                                />
                                Your browser does not support the audio element.
                            </audio>
                        )}
                        <p className="text-gray-700">
                            <strong className="font-semibold text-gray-900">Added By:</strong> {message.added_by}
                        </p>
                        <p className="text-gray-700">
                            <strong className="font-semibold text-gray-900">Classroom ID:</strong>{' '}
                            {message.classroom_id || 'N/A'}
                        </p>
                        <p className="text-gray-700">
                            <strong className="font-semibold text-gray-900">Student ID:</strong>{' '}
                            {message.student_id || 'N/A'}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminMessageBoard;
