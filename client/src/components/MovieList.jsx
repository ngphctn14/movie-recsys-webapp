import { useState } from 'react';
import React from 'react';
import PropTypes from 'prop-types';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import Modal from 'react-modal';
import YouTube from 'react-youtube';

const opts = {
  height: '390',
  width: '640',
  playerVars: {
    // https://developers.google.com/youtube/player_parameters
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
  },
};

const responsive = {
  superLargeDesktop: {
    // the naming can be any, depends on you.
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
  const [modalIsOpen, setModalIsOpen] = React.useState(false);
  const [trailerKey, setTrailerKey] = useState('');

  const handleTrailer = async (movieId) => {
    setTrailerKey('');
    setModalIsOpen(true);

    try {
      const url = `https://api.themoviedb.org/3/movie/${movieId}/videos?language=en-US`;
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
        },
      };

      const response = await fetch(url, options);
      const data = await response.json();
      const trailer = data.results?.find(
        (video) => video.site === 'YouTube' && video.type === 'Trailer'
      );

      if (trailer) {
        setTrailerKey(trailer.key);
        setModalIsOpen(true);
      } else {
        alert('Phim này chưa có trailer nhé!');
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
        {data.length > 0 &&
          data.map((item) => (
            <div
              key={item.id}
              className='w-[200px] h-[300px] relative group'
              onClick={() => handleTrailer(item.id)}
            >
              <div className='w-full h-full group-hover:scale-105 transition-transform duration-300 ease-in-out cursor-pointer'>
                <div className='absolute top-0 left-0 w-full h-full bg-black/40' />
                <img
                  src={`${import.meta.env.VITE_IMG_URL}${item.poster_path}`}
                  alt='item.title'
                  className='w-full h-full object-cover rounded-lg '
                />
                <div className='absolute bottom-4 left-2 '>
                  <p className='uppercase text-md'>
                    {item.name ||
                      item.original_name ||
                      item.title ||
                      item.original_title}
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
        contentLabel='Example Modal'
      >
        <YouTube videoId={trailerKey} opts={opts} />
      </Modal>
    </div>
  );
};

MovieList.propTypes = {
  title: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired,
};

export default MovieList;
