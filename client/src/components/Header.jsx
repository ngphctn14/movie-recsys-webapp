import { useState } from 'react';
import PropTypes from 'prop-types';

function Header({ onSearch }) {
  return (
    <header className='p-4 bg-black flex items-center justify-between fixed top-0 left-0 right-0 z-9999'>
      <div className='flex items-center space-x-4'>
        <h1 className='text-[30px] uppercase font-bold text-red-700'>Movie</h1>
        <nav className='flex items-center space-x-4'>
          <a href='#' className='text-white'>
            Home
          </a>
          <a href='#' className='text-white'>
            About
          </a>
          <a href='#' className='text-white'>
            Contact
          </a>
        </nav>
      </div>
      <div className='flex items-center space-x-4'>
        <input
          type='text'
          placeholder='Search'
          className='p-4 text-black bg-white'
        />
        <button
          className='p-2 text-white bg-red-600'
          onClick={() => onSearch('hit')}
        >
          Search
        </button>
      </div>
    </header>
  );
}

Header.propTypes = {
  onSearch: PropTypes.func,
};

export default Header;
