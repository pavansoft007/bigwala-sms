import { useState, useEffect } from 'react';
import axiosInstance from "@/services/axiosInstance.ts";

interface Photo {
    filename: string;
}

type Photos = Record<string, Record<string, Photo[]>>;

const GalleryManager: React.FC = () => {
    const [photos, setPhotos] = useState<Photos>({});
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [eventName, setEventName] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

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

        if (selectedFiles.length === 0 || !eventName) {
            alert('Please provide an event name and at least one file to upload.');
            return;
        }

        const formData = new FormData();
        selectedFiles.forEach((file) => {
            formData.append('photos', file); // Use the same field name as in your backend
        });
        formData.append('event_name', eventName);

        setLoading(true);

        try {
            await axiosInstance.post('/mobileAPI/gallery', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            alert('Photos uploaded successfully!');
            setSelectedFiles([]);
            setEventName('');
            await fetchGalleryImages();
        } catch (error) {
            console.error('Error uploading photos:', error);
            alert('Failed to upload photos. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderGallery = () => {
        return Object.entries(photos).map(([date, events]) => (
            <div key={date} className="mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">{date}</h3>
                {Object.entries(events).map(([eventName, images]) => (
                    <div key={eventName} className="mb-4">
                        <h4 className="text-lg font-semibold text-blue-600 mb-2">{eventName}</h4>
                        <div className="flex flex-wrap gap-4">
                            {images.map((image, index) => (
                                <img
                                    key={index}
                                    src={`${import.meta.env.VITE_API_URL}/staticFiles/photos/${image.filename}`}
                                    alt="Gallery"
                                    className="w-36 h-36 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        ));
    };

    return (
        <div className="p-6 min-h-screen">
            <h1 className="text-3xl font-extrabold mb-6 text-center">Gallery Manager</h1>

            <form
                onSubmit={handleUpload}
                className="bg-white rounded-lg p-6 shadow-lg mb-8 max-w-lg mx-auto"
            >
                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">Event Name:</label>
                    <input
                        type="text"
                        value={eventName}
                        onChange={(e) => setEventName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                        placeholder="Enter event name"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">Upload Photos:</label>
                    <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="w-full text-gray-600"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2 px-4 rounded-lg text-white font-semibold ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 transition-colors duration-300'}`}
                >
                    {loading ? 'Uploading...' : 'Upload Photos'}
                </button>
            </form>

            <div className="bg-white rounded-lg p-6 shadow-lg" >
                {renderGallery()}
            </div>
        </div>
    );
};

export default GalleryManager;
