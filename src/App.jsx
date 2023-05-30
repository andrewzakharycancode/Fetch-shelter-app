import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [breeds, setBreeds] = useState([]);
  const [dogs, setDogs] = useState([]);
  const [selectedDogs, setSelectedDogs] = useState([]);
  const [selectedBreed, setSelectedBreed] = useState('');
  const [zipCodes, setZipCodes] = useState('');
  const [ageMin, setAgeMin] = useState('');
  const [ageMax, setAgeMax] = useState('');
  const [size, setSize] = useState(25);
  const [sort, setSort] = useState('asc');
  const [match, setMatch] = useState(null);
  const [sortField, setSortField] = useState('age'); // Sort by age by default
  const [currentPage, setCurrentPage] = useState(1);
  const [dogsPerPage] = useState(8);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  function handleSelectDog(dog) {
    setSelectedDogs(prevDogs => [...prevDogs, dog]);
  }

  function login() {
    fetch('https://frontend-take-home-service.fetch.com/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name, email: email }),
      credentials: 'include'
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Request failed!');
        }
        return response.text();
      })
      .then((data) => {
        console.log('Login response: ', data);
        setIsLoggedIn(true);
        getBreeds();
      })
      .catch(error => console.error('Login error: ', error));
  }

  function getBreeds() {
    fetch('https://frontend-take-home-service.fetch.com/dogs/breeds', {
      credentials: 'include',
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Request failed!');
        }
        return response.json();
      })
      .then(data => {
        console.log('Breeds: ', data);
        setBreeds(data);
      })
      .catch(error => console.error('Get breeds error: ', error));
  }

  function getDogs() {
    const url = new URL('https://frontend-take-home-service.fetch.com/dogs/search');
    if (selectedBreed !== '') {
      url.searchParams.append('breeds', selectedBreed);
    }
    if (zipCodes !== '') {
      const zipCodesArray = zipCodes.replaceAll(/\s/g, '').split(',');

      zipCodesArray.forEach(zipCode => {
        url.searchParams.append('zipCodes', zipCode);
      });
    }
    if (ageMin !== '') {
      url.searchParams.append('ageMin', ageMin);
    }
    if (ageMax !== '') {
      url.searchParams.append('ageMax', ageMax);
    }
    if (sortField !== '') {
      url.searchParams.append('sort', `${sortField}:${sort}`);
    }
    url.searchParams.append('size', size);

    fetch(url, { credentials: 'include' })
      .then(response => {
        if (!response.ok) {
          throw new Error('Request failed!');
        }
        return response.json();
      })
      .then(data => {
        console.log('Search results: ', data);
        fetchDogDetails(data.resultIds);
        setIsSidebarVisible(true); // Set sidebar visibility after search
      })
      .catch(error => console.error('Search dogs error: ', error));
  }

  function fetchDogDetails(dogIds) {
    fetch('https://frontend-take-home-service.fetch.com/dogs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dogIds),
      credentials: 'include',
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Request failed!');
        }
        return response.json();
      })
      .then(data => {
        console.log('Dog details: ', data);
        setDogs(data);
        // all dogs with their details
      })
      .catch(error => console.error('Fetch dog details error: ', error));
  }

  function getMatch() {
    fetch('https://frontend-take-home-service.fetch.com/dogs/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(selectedDogs.map(dog => dog.id)),
      credentials: 'include',
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Request failed!');
        }
        return response.json();
      })
      .then(data => {
        console.log('Match found: ', data);
        // data is equal to a dog's id
        // so I need to get the dog entire object using the dog id and save that to match (instead of the id)
        const matchingDog = selectedDogs.find(dog => dog.id === data.match);
        setMatch(matchingDog);
        // dogs that match user input
      })
      .catch(error => console.error('Get match error: ', error));
  }

  // Pagination Logic
  const indexOfLastDog = currentPage * dogsPerPage;
  const indexOfFirstDog = indexOfLastDog - dogsPerPage;
  const currentDogs = dogs.slice(indexOfFirstDog, indexOfLastDog);

  const totalPages = Math.ceil(dogs.length / dogsPerPage);

  function paginate(pageNumber) {
    setCurrentPage(pageNumber);
  }

  console.log(selectedDogs);
  console.log(match);

  return (
    <div>
      <h1>Fetch Dog Finder</h1>

      {!isLoggedIn && (
  <div className="homepage">
    <h2>Welcome to Fetch Dog Finder</h2>
    <p>Looking for your perfect furry friend? You've come to the right place!</p>
    <p>Discover a wide selection of dogs available for adoption.</p>
    <p>Simply login to get started.</p>

    <label htmlFor="name">Name:</label>
    <input
      id="name"
      type="text"
      name="name"
      value={name}
      onChange={e => setName(e.target.value)}
      placeholder="Enter your name"
    />

    <label htmlFor="email">Email:</label>
    <input
      id="email"
      type="email"
      name="email"
      value={email}
      onChange={e => setEmail(e.target.value)}
      placeholder="Enter your email"
    />

    <button onClick={login}>Login</button>
  </div>
)}


      {isLoggedIn && (
        <div>
          <div className={isSidebarVisible ? 'sidebar' : ''}>
            <label htmlFor="breed">Breed:</label>
            <select
              id="breed"
              value={selectedBreed}
              onChange={e => setSelectedBreed(e.target.value)}
            >
              <option value="">-- Choose a Breed --</option>
              {breeds.map(breed => (
                <option key={breed} value={breed}>
                  {breed}
                </option>
              ))}
            </select>

            <label htmlFor="zipCodes">Zip Codes:</label>
            <input
              id="zipCodes"
              type="text"
              name="zipCodes"
              value={zipCodes}
              onChange={e => setZipCodes(e.target.value)}
            />

            <label htmlFor="ageMin">Minimum Age:</label>
            <input
              id="ageMin"
              type="number"
              name="ageMin"
              value={ageMin}
              onChange={e => setAgeMin(e.target.value)}
            />

            <label htmlFor="ageMax">Maximum Age:</label>
            <input
              id="ageMax"
              type="number"
              name="ageMax"
              value={ageMax}
              onChange={e => setAgeMax(e.target.value)}
            />

            <label htmlFor="size">Size:</label>
            <input
              id="size"
              type="number"
              name="size"
              value={size}
              onChange={e => setSize(parseInt(e.target.value))}
            />

            <label htmlFor="sortField">Sort Field:</label>
            <input
              id="sortField"
              type="text"
              name="sortField"
              value={sortField}
              onChange={e => setSortField(e.target.value)}
            />

            <label htmlFor="sort">Sort:</label>
            <select
              id="sort"
              name="sort"
              value={sort}
              onChange={e => setSort(e.target.value)}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>

            <button onClick={getDogs}>Search Dogs</button>
          </div>

          <div className="cardsContainer">
            {currentDogs.map(dog => (
              <div className="card" key={dog.id}>
                <div className="cardImg">
                  <img src={dog.img} alt={dog.name} />
                </div>
                <p className="cardTitle">{dog.name}</p>
                <p className="cardContent">Breed: {dog.breed}</p>
                <p className="cardContent">Age: {dog.age}</p>
                <p className="cardContent">Zip Code: {dog.zip_code}</p>
                <button className="cardBtn" onClick={() => handleSelectDog(dog)}>
                  Select Dog
                </button>
              </div>
            ))}
          </div>

          {selectedDogs.length > 0 && (
            <button onClick={getMatch}>Find a Match</button>
          )}

          {match && (
            <div>
              <h2>Match Found!</h2>
              <img src={match.img} alt={match.name} />
              <p>{match.name}</p>
            </div>
          )}

          <div className="pagination">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => paginate(i + 1)}
                className={currentPage === i + 1 ? 'active' : ''}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {isLoggedIn && (
            <button className="logoutButton" onClick={() => setIsLoggedIn(false)}>
              Log Out
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
