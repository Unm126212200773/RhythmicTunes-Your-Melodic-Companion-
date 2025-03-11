import React, { useState, useEffect } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { FaHeart, FaRegHeart, FaSearch } from 'react-icons/fa';
import axios from 'axios';
import './sidebar.css'

function Songs() {
  const [items, setItems] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [playlist, setPlaylist] = useState([]);  
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Fetch all items
    axios.get('http://localhost:3000/items')
      .then(response => setItems(response.data))
      .catch(error => console.error('Error fetching items: ', error));

  // Fetch favorities items
      axios.get('http://localhost:3000/favorities')
      .then(response => setWishlist(response.data))
      .catch(error => {
        console.error('Error fetching Favvorities:', error);
        // Initialize wishlist as an empty array in case of an error
        setWishlist([]);
      });
  
    // Fetch playlist items
    axios.get('http://localhost:3000/playlist')
      .then(response => setPlaylist(response.data))
      .catch(error => {
        console.error('Error fetching playlist: ', error);
        // Initialize playlist as an empty array in case of an error
        setPlaylist([]);
      });
      // Function to handle audio play
    const handleAudioPlay = (itemId, audioElement) => {
        if (currentlyPlaying && currentlyPlaying !== audioElement) {
          currentlyPlaying.pause(); // Pause the currently playing audio
        }
        setCurrentlyPlaying(audioElement); // Update the currently playing audio
       
      };
  
      // Event listener to handle audio play
      const handlePlay = (itemId, audioElement) => {
        audioElement.addEventListener('play', () => {
          handleAudioPlay(itemId, audioElement);
        });
      };
  
      // Add event listeners for each audio element
      items.forEach((item) => {
        const audioElement = document.getElementById(`audio-${item.id}`);
        if (audioElement) {
          handlePlay(item.id, audioElement);
        }
      });
  
      // Cleanup event listeners
      return () => {
        items.forEach((item) => {
          const audioElement = document.getElementById(`audio-${item.id}`);
          if (audioElement) {
            audioElement.removeEventListener('play', () => handleAudioPlay(item.id, audioElement));
          }
        });
      };
  }, [items,currentlyPlaying, searchTerm]);
  

  const addToWishlist = async (itemId) => {
    try {
      const selectedItem = items.find((item) => item.id === itemId);
      if (!selectedItem) {
        throw new Error('Selected item not found');
      }
      const { title, imgUrl, genre, songUrl, singer, id: itemId2 } = selectedItem;
      await axios.post('http://localhost:3000/favorities', { itemId: itemId2, title, imgUrl, genre, songUrl, singer });
      const response = await axios.get('http://localhost:3000/favorities');
      setWishlist(response.data);
    } catch (error) {
      console.error('Error adding item to wishlist: ', error);
    }
  };

  const removeFromWishlist = async (itemId) => {
    try {
      // Find the item in the wishlist by itemId
      const selectedItem = wishlist.find((item) => item.itemId === itemId);
      if (!selectedItem) {
        throw new Error('Selected item not found in wishlist');
      }
      // Make a DELETE request to remove the item from the wishlist
      await axios.delete(`http://localhost:3000/favorities/${selectedItem.id}`);
      // Refresh the wishlist items
      const response = await axios.get('http://localhost:3000/favorities');
      setWishlist(response.data);
    } catch (error) {
      console.error('Error removing item from wishlist: ', error);
    }
  };
  
  const isItemInWishlist = (itemId) => {
    return wishlist.some((item) => item.itemId === itemId);
  };

  
  const addToPlaylist = async (itemId) => {
    try {
      const selectedItem = items.find((item) => item.id === itemId);
      if (!selectedItem) {
        throw new Error('Selected item not found');
      }
      const { title, imgUrl, genre, songUrl, singer, id: itemId2 } = selectedItem;
      await axios.post('http://localhost:3000/playlist', { itemId: itemId2, title, imgUrl, genre, songUrl, singer });
      const response = await axios.get('http://localhost:3000/playlist');
      setPlaylist(response.data);
    } catch (error) {
      console.error('Error adding item to wishlist: ', error);
    }
  };

  const removeFromPlaylist = async (itemId) => {
    try {
      // Find the item in the wishlist by itemId
      const selectedItem = playlist.find((item) => item.itemId === itemId);
      if (!selectedItem) {
        throw new Error('Selected item not found in wishlist');
      }
      // Make a DELETE request to remove the item from the wishlist
      await axios.delete(`http://localhost:3000/playlist/${selectedItem.id}`);
      // Refresh the wishlist items
      const response = await axios.get('http://localhost:3000/playlist');
      setPlaylist(response.data);
    } catch (error) {
      console.error('Error removing item from wishlist: ', error);
    }
  };
  
  const isItemInPlaylist = (itemId) => {
    return playlist.some((item) => item.itemId === itemId);
  };


  const filteredItems = items.filter((item) => {
    const lowerCaseQuery = searchTerm.toLowerCase();
    return (
      item.title.toLowerCase().includes(lowerCaseQuery) ||
      item.singer.toLowerCase().includes(lowerCaseQuery) ||
      item.genre.toLowerCase().includes(lowerCaseQuery)
    );
  });


    return (
      <div style={{display:"flex", justifyContent:"flex-end"}}>
      <div className="songs-container" style={{width:"1300px"}}>
        <div className="container mx-auto p-3">
          <h2 className="text-3xl font-semibold mb-4 text-center">Songs List</h2>
          <InputGroup className="mb-3">
            <InputGroup.Text id="search-icon">
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              type="search"
              placeholder="Search by singer, genre, or song name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </InputGroup>
          <br />
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
            {filteredItems.map((item, index) => (
              <div key={item.id} className="col">
                <div className="card h-100">
                  <img
                    src={item.imgUrl}
                    alt="Item Image"
                    className="card-img-top rounded-top"
                    style={{ height: '200px', width: '100%' }}
                  />
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h5 className="card-title">{item.title}</h5>
                      {isItemInWishlist(item.id) ? (
                        <Button
                          variant="light"
                          onClick={() => removeFromWishlist(item.id)}
                        >
                          <FaHeart color="red" />
                        </Button>
                      ) : (
                        <Button
                          variant="light"
                          onClick={() => addToWishlist(item.id)}
                        >
                          <FaRegHeart color="black" />
                        </Button>
                      )}
                    </div>
                    <p className="card-text">Genre: {item.genre}</p>
                    <p className="card-text">Singer: {item.singer}</p>
                    <audio controls className="w-100" id={`audio-${item.id}`} >
                      <source src={item.songUrl} />
                    </audio>
                  </div>
                  <div className="card-footer d-flex justify-content-center">
                    {isItemInPlaylist(item.id) ? (
                      <Button
                        variant="outline-secondary"
                        onClick={() => removeFromPlaylist(item.id)}
                      >
                        Remove From Playlist
                      </Button>
                    ) : (
                      <Button
                        variant="outline-primary"
                        onClick={() => addToPlaylist(item.id)}
                      >
                        Add to Playlist
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    );
  }

export default Songs;
