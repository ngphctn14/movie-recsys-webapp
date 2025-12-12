import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Header({ onSearch }) {
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className='p-4 bg-black flex items-center justify-between fixed top-0 left-0 right-0 z-50 shadow-md'>
      <div className='flex items-center space-x-8'>
        <Link to="/">
            <h1 className='text-[30px] uppercase font-bold text-red-700 cursor-pointer'>
                Movie
            </h1>
        </Link>
        <nav className='flex items-center space-x-6'>
          <Link to="/" className='text-gray-300 hover:text-white transition'>
            Home
          </Link>
          <Link to="/about" className='text-gray-300 hover:text-white transition'>
            About
          </Link>
          <Link to="/contact" className='text-gray-300 hover:text-white transition'>
            Contact
          </Link>
        </nav>
      </div>

      <div className='flex items-center space-x-6'>
        <div className='flex items-center bg-white rounded overflow-hidden'>
            <input
            type='text'
            placeholder='Search movies...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='p-2 text-black bg-white outline-none w-48 lg:w-64'
            />
            <button
            className='p-2 text-white bg-red-600 hover:bg-red-700 transition px-4'
            onClick={() => onSearch(searchTerm)}
            >
            Search
            </button>
        </div>

        {/* Auth Section */}
        {user ? (
            <div className='flex items-center space-x-4'>
                <span className='text-white hidden md:block'>
                    Hello, {user.fullName}
                </span>
                <button
                    onClick={handleLogout}
                    className='text-white bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded transition'
                >
                    Logout
                </button>
            </div>
        ) : (
            <div className='flex items-center space-x-4'>
                <Link to="/login" className='text-white hover:text-red-500 transition font-medium'>
                    Login
                </Link>
                <Link to="/signup" className='bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition'>
                    Sign Up
                </Link>
            </div>
        )}
      </div>
    </header>
  );
}

Header.propTypes = {
  onSearch: PropTypes.func,
};

export default Header;