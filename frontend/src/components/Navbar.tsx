import axiosInstance from '@/services/axiosInstance';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

type NavDetails={
    name:string,
    admin_name:string
}

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState<string>('User'); 
  const [timeOfDayGreeting, setTimeOfDayGreeting] = useState<string>('');
  const navigate = useNavigate();

  async function getUserINFO(){
    const data:NavDetails=await axiosInstance.get('/api/navbar');
    console.log(data);       
  };
  

  useEffect(() => {
    getUserINFO();
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      setTimeOfDayGreeting('Good Morning');
    } else if (currentHour < 18) {
      setTimeOfDayGreeting('Good Afternoon');
    } else {
      setTimeOfDayGreeting('Good Evening');
    }



  }, []);

  
  const handleLogout = () => {
    navigate('/logout');
  };

  
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div className="w-full bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          <div className="flex-shrink-0">
            <h1 className=" font-bold text-2xl"></h1>
          </div>

          
          <div className="hidden md:flex items-center space-x-4">
            <span className="font-semibold">{timeOfDayGreeting}, {userName}!</span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700  px-4 py-2 rounded-md"
            >
              Logout
            </button>
          </div>

          
          <div className="md:hidden flex items-center">
            <button onClick={toggleMobileMenu} className="text-white focus:outline-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      
      {isMobileMenuOpen && (
        <div className="md:hidden bg-indigo-600 text-white">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium hover:text-indigo-200">Home</Link>
            <Link to="/menu" className="block px-3 py-2 rounded-md text-base font-medium hover:text-indigo-200">Menu</Link>
            <Link to="/order" className="block px-3 py-2 rounded-md text-base font-medium hover:text-indigo-200">Order</Link>
            <Link to="/contact" className="block px-3 py-2 rounded-md text-base font-medium hover:text-indigo-200">Contact</Link>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium bg-red-600 hover:bg-red-700 text-white"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
