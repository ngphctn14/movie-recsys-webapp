// import { useState, useEffect } from 'react';
// import reactLogo from './assets/react.svg';
// import viteLogo from '/vite.svg';
// import './App.css';
// import Header from './components/Header';
// import Banner from './components/Banner';
// import MovieList from './components/MovieList';
// import MovieSearch from './components/MovieSearch';

// function App() {
//   const [movie, setMovie] = useState([]);
//   const [movieRate, setMovieRate] = useState([]);
//   const [movieSearch, setMovieSearch] = useState([]);

//   const handleSearch = async (searchValue) => {
//     setMovieSearch([]);
//     try {
//       const url = `https://api.themoviedb.org/3/search/movie?query=${searchValue}&include_adult=false&language=vi-VN&page=1`;
//       const options = {
//         method: 'GET',
//         headers: {
//           accept: 'application/json',
//           Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
//         },
//       };

//       const searchMovie = await fetch(url, options);
//       const data = await searchMovie.json();
//       console.log(data.results);
//       setMovieSearch(data.results);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   useEffect(() => {
//     const fetchMovie = async () => {
//       const options = {
//         method: 'GET',
//         headers: {
//           accept: 'application/json',
//           Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
//         },
//       };
//       const url1 =
//         'https://api.themoviedb.org/3/tv/popular?language=vi-VN&page=1';
//       const url2 =
//         'https://api.themoviedb.org/3/movie/top_rated?language=vi-VN&page=1';

//       const [res1, res2] = await Promise.all([
//         fetch(url1, options),
//         fetch(url2, options),
//       ]);

//       const data1 = await res1.json();
//       const data2 = await res2.json();

//       setMovie(data1.results);
//       setMovieRate(data2.results);
//     };
//     fetchMovie();
//   }, []);

//   return (
//     <>
//       <div className=' bg-black pb-10'>
//         <Header onSearch={handleSearch} />
//         <Banner />
//         {movieSearch.length > 0 ? (
//           <MovieSearch title={'Kết Quả Tìm Kiếm'} title={'Ket qua tim kiem'} />
//         ) : (
//           <>
//             <MovieList title={'Phim Hot'} data={movie} />
//             <MovieList title={'Phim Đề Cử'} data={movieRate} />
//           </>
//         )}
//       </div>
//     </>
//   );
// }

// export default App;

import { useEffect } from 'react';
import Banner from './components/Banner';
import Header from './components/Header';
import MovieList from './components/MovieList';
import { useState } from 'react';
import MovieSearch from './components/MovieSearch';
import { MovieProvider } from './context/MovieDetailContext';

function App() {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);

  const [searchData, setSearchData] = useState([]);

  const handleSearch = async (value) => {
    const url = `https://api.themoviedb.org/3/search/movie?query=${value}&include_adult=false&language=vi&page=1`;
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
      },
    };
    if (value === '') return setSearchData([]);
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      setSearchData(data.results);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    (async function () {
      const urls = [
        'https://api.themoviedb.org/3/trending/movie/day?language=vi',
        'https://api.themoviedb.org/3/movie/top_rated?language=vi',
        // Add more URLs here...
      ];
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
        },
      };
      const fetchMovies = async (url) => {
        return await fetch(url, options).then((response) => response.json());
      };

      try {
        const response = await Promise.all(urls.map(fetchMovies));

        setTrendingMovies(response[0].results);
        setTopRatedMovies(response[1].results);
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

  return (
    <>
      <MovieProvider>
        <div className='h-full bg-black text-white min-h-screen pb-10 relative'>
          <Header onSearch={handleSearch} />
          <Banner />
          {searchData.length === 0 && (
            <MovieList title='Phim Hot' data={trendingMovies.slice(0, 10)} />
          )}
          {searchData.length === 0 && (
            <MovieList title='Phim đề cử' data={topRatedMovies.slice(0, 10)} />
          )}

          {searchData.length > 0 && <MovieSearch data={searchData} />}
        </div>
      </MovieProvider>
    </>
  );
}

export default App;
