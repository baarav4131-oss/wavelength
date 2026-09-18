// app/page.tsx

"use client";

import { useEffect, useRef, useState } from "react";
import AuthModal from "./components/AuthModel";
import SubscriptionModal from "./components/SubscriptionModal";

type Song = {
  SONG_ID: number;
  NAME: string;
  DURATION: number;
  AUDIO_URL?: string;
  ARTIST_ID: number;
  ALBUM_ID: number;
  ARTIST_NAME?: string;
  ALBUM_TITLE?: string;
};

type Artist = {
  ARTIST_ID: number;
  NAME: string;
  BIO: string | null;
  SOCIAL_MEDIA: string | null;
};

type Album = {
  ALBUM_ID: number;
  ARTIST_ID: number;
  ALBUM_TITLE: string;
  RELEASE_DATE: string | null;
  COVER_PAGE: string | null;
};

type Podcast = {
  PODCAST_ID: number;
  CREATOR_ID: number;
  TITLE: string;
  LANGUAGE: string | null;
  RELEASE_DATE: string | null;
  DESCRIPTION: string | null;
};

type Episode = {
  EPISODE_ID: number;
  PODCAST_ID: number;
  EPISODE_NO: number;
  TITLE: string;
  DURATION: number | null;
  DESCRIPTION: string | null;
  RELEASE_DATE: string | null;
  AUDIO_URL: string | null;
};

type Playlist = {
  PLAYLIST_ID: number;
  USER_ID: number;
  PLAYLIST_NAME: string;
  CREATED_DATE: string | null;
  VISIBILITY: string | null;
};

const API_URL = "http://localhost:5000";

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);

  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] =
    useState<Playlist | null>(null);
  const [playlistSongs, setPlaylistSongs] = useState<Song[]>([]);

  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [showPlaylistForm, setShowPlaylistForm] = useState(false);

  const [followedArtists, setFollowedArtists] = useState<number[]>([]);

  const [selectedPodcast, setSelectedPodcast] =
    useState<Podcast | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] =
    useState<"login" | "register">("login");

  const [subscriptionOpen, setSubscriptionOpen] = useState(false);
  const [subscription, setSubscription] = useState<any | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  // --------------------------------------------------
  // RESTORE LOGIN
  // --------------------------------------------------

  useEffect(() => {
    const savedToken =
      localStorage.getItem("musicstream_token");

    const savedUser =
      localStorage.getItem("musicstream_user");

    if (savedToken) {
      setToken(savedToken);
    }

    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("musicstream_user");
      }
    }
  }, []);

  // --------------------------------------------------
  // LOAD SUBSCRIPTION
  // --------------------------------------------------

  const loadSubscription = async (authToken?: string) => {
  const activeToken =
    authToken ||
    token ||
    localStorage.getItem("musicstream_token");

  if (!activeToken) {
    setSubscription(null);
    return;
  }

  setSubscriptionLoading(true);

  try {
    const response = await fetch(
      `${API_URL}/api/subscriptions/my`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
      }
    );

    const data = await response.json();

    if (response.status === 404) {
      setSubscription(null);
      return;
    }

    if (!response.ok) {
      throw new Error(
        data.error ||
          data.details ||
          "Failed to load subscription"
      );
    }

    setSubscription(data);
  } catch (error) {
    console.error(
      "Subscription loading error:",
      error
    );
    setSubscription(null);
  } finally {
    setSubscriptionLoading(false);
  }
};

  useEffect(() => {
    if (token) {
      loadSubscription();
    } else {
      setSubscription(null);
    }
  }, [token]);

  // --------------------------------------------------
  // LOAD PUBLIC DATA
  // --------------------------------------------------

  useEffect(() => {
    async function loadPublicData() {
      try {
        const [
          songsRes,
          artistsRes,
          albumsRes,
          podcastsRes,
        ] = await Promise.all([
          fetch(`${API_URL}/api/songs`),
          fetch(`${API_URL}/api/artists`),
          fetch(`${API_URL}/api/albums`),
          fetch(`${API_URL}/api/podcasts`),
        ]);

        const [
          songsData,
          artistsData,
          albumsData,
          podcastsData,
        ] = await Promise.all([
          songsRes.json(),
          artistsRes.json(),
          albumsRes.json(),
          podcastsRes.json(),
        ]);

        const normalizedSongs: Song[] =
          songsData.map((row: any) => {
            if (Array.isArray(row)) {
              return {
                SONG_ID: row[0],
                NAME: row[1],
                DURATION: row[2],
                AUDIO_URL: row[3],
                ARTIST_ID: row[4],
                ALBUM_ID: row[5],
                ARTIST_NAME: row[6],
                ALBUM_TITLE: row[7],
              };
            }

            return row;
          });

        const normalizedArtists: Artist[] =
          artistsData.map((row: any) => {
            if (Array.isArray(row)) {
              return {
                ARTIST_ID: row[0],
                NAME: row[1],
                BIO: row[2],
                SOCIAL_MEDIA: row[3],
              };
            }

            return row;
          });

        const normalizedAlbums: Album[] =
          albumsData.map((row: any) => {
            if (Array.isArray(row)) {
              return {
                ALBUM_ID: row[0],
                ARTIST_ID: row[1],
                ALBUM_TITLE: row[2],
                RELEASE_DATE: row[3],
                COVER_PAGE: row[4],
              };
            }

            return row;
          });

        const normalizedPodcasts: Podcast[] =
          podcastsData.map((row: any) => {
            if (Array.isArray(row)) {
              return {
                PODCAST_ID: row[0],
                CREATOR_ID: row[1],
                TITLE: row[2],
                LANGUAGE: row[3],
                RELEASE_DATE: row[4],
                DESCRIPTION: row[5],
              };
            }

            return row;
          });

        setSongs(normalizedSongs);
        setArtists(normalizedArtists);
        setAlbums(normalizedAlbums);
        setPodcasts(normalizedPodcasts);
      } catch (error) {
        console.error(
          "Failed to load public data:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadPublicData();
  }, []);

  // --------------------------------------------------
  // LOAD USER PLAYLISTS
  // --------------------------------------------------

  useEffect(() => {
    if (!token) {
      setPlaylists([]);
      return;
    }

    async function loadMyPlaylists() {
      try {
        const response = await fetch(
          `${API_URL}/api/playlists`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              data.details ||
              "Failed to fetch playlists"
          );
        }

        const normalizedPlaylists: Playlist[] =
          data.map((row: any) => {
            if (Array.isArray(row)) {
              return {
                PLAYLIST_ID: row[0],
                USER_ID: row[1],
                PLAYLIST_NAME: row[2],
                CREATED_DATE: row[3],
                VISIBILITY: row[4],
              };
            }

            return row;
          });

        setPlaylists(normalizedPlaylists);
      } catch (error) {
        console.error(
          "Failed to load playlists:",
          error
        );
        setPlaylists([]);
      }
    }

    loadMyPlaylists();
  }, [token]);

  // --------------------------------------------------
  // LOGOUT
  // --------------------------------------------------

  const handleLogout = () => {
    localStorage.removeItem("musicstream_token");
    localStorage.removeItem("musicstream_user");

    setToken(null);
    setCurrentUser(null);
    setSubscription(null);
    setFollowedArtists([]);

    alert("Logged out successfully");
  };

  // --------------------------------------------------
  // PREMIUM
  // --------------------------------------------------

  const handlePremiumClick = () => {
    if (!token || !currentUser) {
      alert("Please login first.");
      return;
    }

    setSubscriptionOpen(true);
  };

  // --------------------------------------------------
  // PODCASTS
  // --------------------------------------------------

  const openPodcast = async (podcast: Podcast) => {
    try {
      const podcastId = podcast.PODCAST_ID;

      if (!podcastId) {
        throw new Error("Podcast ID is missing");
      }

      const response = await fetch(
        `${API_URL}/api/episodes/podcast/${podcastId}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.details ||
            "Failed to fetch podcast episodes"
        );
      }

      const normalizedEpisodes: Episode[] =
        data.map((row: any) => {
          if (Array.isArray(row)) {
            return {
              EPISODE_ID: row[0],
              PODCAST_ID: row[1],
              EPISODE_NO: row[2],
              TITLE: row[3],
              DURATION: row[4],
              DESCRIPTION: row[5],
              RELEASE_DATE: row[6],
              AUDIO_URL: row[7],
            };
          }

          return row;
        });

      setSelectedPodcast(podcast);
      setEpisodes(normalizedEpisodes);

      setTimeout(() => {
        document
          .getElementById("podcast-details")
          ?.scrollIntoView({
            behavior: "smooth",
          });
      }, 100);
    } catch (error) {
      console.error(
        "Open podcast error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to load podcast"
      );
    }
  };

  const closePodcast = () => {
    setSelectedPodcast(null);
    setEpisodes([]);
  };

  // --------------------------------------------------
  // SEARCH
  // --------------------------------------------------

  const filteredSongs = songs.filter((song) =>
    String(song.NAME || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // --------------------------------------------------
  // HELPERS
  // --------------------------------------------------

  const formatDuration = (
    seconds: number | null | undefined
  ) => {
    if (!seconds || Number.isNaN(seconds)) {
      return "0:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(
      seconds % 60
    );

    return `${minutes}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const getSongImage = (songId: number) => {
    const images: Record<number, string> = {
      1: "/images/Tell Me What.jpg",
      2: "/images/Running Night.jpg",
      3: "/images/Passacaglia.jpg",
      4: "/images/Fur Elise.jpg",
    };

    return (
      images[songId] ||
      "/images/default.jpg"
    );
  };

  // --------------------------------------------------
  // AUDIO
  // --------------------------------------------------

  const handlePlay = (song: Song) => {
    setCurrentSong(song);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (!currentSong || !audioRef.current) {
      return;
    }

    audioRef.current.load();

    audioRef.current
      .play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch((error) => {
        console.error(
          "Audio playback failed:",
          error
        );
        setIsPlaying(false);
      });
  }, [currentSong]);

  const handlePlayPause = async () => {
    if (!currentSong || !audioRef.current) {
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error(
          "Audio playback failed:",
          error
        );
        setIsPlaying(false);
      }
    }
  };

  const handleSeek = (value: number) => {
    setCurrentTime(value);

    if (audioRef.current) {
      audioRef.current.currentTime = value;
    }
  };

  // --------------------------------------------------
  // PLAYLISTS
  // --------------------------------------------------

  const openPlaylist = async (
    playlist: Playlist
  ) => {
    try {
      const playlistId =
        playlist.PLAYLIST_ID;

      if (!playlistId) {
        throw new Error(
          "Playlist ID is missing"
        );
      }

      const response = await fetch(
        `${API_URL}/api/playlists/${playlistId}/songs`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.details ||
            "Failed to fetch playlist songs"
        );
      }

      const normalizedSongs: Song[] =
        data.map((row: any) => {
          if (Array.isArray(row)) {
            return {
              SONG_ID: row[0],
              NAME: row[1],
              DURATION: row[2],
              AUDIO_URL: row[3],
              ARTIST_ID: row[4],
              ALBUM_ID: row[5],
              ARTIST_NAME: row[6],
              ALBUM_TITLE: row[7],
            };
          }

          return row;
        });

      setSelectedPlaylist(playlist);
      setPlaylistSongs(normalizedSongs);

      setTimeout(() => {
        document
          .getElementById("playlist-details")
          ?.scrollIntoView({
            behavior: "smooth",
          });
      }, 100);
    } catch (error) {
      console.error(
        "Open playlist error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to load playlist"
      );
    }
  };

  const createPlaylist = async () => {
    if (!currentUser || !token) {
      setAuthMode("login");
      setShowAuth(true);
      return;
    }

    if (!newPlaylistName.trim()) {
      alert("Please enter a playlist name");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/playlists`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            playlist_name:
              newPlaylistName.trim(),
            visibility: "PUBLIC",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.details ||
            "Failed to create playlist"
        );
      }

      setNewPlaylistName("");
      setShowPlaylistForm(false);

      const playlistsResponse =
        await fetch(
          `${API_URL}/api/playlists`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

      const playlistsData =
        await playlistsResponse.json();

      if (!playlistsResponse.ok) {
        throw new Error(
          playlistsData.error ||
            playlistsData.details ||
            "Failed to refresh playlists"
        );
      }

      const normalizedPlaylists: Playlist[] =
        playlistsData.map((row: any) => {
          if (Array.isArray(row)) {
            return {
              PLAYLIST_ID: row[0],
              USER_ID: row[1],
              PLAYLIST_NAME: row[2],
              CREATED_DATE: row[3],
              VISIBILITY: row[4],
            };
          }

          return row;
        });

      setPlaylists(normalizedPlaylists);

      alert(
        "Playlist created successfully!"
      );
    } catch (error) {
      console.error(
        "Create playlist error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to create playlist"
      );
    }
  };

  const addSongToPlaylist = async (
    playlistId: number,
    songId: number
  ) => {
    if (!token) {
      setAuthMode("login");
      setShowAuth(true);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/playlists/${playlistId}/songs`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            song_id: songId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.details ||
            "Failed to add song"
        );
      }

      alert("Song added to playlist!");

      if (
        selectedPlaylist?.PLAYLIST_ID ===
        playlistId
      ) {
        await openPlaylist(
          selectedPlaylist
        );
      }
    } catch (error) {
      console.error(
        "Add song error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to add song to playlist"
      );
    }
  };

  // --------------------------------------------------
  // ARTISTS
  // --------------------------------------------------

  const followArtist = async (
    artistId: number
  ) => {
    if (!currentUser || !token) {
      setAuthMode("login");
      setShowAuth(true);
      return;
    }

    try {
      const isFollowed =
        followedArtists.includes(
          artistId
        );

      const response = await fetch(
        `${API_URL}/api/artists/${artistId}/follow`,
        {
          method: isFollowed
            ? "DELETE"
            : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.details ||
            (isFollowed
              ? "Failed to unfollow artist"
              : "Failed to follow artist")
        );
      }

      if (isFollowed) {
        setFollowedArtists((current) =>
          current.filter(
            (id) => id !== artistId
          )
        );
      } else {
        setFollowedArtists((current) => [
          ...current,
          artistId,
        ]);
      }
    } catch (error) {
      console.error(
        "Artist follow error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    }
  };

  // --------------------------------------------------
  // NAVIGATION
  // --------------------------------------------------

  const scrollToSection = (
    id: string
  ) => {
    document
      .getElementById(id)
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  const handleSearchClick = () => {
    scrollToSection("songs");
  };

  const handleLibraryClick = () => {
    scrollToSection("playlists");
  };

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <main className="min-h-screen bg-[#080808] text-white">

      <audio
        ref={audioRef}
        src={
          currentSong?.AUDIO_URL ||
          undefined
        }
        onTimeUpdate={(e) => {
          setCurrentTime(
            e.currentTarget.currentTime
          );
        }}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
        onError={() => {
          console.error(
            "Unable to load audio:",
            currentSong?.AUDIO_URL
          );
          setIsPlaying(false);
        }}
      />

      <AuthModal
  key={authMode}
  open={showAuth}
  mode={authMode}
  onClose={() => setShowAuth(false)}
  onSuccess={async (newToken, user) => {
    setToken(newToken);
    setCurrentUser(user);

    await loadSubscription(newToken);
  }}
/>

      <SubscriptionModal
  open={subscriptionOpen}
  token={token}
  onClose={() => setSubscriptionOpen(false)}
  onSuccess={async () => {
    setSubscriptionOpen(false);

    // Immediately reload current plan
    await loadSubscription();
  }}
/>

      <div className="flex min-h-screen">

        {/* SIDEBAR */}

        <aside className="hidden w-64 flex-shrink-0 border-r border-gray-800 bg-[#0d0d0d] p-6 md:block">

          <div className="mb-10">
            <h1 className="text-2xl font-bold">
              MusicStream
            </h1>

            <p className="mt-1 text-xs text-gray-500">
              Music & Podcasts
            </p>
          </div>

          <nav className="space-y-2">

            <button
              onClick={() =>
                scrollToSection("home")
              }
              className="w-full rounded-lg bg-white px-4 py-3 text-left font-medium text-black"
            >
              🏠 Home
            </button>

            <button
              onClick={handleSearchClick}
              className="w-full rounded-lg px-4 py-3 text-left text-gray-400 hover:bg-gray-800 hover:text-white"
            >
              🔍 Search
            </button>

            <button
              onClick={handleLibraryClick}
              className="w-full rounded-lg px-4 py-3 text-left text-gray-400 hover:bg-gray-800 hover:text-white"
            >
              ❤️ Your Library
            </button>

            <button
              onClick={() =>
                scrollToSection(
                  "playlists"
                )
              }
              className="w-full rounded-lg px-4 py-3 text-left text-gray-400 hover:bg-gray-800 hover:text-white"
            >
              🎧 Playlists
            </button>

            <button
              onClick={() =>
                scrollToSection(
                  "podcasts"
                )
              }
              className="w-full rounded-lg px-4 py-3 text-left text-gray-400 hover:bg-gray-800 hover:text-white"
            >
              🎙️ Podcasts
            </button>

          </nav>

          <div className="mt-12 border-t border-gray-800 pt-6">

            <p className="mb-3 text-xs uppercase tracking-wider text-gray-600">
              Account
            </p>

            {/* LOGIN BUTTON REMOVED */}

            <button
              onClick={handlePremiumClick}
              className="w-full rounded-lg px-4 py-3 text-left text-gray-400 hover:bg-gray-800 hover:text-white"
            >
              ⭐ Premium
            </button>

            {currentUser && (
              <button
                onClick={handleLogout}
                className="mt-2 w-full rounded-lg px-4 py-3 text-left text-gray-400 hover:bg-gray-800 hover:text-white"
              >
                🚪 Logout
              </button>
            )}

          </div>
        </aside>

        {/* MAIN CONTENT */}

        <section className="flex-1 pb-32">

          {/* TOP BAR */}

          {/* TOP BAR */}

<header className="sticky top-0 z-10 flex items-center gap-4 border-b border-gray-800 bg-[#080808]/95 px-6 py-4 backdrop-blur">

  <div className="flex-1">
    <input
      type="text"
      placeholder="Search songs..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="w-full max-w-xl rounded-full border border-gray-700 bg-[#151515] px-5 py-3 text-sm outline-none placeholder:text-gray-500 focus:border-gray-400"
    />
  </div>

  {currentUser ? (
    <div className="flex items-center gap-3">

      <span className="hidden text-sm text-gray-400 sm:block">
        Hi,{" "}
        {currentUser.FIRST_NAME ??
          currentUser.first_name}
      </span>

      <button
        onClick={handleLogout}
        className="rounded-full border border-gray-700 px-5 py-2 text-sm hover:bg-gray-800"
      >
        Logout
      </button>

    </div>
  ) : (
    <button
      onClick={() => {
        setAuthMode("login");
        setShowAuth(true);
      }}
      className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-gray-200"
    >
      Login
    </button>
  )}

</header>

          <div
            id="home"
            className="px-6 py-8 lg:px-10"
          >

            {/* CURRENT PLAN */}

            {/* CURRENT PLAN */}

{currentUser && (
  <section className="mb-10 rounded-2xl border border-gray-800 bg-[#111111] p-6">
    <p className="text-sm text-gray-500">
      Current Plan
    </p>

    {subscriptionLoading ? (
      <p className="mt-2 text-xl text-gray-400">
        Loading...
      </p>
    ) : String(
        subscription?.PLAN_TYPE || ""
      ).toUpperCase() === "PREMIUM" ? (
      <>
        <h2 className="mt-1 text-2xl font-bold">
          ⭐ Premium
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          ₹999 / year
        </p>

        {subscription?.END_DATE && (
          <p className="mt-2 text-sm text-gray-400">
            Valid until{" "}
            {new Date(
              subscription.END_DATE
            ).toLocaleDateString("en-IN")}
          </p>
        )}
      </>
    ) : (
      <>
        <h2 className="mt-1 text-2xl font-bold">
          Free
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          You are currently on the Free plan.
        </p>
      </>
    )}
  </section>
)}

            {/* HERO */}

            <section className="mb-10 rounded-2xl border border-gray-800 bg-gradient-to-r from-gray-900 to-[#111111] p-8">

              <p className="mb-2 text-sm text-gray-400">
                Welcome to MusicStream
              </p>

              <h2 className="text-4xl font-bold tracking-tight">
                Your music.
                <br />
                Your podcasts.
                <br />
                Your world.
              </h2>

              <p className="mt-4 max-w-lg text-gray-400">
                Discover songs, artists,
                albums and podcasts powered
                by your Oracle database.
              </p>

              <button
                onClick={() =>
                  scrollToSection(
                    "songs"
                  )
                }
                className="mt-6 rounded-full bg-white px-6 py-3 font-semibold text-black hover:bg-gray-200"
              >
                Explore Music
              </button>

            </section>

            {/* SONGS */}

            <section
              id="songs"
              className="mb-12"
            >

              <div className="mb-5 flex items-center justify-between">

                <h2 className="text-2xl font-bold">
                  {search
                    ? "Search Results"
                    : "Popular Songs"}
                </h2>

                <span className="text-sm text-gray-500">
                  {filteredSongs.length} songs
                </span>

              </div>

              {loading ? (
                <p className="text-gray-400">
                  Loading songs...
                </p>
              ) : filteredSongs.length ===
                0 ? (
                <p className="text-gray-500">
                  No songs found.
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                  {filteredSongs.map(
                    (song, index) => (
                      <div
                        key={
                          song.SONG_ID ??
                          `song-${index}`
                        }
                        className="group rounded-xl border border-gray-800 bg-[#111111] p-4 transition hover:-translate-y-1 hover:border-gray-600"
                      >

                        <div className="mb-4 h-44 overflow-hidden rounded-lg bg-gray-800">

                          <img
                            src={getSongImage(
                              song.SONG_ID
                            )}
                            alt={song.NAME}
                            className="h-full w-full object-cover"
                          />

                        </div>

                        <h3 className="truncate font-semibold">
                          {song.NAME}
                        </h3>

                        <p className="mt-1 truncate text-sm text-gray-400">
                          {song.ARTIST_NAME ||
                            "Unknown Artist"}
                        </p>

                        <p className="mt-1 truncate text-xs text-gray-600">
                          {song.ALBUM_TITLE ||
                            "Single"}
                        </p>

                        <p className="mt-2 text-sm text-gray-500">
                          {formatDuration(
                            song.DURATION
                          )}
                        </p>

                        <button
                          onClick={() =>
                            handlePlay(
                              song
                            )
                          }
                          className="mt-4 w-full rounded-full bg-white py-2 text-sm font-semibold text-black transition hover:bg-gray-200"
                        >
                          ▶ Play
                        </button>

                      </div>
                    )
                  )}

                </div>
              )}

            </section>

            {/* ARTISTS */}

            <section
              id="artists"
              className="mb-12"
            >

              <h2 className="mb-5 text-2xl font-bold">
                Artists
              </h2>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                {artists.map(
                  (artist, index) => (
                    <div
                      key={
                        artist.ARTIST_ID ??
                        `artist-${index}`
                      }
                      className="rounded-xl border border-gray-800 bg-[#111111] p-5 hover:border-gray-600"
                    >

                      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-800 text-3xl">
                        🎤
                      </div>

                      <h3 className="text-lg font-semibold">
                        {artist.NAME}
                      </h3>

                      {artist.BIO && (
                        <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                          {artist.BIO}
                        </p>
                      )}

                      <button
                        onClick={() =>
                          followArtist(
                            artist.ARTIST_ID
                          )
                        }
                        className={`mt-4 rounded-full border px-4 py-2 text-sm transition ${
                          followedArtists.includes(
                            artist.ARTIST_ID
                          )
                            ? "border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700"
                            : "border-gray-700 hover:bg-gray-800"
                        }`}
                      >
                        {followedArtists.includes(
                          artist.ARTIST_ID
                        )
                          ? "✓ Followed"
                          : "Follow"}
                      </button>

                    </div>
                  )
                )}

              </div>

            </section>

            {/* ALBUMS */}

            <section
              id="albums"
              className="mb-12"
            >

              <h2 className="mb-5 text-2xl font-bold">
                Albums
              </h2>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                {albums.map(
                  (album, index) => (
                    <div
                      key={
                        album.ALBUM_ID ??
                        `album-${index}`
                      }
                      className="rounded-xl border border-gray-800 bg-[#111111] p-4 hover:border-gray-600"
                    >

                      <div className="mb-4 flex h-48 items-center justify-center rounded-lg bg-gray-800 text-5xl">
                        💿
                      </div>

                      <h3 className="font-semibold">
                        {album.ALBUM_TITLE}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        Artist ID:{" "}
                        {album.ARTIST_ID}
                      </p>

                      <button
                        onClick={() =>
                          alert(
                            "Album details coming next."
                          )
                        }
                        className="mt-4 rounded-full border border-gray-700 px-4 py-2 text-sm hover:bg-gray-800"
                      >
                        View Album
                      </button>

                    </div>
                  )
                )}

              </div>

            </section>

            {/* PLAYLISTS */}

            <section
              id="playlists"
              className="mb-12"
            >

              <div className="mb-5 flex items-center justify-between">

                <h2 className="text-2xl font-bold">
                  Your Playlists
                </h2>

                <button
                  onClick={() => {
                    if (!currentUser) {
                      setAuthMode("login");
                      setShowAuth(true);
                      return;
                    }

                    setShowPlaylistForm(
                      !showPlaylistForm
                    );
                  }}
                  className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-gray-200"
                >
                  + Create Playlist
                </button>

              </div>

              {showPlaylistForm && (
                <div className="mb-6 rounded-xl border border-gray-800 bg-[#111111] p-5">

                  <h3 className="mb-3 font-semibold">
                    Create a new playlist
                  </h3>

                  <div className="flex gap-3">

                    <input
                      type="text"
                      placeholder="Playlist name"
                      value={
                        newPlaylistName
                      }
                      onChange={(e) =>
                        setNewPlaylistName(
                          e.target.value
                        )
                      }
                      className="flex-1 rounded-lg border border-gray-700 bg-[#151515] px-4 py-3 text-sm outline-none focus:border-gray-400"
                    />

                    <button
                      onClick={
                        createPlaylist
                      }
                      className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-gray-200"
                    >
                      Create
                    </button>

                  </div>

                </div>
              )}

              {playlists.length === 0 ? (
                <div className="rounded-xl border border-gray-800 bg-[#111111] p-6 text-gray-500">
                  You don't have any
                  playlists yet.
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                  {playlists.map(
                    (playlist, index) => (
                      <div
                        key={
                          playlist.PLAYLIST_ID ??
                          `playlist-${index}`
                        }
                        className="rounded-xl border border-gray-800 bg-[#111111] p-5 hover:border-gray-600"
                      >

                        <div className="mb-4 flex h-32 items-center justify-center rounded-lg bg-gray-800 text-5xl">
                          🎧
                        </div>

                        <h3 className="text-lg font-semibold">
                          {
                            playlist.PLAYLIST_NAME
                          }
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          {playlist.VISIBILITY ||
                            "PRIVATE"}
                        </p>

                        <button
                          onClick={() =>
                            openPlaylist(
                              playlist
                            )
                          }
                          className="mt-4 w-full rounded-full border border-gray-700 py-2 text-sm hover:bg-gray-800"
                        >
                          View Playlist
                        </button>

                      </div>
                    )
                  )}

                </div>
              )}

            </section>

            {/* SELECTED PLAYLIST */}

            {selectedPlaylist && (
              <section
                id="playlist-details"
                className="mb-12 rounded-xl border border-gray-800 bg-[#111111] p-6"
              >

                <div className="mb-6 flex items-center justify-between">

                  <div>
                    <p className="text-sm text-gray-500">
                      Playlist
                    </p>

                    <h2 className="text-2xl font-bold">
                      {
                        selectedPlaylist.PLAYLIST_NAME
                      }
                    </h2>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedPlaylist(
                        null
                      );
                      setPlaylistSongs([]);
                    }}
                    className="rounded-full border border-gray-700 px-4 py-2 text-sm hover:bg-gray-800"
                  >
                    Close
                  </button>

                </div>

                {playlistSongs.length ===
                0 ? (
                  <p className="text-gray-500">
                    This playlist is empty.
                  </p>
                ) : (
                  <div className="space-y-3">

                    {playlistSongs.map(
                      (song, index) => (
                        <div
                          key={
                            song.SONG_ID ??
                            `playlist-song-${index}`
                          }
                          className="flex items-center justify-between rounded-lg border border-gray-800 bg-[#151515] p-4"
                        >

                          <div>

                            <p className="font-medium">
                              {song.NAME}
                            </p>

                            <p className="text-sm text-gray-400">
                              {song.ARTIST_NAME ||
                                "Unknown Artist"}
                            </p>

                            <p className="text-xs text-gray-600">
                              {song.ALBUM_TITLE ||
                                "Single"}
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                              {formatDuration(
                                song.DURATION
                              )}
                            </p>

                          </div>

                          <button
                            onClick={() =>
                              handlePlay(
                                song
                              )
                            }
                            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-gray-200"
                          >
                            ▶ Play
                          </button>

                        </div>
                      )
                    )}

                  </div>
                )}

                <div className="mt-6 border-t border-gray-800 pt-6">

                  <h3 className="mb-4 font-semibold">
                    Add Songs
                  </h3>

                  <div className="space-y-2">

                    {songs.map((song) => (
                      <div
                        key={song.SONG_ID}
                        className="flex items-center justify-between rounded-lg bg-[#151515] px-4 py-3"
                      >

                        <div className="min-w-0 flex-1">

                          <p className="truncate font-medium text-white">
                            {song.NAME}
                          </p>

                          <p className="truncate text-sm text-gray-500">
                            {song.ARTIST_NAME ||
                              "Unknown Artist"}
                          </p>

                        </div>

                        <span className="text-sm text-gray-500">
                          {song.DURATION}
                        </span>

                        <button
                          onClick={() =>
                            addSongToPlaylist(
                              selectedPlaylist.PLAYLIST_ID,
                              song.SONG_ID
                            )
                          }
                          className="rounded-full border border-gray-700 px-3 py-1 text-xs hover:bg-gray-800"
                        >
                          + Add
                        </button>

                      </div>
                    ))}

                  </div>

                </div>

              </section>
            )}

            {/* PODCASTS */}

            <section
              id="podcasts"
              className="mb-12"
            >

              <h2 className="mb-5 text-2xl font-bold">
                Podcasts
              </h2>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                {podcasts.map(
                  (podcast, index) => (
                    <div
                      key={
                        podcast.PODCAST_ID ??
                        `podcast-${index}`
                      }
                      className="rounded-xl border border-gray-800 bg-[#111111] p-5 hover:border-gray-600"
                    >

                      <div className="mb-4 flex h-32 items-center justify-center rounded-lg bg-gray-800 text-5xl">
                        🎙️
                      </div>

                      <h3 className="text-lg font-semibold">
                        {podcast.TITLE}
                      </h3>

                      {podcast.LANGUAGE && (
                        <p className="mt-1 text-sm text-gray-500">
                          Language:{" "}
                          {podcast.LANGUAGE}
                        </p>
                      )}

                      {podcast.DESCRIPTION && (
                        <p className="mt-3 line-clamp-2 text-sm text-gray-500">
                          {podcast.DESCRIPTION}
                        </p>
                      )}

                      <button
                        onClick={() =>
                          openPodcast(
                            podcast
                          )
                        }
                        className="mt-4 rounded-full border border-gray-700 px-4 py-2 text-sm hover:bg-gray-800"
                      >
                        View Podcast
                      </button>

                    </div>
                  )
                )}

              </div>

            </section>

            {/* SELECTED PODCAST */}

            {selectedPodcast && (
              <section
                id="podcast-details"
                className="mb-12 rounded-xl border border-gray-800 bg-[#111111] p-6"
              >

                <div className="mb-6 flex items-center justify-between">

                  <div>

                    <p className="text-sm text-gray-500">
                      Podcast
                    </p>

                    <h2 className="text-2xl font-bold">
                      {
                        selectedPodcast.TITLE
                      }
                    </h2>

                    <p className="mt-1 text-sm text-gray-400">
                      {episodes.length} episode
                      {episodes.length !== 1
                        ? "s"
                        : ""}
                    </p>

                  </div>

                  <button
                    onClick={
                      closePodcast
                    }
                    className="rounded-full border border-gray-700 px-4 py-2 text-sm hover:bg-gray-800"
                  >
                    Back
                  </button>

                </div>

                <div className="space-y-3">

                  {episodes.length ===
                  0 ? (
                    <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 text-gray-400">
                      No episodes
                      available.
                    </div>
                  ) : (
                    episodes.map(
                      (episode, index) => (
                        <div
                          key={
                            episode.EPISODE_ID ??
                            `episode-${index}`
                          }
                          className="flex items-center justify-between rounded-xl border border-gray-800 bg-gray-900 p-4 transition hover:bg-gray-800"
                        >

                          <div className="flex min-w-0 items-center gap-4">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-800 text-sm">
                              {
                                episode.EPISODE_NO
                              }
                            </div>

                            <div className="min-w-0">

                              <h3 className="truncate font-medium">
                                {
                                  episode.TITLE
                                }
                              </h3>

                              {episode.DESCRIPTION && (
                                <p className="mt-1 line-clamp-1 text-sm text-gray-500">
                                  {
                                    episode.DESCRIPTION
                                  }
                                </p>
                              )}

                              {episode.DURATION ? (
                                <p className="mt-1 text-xs text-gray-500">
                                  {formatDuration(
                                    episode.DURATION
                                  )}
                                </p>
                              ) : null}

                            </div>

                          </div>

                          <button
                            onClick={() => {

                              if (
                                !episode.AUDIO_URL
                              ) {
                                alert(
                                  "No audio available for this episode."
                                );
                                return;
                              }

                              const episodeAsSong: Song =
                                {
                                  SONG_ID:
                                    episode.EPISODE_ID,
                                  NAME:
                                    episode.TITLE,
                                  DURATION:
                                    episode.DURATION ??
                                    0,
                                  AUDIO_URL:
                                    episode.AUDIO_URL,
                                  ARTIST_ID: 0,
                                  ALBUM_ID: 0,
                                };

                              handlePlay(
                                episodeAsSong
                              );

                            }}
                            className="ml-4 shrink-0 rounded-full bg-white px-5 py-2 text-sm font-medium text-black hover:bg-gray-200"
                          >
                            ▶ Play
                          </button>

                        </div>
                      )
                    )
                  )}

                </div>

              </section>
            )}

          </div>

        </section>

      </div>

      {/* BOTTOM PLAYER */}

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-800 bg-[#0d0d0d] px-5 py-3">

        <div className="mx-auto flex max-w-7xl items-center gap-4">

          <div className="min-w-0 flex-1">

            {currentSong ? (
              <>
                <p className="truncate text-sm font-medium">
                  {currentSong.NAME}
                </p>

                <p className="truncate text-xs text-gray-500">
                  {currentSong.ARTIST_ID ===
                  0
                    ? "Podcast Episode"
                    : "Music"}
                </p>

                <p className="text-xs text-gray-500">
                  {formatDuration(
                    currentTime
                  )}{" "}
                  /{" "}
                  {formatDuration(
                    currentSong.DURATION
                  )}
                </p>
              </>
            ) : (
              <>
                <p className="truncate text-sm font-medium">
                  Select a song to start
                  listening
                </p>

                <p className="text-xs text-gray-500">
                  MusicStream Player
                </p>
              </>
            )}

          </div>

          <div className="flex items-center gap-3">

            <button
              disabled={!currentSong}
              className="rounded-full p-2 text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-40"
            >
              ⏮
            </button>

            <button
              onClick={
                handlePlayPause
              }
              disabled={!currentSong}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black disabled:opacity-40"
            >
              {isPlaying
                ? "⏸"
                : "▶"}
            </button>

            <button
              disabled={!currentSong}
              className="rounded-full p-2 text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-40"
            >
              ⏭
            </button>

          </div>

          <div className="hidden flex-1 md:block">

            <div className="mb-1 flex justify-between text-xs text-gray-500">

              <span>
                {formatDuration(
                  currentTime
                )}
              </span>

              <span>
                {currentSong
                  ? formatDuration(
                      currentSong.DURATION
                    )
                  : "0:00"}
              </span>

            </div>

            <input
              type="range"
              min="0"
              max={
                currentSong?.DURATION ||
                0
              }
              value={Math.min(
                currentTime,
                currentSong?.DURATION ||
                  0
              )}
              onChange={(e) =>
                handleSeek(
                  Number(
                    e.target.value
                  )
                )
              }
              disabled={!currentSong}
              className="w-full cursor-pointer accent-white disabled:cursor-not-allowed"
            />

          </div>

        </div>

      </div>

    </main>
  );
}