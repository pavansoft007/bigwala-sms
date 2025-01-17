// src/pages/BannerManagement.tsx
import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axiosInstance from "@/services/axiosInstance";


const BannerManagement = () => {
    const [images, setImages] = useState<string[]>([]);
    const [fileInput, setFileInput] = useState<FileList | null>(null);

    useEffect(() => {
        fetchBannerImages();
    }, []);

    const fetchBannerImages = async () => {
        try {
            const response = await axiosInstance.get<string[]>('/mobileAPI/bannerImages');
            setImages(response.data);
        } catch (error) {
            console.error('Error fetching banner images:', error);
        }
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        setFileInput(event.target.files);
    };

    const uploadBanners = async (e: FormEvent) => {
        e.preventDefault();
        if (!fileInput) {
            alert('Please select files first.');
            return;
        }
        const formData = new FormData();
        Array.from(fileInput).forEach((file) => formData.append('photos', file));

        try {
            const response = await axiosInstance.post('/api/bannerImage', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            alert(response.data.message);
            fetchBannerImages();
        } catch (error) {
            console.error('Error uploading banners:', error);
        }
    };

    const getBannerImageUrl = (encryptedId: string) =>
        `${import.meta.env.VITE_API_URL}/staticFiles/bannerImages/${encryptedId}`;

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6 text-center">Banner Management</h1>

            <form onSubmit={uploadBanners} className="flex flex-col items-center gap-4 mb-6">
                <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                />
                <button
                    type="submit"
                    className="px-6 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:ring-4 focus:ring-blue-300"
                >
                    Upload
                </button>
            </form>

            <div className="image-list">
                <h2 className="text-xl font-semibold mb-4">Uploaded Banners</h2>
                {images.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {images.map((encryptedId, index) => (
                            <div key={index} className="flex flex-col items-center">
                                <img
                                    src={getBannerImageUrl(encryptedId)}
                                    alt={`Banner ${index + 1}`}
                                    className="w-48 h-auto rounded shadow-md mb-2"
                                />
                                <p className="text-sm text-gray-600">Banner {index + 1}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center">No banners uploaded yet.</p>
                )}
            </div>
        </div>
    );
};

export default BannerManagement;
