import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";

import Footer from "../components/layout/Footer";
import SideMenu from "../components/layout/SideMenu";
import MainArea from "../components/layout/MainArea";
import useAudioPlayer from "../hooks/useAudioPlayer";

import "../css/pages/HomePage.css";
import Modal from "../components/common/Modal";
import EditProfile from "../components/auth/EditProfile";

const Homepage = () => {
  const [view, setView] = useState("home"); // home | search | playlist etc.
  const [songs, setSongs] = useState([]);
  const [searchSongs, setSearchSongs] = useState([]);
  const [openEditProfile, setOpenEditProfile] = useState(false);

  const auth = useSelector((state) => state.auth);

  const songsToDisplay = view === "search" ? searchSongs : songs;

  const {
    audioRef,
    currentIndex,
    currentSong,
    isPlaying,
    currentTime,
    duration,
    isMuted,
    loopEnabled,
    shuffleEnabled,
    playbackSpeed,
    volume,
    playSongAtIndex,
    handleTogglePlay,
    handleNext,
    handlePrev,
    handleTimeUpdate,
    handleLoadedMetadata,
    handleEnded,
    handleToggleMute,
    handleToggleLoop,
    handleToggleShuffle,
    handleChangeSpeed,
    handleSeek,
    handleChangeVolume,
  } = useAudioPlayer(songsToDisplay);

  const playerState = {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    isMuted,
    loopEnabled,
    shuffleEnabled,
    playbackSpeed,
    volume,
  };
  const playerControls = {
    playSongAtIndex,
    handleTogglePlay,
    handleNext,
    handlePrev,
    handleSeek,
  };
  const playerFeatures = {
    onToggleMute: handleToggleMute,
    onToggleLoop: handleToggleLoop,
    onToggleShuffle: handleToggleShuffle,
    onChangeSpeed: handleChangeSpeed,
    onChangeVolume: handleChangeVolume,
  };

  useEffect(() => {
    // Fetch initial songs on mount
    const fetchInitialSongs = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/songs`,
        );
        setSongs(res.data.results || []);
      } catch (error) {
        console.error("Error while fetching the songs", error);
        setSongs([]);
      }
    };
    fetchInitialSongs();
  }, []);

  // Search songs
  const handleSearch = async (query) => {
    if (!query) return;
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/songs/search?q=${query}`,
      );
      setSearchSongs(res.data.results || []);
      setView("search"); // Switch to search view
    } catch (error) {
      console.error("Search failed", error);
      setSearchSongs([]);
    }
  };

  // Load playlist by tag
  const loadPlaylist = async (tag) => {
    if (!tag) return console.warn("No tag provided");
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/songs/playlistByTag/${tag}`,
      );
      setSongs(res.data.results || []);
      setView("home");
    } catch (error) {
      console.error("Failed to load playlist", error);
      setSongs([]);
    }
  };

  // Select a song from the list
  const handleSelectSong = (index) => {
    playSongAtIndex(index);
  };

  // Play favourite song
  const handlePlayFavourite = (song) => {
    const favourites = auth.user?.favourites || [];
    if (!favourites.length) return;

    const index = auth.user.favourites.findIndex((fav) => fav.id === song.id);
    setSongs(auth.user.favourites);
    setView("home");

    setTimeout(() => {
      if (index !== -1) {
        playSongAtIndex(index);
      }
    }, 0);
  };

  return (
    <div className="homepage-root">
      {/* Audio Player */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      >
        {currentSong && <source src={currentSong.audio} type="audio/mpeg" />}
      </audio>

      <div className="homepage-main-wrapper">
        {/* Sidebar */}
        <div className="homepage-sidebar">
          <SideMenu
            setView={setView}
            view={view}
            onOpenEditProfile={() => setOpenEditProfile(true)}
          />
        </div>

        {/* Main Content */}
        <div className="homepage-content">
          <MainArea
            view={view}
            currentIndex={currentIndex}
            onSelectSong={handleSelectSong}
            onSelectFavourite={handlePlayFavourite}
            onSelectTag={loadPlaylist}
            songsToDisplay={songsToDisplay}
            setSearchSongs={setSearchSongs} // <-- pass search handler
          />
        </div>
      </div>

      {/* Footer Player */}
      <Footer
        playerState={playerState}
        playerControls={playerControls}
        playerFeatures={playerFeatures}
      />
      {openEditProfile && (
        <Modal onClose={() => setOpenEditProfile(false)}>
          <EditProfile onClose={() => setOpenEditProfile(false)} />
        </Modal>
      )}
    </div>
  );
};

export default Homepage;
