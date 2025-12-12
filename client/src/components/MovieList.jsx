import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import Modal from 'react-modal';
import YouTube from 'react-youtube';
import axiosClient from '../api/axiosClient';

// Fallback for image URL if env var is missing
const IMG_URL = import.meta.env?.VITE_IMG_URL || 'https://image.tmdb.org/t/p/w500';

const opts = {
  height: '390',
  width: '640',
  playerVars: {
    autoplay: 1,
  },
};

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#000',
    border: '1px solid #333',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    zIndex: 1000,
  },
};

const responsive = {
  superLargeDesktop: {
    breakpoint: { max: 4000, min: 3000 },
    items: 10,
  },
  desktop: {
    breakpoint: { max: 3000, min: 1200 },
    items: 7,
  },
  tablet: {
    breakpoint: { max: 1200, min: 600 },
    items: 3,
  },
  mobile: {
    breakpoint: { max: 600, min: 0 },
    items: 1,
  },
};

const MovieList = ({ title, data }) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [trailerKey, setTrailerKey] = useState('');

  const handleTrailer = async (movieId) => {
    setTrailerKey('');
    setModalIsOpen(true);

    try {
      // Fetch details from YOUR backend (Schema: _id, trailerUrl, etc.)
      const movieData = await axiosClient.get(`/movies/${movieId}`);

      // Parse the YouTube URL stored in your DB (e.g., "https://www.youtube.com/watch?v=VIDEO_ID")
      if (movieData && movieData.trailerUrl) {
        try {
          const url = new URL(movieData.trailerUrl);
          const videoId = url.searchParams.get('v');
          
          if (videoId) {
            setTrailerKey(videoId);
          } else {
            setModalIsOpen(false);
            alert('Trailer link không hợp lệ.');
          }
        } catch (e) {
          console.error('Error parsing trailer URL:', e);
          setModalIsOpen(false);
        }
      } else {
        setModalIsOpen(false);
        alert('Phim này chưa có trailer trong cơ sở dữ liệu!');
      }
    } catch (error) {
      setModalIsOpen(false);
      console.error('Error fetching trailer:', error);
    }
  };

  return (
    <div className='text-white p-10 mb-10'>
      <h2 className='uppercase text-xl font-bold mb-4'>{title}</h2>
      
      <Carousel responsive={responsive} className='flex items-center space-x-4'>
        {data && data.length > 0 &&
          data.map((item) => (
            <div
              // Schema uses _id for MongoDB documents
              key={item._id}
              className='w-[200px] h-[300px] relative group'
              onClick={() => handleTrailer(item._id)}
            >
              <div className='w-full h-full group-hover:scale-105 transition-transform duration-300 ease-in-out cursor-pointer'>
                <div className='absolute top-0 left-0 w-full h-full bg-black/40 group-hover:bg-black/20 transition-colors' />
                {/* Schema uses posterPath (camelCase) */}
                <img
                  src={
                    item.posterPath
                      ? (item.posterPath.startsWith('http') ? item.posterPath : `${IMG_URL}${item.posterPath}`)
                      : 'https://via.placeholder.com/200x300?text=No+Image'
                  }
                  alt={item.title}
                  className='w-full h-full object-cover rounded-lg'
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/200x300?text=No+Image'; }}
                />
                <div className='absolute bottom-4 left-2 p-2'>
                  <p className='uppercase text-md font-semibold drop-shadow-md'>
                    {/* Schema uses title and originalTitle */}
                    {item.title || item.originalTitle}
                  </p>
                </div>
              </div>
            </div>
          ))}
      </Carousel>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        style={customStyles}
        contentLabel='Trailer Modal'
        ariaHideApp={false}
      >
        <YouTube videoId={trailerKey} opts={opts} />
      </Modal>
    </div>
  );
};

MovieList.propTypes = {
  title: PropTypes.string.isRequired,
  data: PropTypes.array,
};

export default MovieList;