import {Link} from 'react-router-dom';
import {useState} from "react";
import axiosInstance from "@/services/axiosInstance.ts";

function Home() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        school_name: '',
        location: '',
        admin_name: '',
        phone_number: ''
    });

    // Handle input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Submit form data
    const submitRegistration = async () => {
        try {
            const response=await axiosInstance.post('/api/interested_school',formData)

            if (response.status === 200) {
                alert('School registered successfully!');
                setIsModalOpen(false);
                setFormData({ school_name: '', location: '', admin_name: '', phone_number: '' });
            } else {
                alert('Failed to register school. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Something went wrong.');
        }
    };
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
            <header className="w-full bg-blue-500 text-white py-6 shadow-lg">
                <div className="container mx-auto flex justify-between items-center px-4">
                    <h1 className="text-2xl font-bold">Bigwala school Management system</h1>
                    <nav>
                        <ul className="flex space-x-6">
                            <li>
                                <a href="#" className="hover:text-gray-200">Home</a>
                            </li>
                            <li>
                                <a href="#features" className="hover:text-gray-200">Features</a>
                            </li>
                            <li>
                                <a href="#contact" className="hover:text-gray-200">Contact</a>
                            </li>
                            <li>
                                <Link to="login" className="hover:text-gray-200">Login</Link>
                            </li>
                        </ul>
                    </nav>
                </div>
            </header>

            {/* Welcome Section */}
            <section className="container mx-auto text-center py-16 px-4">
                <h2 className="text-4xl font-extrabold text-gray-800 mb-6">
                    Welcome to the School Admin Portal
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                    Manage your school seamlessly with our all-in-one admin application.
                    Register your school, handle administration, and stay connected easily.
                </p>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all"
                >
                    Register Your School
                </button>
            </section>

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-bold mb-4">Register Your School</h2>
                        <input
                            type="text"
                            name="school_name"
                            placeholder="School Name"
                            value={formData.school_name}
                            onChange={handleChange}
                            className="w-full p-2 mb-3 border border-gray-300 rounded-lg"
                        />
                        <input
                            type="text"
                            name="location"
                            placeholder="Location"
                            value={formData.location}
                            onChange={handleChange}
                            className="w-full p-2 mb-3 border border-gray-300 rounded-lg"
                        />
                        <input
                            type="text"
                            name="admin_name"
                            placeholder="Your Name"
                            value={formData.admin_name}
                            onChange={handleChange}
                            className="w-full p-2 mb-3 border border-gray-300 rounded-lg"
                        />
                        <input
                            type="tel"
                            name="phone_number"
                            placeholder="Phone Number"
                            value={formData.phone_number}
                            onChange={handleChange}
                            className="w-full p-2 mb-3 border border-gray-300 rounded-lg"
                        />
                        <button
                            onClick={submitRegistration}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all"
                        >
                            Submit
                        </button>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="w-full mt-2 bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded-lg shadow-lg transition-all"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Features Section */}
            <section id="features" className="bg-white py-16 w-full">
                <div className="container mx-auto px-4">
                    <h3 className="text-3xl font-bold text-gray-800 text-center mb-12">
                        Key Features
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-6 bg-gray-50 rounded-lg shadow">
                            <h4 className="text-xl font-semibold text-blue-600 mb-2">
                                Full School Management
                            </h4>
                            <p className="text-gray-600">
                                Organize and oversee student, teacher, and staff information effectively.
                            </p>
                        </div>
                        <div className="p-6 bg-gray-50 rounded-lg shadow">
                            <h4 className="text-xl font-semibold text-blue-600 mb-2">
                                Communication Tools
                            </h4>
                            <p className="text-gray-600">
                                Email or call to stay in touch with parents, students, and staff easily.
                            </p>
                        </div>
                        <div className="p-6 bg-gray-50 rounded-lg shadow">
                            <h4 className="text-xl font-semibold text-blue-600 mb-2">
                                Custom Reports
                            </h4>
                            <p className="text-gray-600">
                                Generate detailed reports to keep track of your school's performance.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="bg-gray-100 py-16 w-full">
                <div className="container mx-auto px-4">
                    <h3 className="text-3xl font-bold text-gray-800 text-center mb-12">
                        Get in Touch
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-6">
                            <h4 className="text-xl font-semibold text-blue-600 mb-2">Contact Us</h4>
                            <p className="text-gray-600 mb-4">
                                We're here to help you register your school and get started. Reach out to us!
                            </p>
                            <ul className="text-gray-600">
                                <li>Email: <a href="mailto:support@bigwalatechnology.com"
                                              className="text-blue-600 hover:underline">support@bigwalatechnology.com</a>
                                </li>
                                <li>Phone: <a href="tel:+918931912345" className="text-blue-600 hover:underline">+91
                                    8931912345</a></li>
                            </ul>
                        </div>
                        <form className="p-6 bg-white rounded-lg shadow">
                            <h4 className="text-xl font-semibold text-gray-800 mb-4">Send Us a Message</h4>
                            <input
                                type="text"
                                placeholder="Your Name"
                                className="w-full p-3 mb-4 border border-gray-300 rounded-lg"
                            />
                            <input
                                type="email"
                                placeholder="Your Email"
                                className="w-full p-3 mb-4 border border-gray-300 rounded-lg"
                            />
                            <textarea
                                placeholder="Your Message"
                                className="w-full p-3 mb-4 border border-gray-300 rounded-lg"
                                rows={4}
                            ></textarea>
                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all"
                            >
                                Submit
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="w-full bg-blue-600 text-white py-4">
                <div className="container mx-auto text-center">
                    <p>&copy; 2025 Bigwala school management system. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}

export default Home;
