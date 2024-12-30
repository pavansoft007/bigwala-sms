import {Link} from 'react-router-dom';
function Home() {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
            <header className="w-full bg-blue-500 text-white py-6 shadow-lg">
                <div className="container mx-auto flex justify-between items-center px-4">
                    <h1 className="text-2xl font-bold">School Admin Dashboard</h1>
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
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all">
                    Register Your School
                </button>
            </section>

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
                                <li>Email: <a href="mailto:support@schooladmin.com" className="text-blue-600 hover:underline">support@schooladmin.com</a></li>
                                <li>Phone: <a href="tel:+123456789" className="text-blue-600 hover:underline">+1 234 567 89</a></li>
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
                    <p>&copy; 2024 School Admin App. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}

export default Home;
