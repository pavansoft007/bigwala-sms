import { useState, useEffect } from 'react';
import axiosInstance from "@/services/axiosInstance.ts";
import Modal from "@/components/Modal.tsx";
import { GrAdd } from "react-icons/gr";
import { FaTrash } from "react-icons/fa";

interface Photo {
    filename: string;
}

type Photos = Record<string, Record<string, Photo[]>>;

const GalleryManager: React.FC = () => {
    const [photos, setPhotos] = useState<Photos>({});
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [eventName, setEventName] = useState<string>('');
    const [selectedEvent, setSelectedEvent] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [popUP, setPOPUP] = useState<boolean>(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    useEffect(() => {
        fetchGalleryImages();
    }, []);

    const fetchGalleryImages = async () => {
        try {
            const response = await axiosInstance.get<Photos>('/mobileAPI/gallery');
            setPhotos(response.data);
        } catch (error) {
            console.error('Error fetching gallery images:', error);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setSelectedFiles(Array.from(event.target.files));
        }
    };

    const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (selectedFiles.length === 0 || (!eventName && !selectedEvent)) {
            alert('Please select an existing event or create a new one.');
            return;
        }

        const formData = new FormData();
        selectedFiles.forEach((file) => {
            formData.append('photos', file);
        });
        formData.append('event_name', selectedEvent || eventName);

        setLoading(true);

        try {
            await axiosInstance.post('/mobileAPI/gallery', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            alert('Photos uploaded successfully!');
            setSelectedFiles([]);
            setEventName('');
            setSelectedEvent('');
            fetchGalleryImages();
        } catch (error) {
            console.error('Error uploading photos:', error);
            alert('Failed to upload photos.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePhoto = async (filename: string) => {
        try {
            await axiosInstance.delete(`/mobileAPI/gallery/${filename}`);
            alert('Photo deleted successfully!');
            fetchGalleryImages();
        } catch (error) {
            console.error('Error deleting photo:', error);
            alert('Failed to delete photo.');
        }
    };

    const renderGallery = () => {
        return Object.entries(photos).map(([date, events]) => (
            <div key={date} className="mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">{date}</h3>
                {Object.entries(events).map(([event, images]) => (
                    <div key={event} className="mb-4">
                        <h4 className="text-lg font-semibold text-blue-600 mb-2">{event}</h4>
                        <div className="flex flex-wrap gap-4">
                            {images.map((image, index) => (
                                <div key={index} className="relative group">
                                    <img
                                        src={`${import.meta.env.VITE_API_URL}/staticFiles/photos/${image.filename}`}
                                        alt="Gallery"
                                        className="w-36 h-36 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                                        onClick={() => setPreviewImage(`${import.meta.env.VITE_API_URL}/staticFiles/photos/${image.filename}`)}
                                    />
                                    <button
                                        className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                        onClick={() => handleDeletePhoto(image.filename)}
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        ));
    };

    return (
        <div className="p-6 min-h-screen">
            <div className="flex justify-between mb-6">
                <h1 className="text-3xl font-extrabold">Gallery Manager</h1>
                <button onClick={() => setPOPUP(true)} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                    <GrAdd /> Upload Photos
                </button>
            </div>

            <Modal isOpen={popUP} onClose={() => setPOPUP(false)} title='Upload Photos'>
                <form onSubmit={handleUpload} className="bg-white p-6 rounded-lg shadow-lg">
                    <label className="block text-gray-700 font-medium mb-2">Choose Event:</label>
                    <select
                        className="w-full p-2 border rounded-lg mb-4"
                        value={selectedEvent}
                        onChange={(e) => setSelectedEvent(e.target.value)}
                    >
                        <option value="">Select an event...</option>
                        {Object.keys(photos).map((date) =>
                            Object.keys(photos[date]).map((event) => (
                                <option key={event} value={event}>{event}</option>
                            ))
                        )}
                    </select>
                    <input
                        type="text"
                        value={eventName}
                        onChange={(e) => setEventName(e.target.value)}
                        placeholder="Or enter new event name"
                        className="w-full p-2 border rounded-lg mb-4"
                    />
                    <input type="file" multiple onChange={handleFileChange} className="mb-4" />
                    <button type="submit" className="w-full bg-green-500 text-white p-2 rounded-lg hover:bg-green-600">
                        {loading ? 'Uploading...' : 'Upload'}
                    </button>
                </form>
            </Modal>

            <Modal isOpen={!!previewImage} onClose={() => setPreviewImage(null)} title="" >
                {previewImage && <img src={previewImage} alt="preview image" className="w-full h-auto" />}
            </Modal>

            <div className="bg-white p-6 rounded-lg shadow-lg">{renderGallery()}</div>
        </div>
    );
};

export default GalleryManager;