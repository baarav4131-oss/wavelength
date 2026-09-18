-- ============================================
-- MUSIC STREAMING PLATFORM
-- SAMPLE DATA
-- ============================================

-- ============================================
-- USERS
-- ============================================

INSERT INTO app_user
(first_name, last_name, email, phone_no, gender, dob)
VALUES
('Arun', 'Kumar', 'arun@example.com', '9876543210', 'MALE',
 TO_DATE('2003-05-12', 'YYYY-MM-DD'));

INSERT INTO app_user
(first_name, last_name, email, phone_no, gender, dob)
VALUES
('Priya', 'Sharma', 'priya@example.com', '9876543211', 'FEMALE',
 TO_DATE('2002-08-20', 'YYYY-MM-DD'));

INSERT INTO app_user
(first_name, last_name, email, phone_no, gender, dob)
VALUES
('Rahul', 'Singh', 'rahul@example.com', '9876543212', 'MALE',
 TO_DATE('2004-01-15', 'YYYY-MM-DD'));


-- ============================================
-- ARTISTS
-- ============================================

INSERT INTO artist
(name, bio, social_media)
VALUES
('Alex MakeMusic',
 'Famous youtuber who makes good songs.',
 '@alex');

INSERT INTO artist
(name, bio, social_media)
VALUES
('Ludwig Wan Beethoven',
 'World Famous Classical Pianist.',
 '@lwbeethoven');

INSERT INTO artist
(name, bio, social_media)
VALUES
('George Handel',
 'Famous Pianist',
 '@george');


-- ============================================
-- PODCAST CREATORS
-- ============================================

INSERT INTO podcast_creator
(email, bio)
VALUES
('creator1@example.com',
 'Technology and programming podcast creator.');

INSERT INTO podcast_creator
(email, bio)
VALUES
('creator2@example.com',
 'Entertainment and culture podcast creator.');


-- ============================================
-- ALBUMS
-- ============================================

INSERT INTO album
(artist_id, album_title, release_date, cover_page)
VALUES
(1,
 'fur Elise',
 TO_DATE('2024-01-10', 'YYYY-MM-DD'),
 '/images/Fur Elise.jpg');

INSERT INTO album
(artist_id, album_title, release_date, cover_page)
VALUES
(2,
 'Running Night',
 TO_DATE('2023-06-15', 'YYYY-MM-DD'),
 '/images/Running Night.jpg');

INSERT INTO album
(artist_id, album_title, release_date, cover_page)
VALUES
(3,
 'Tell Me What',
 TO_DATE('2024-03-20', 'YYYY-MM-DD'),
 '/images/Tell Me What.jpg');


-- ============================================
-- SONGS
-- ============================================

INSERT INTO song
(album_id, artist_id, name, duration, release_date, audio_url)
VALUES
(1,
 2,
 'Fur Elise',
 240,
 TO_DATE('2024-01-10', 'YYYY-MM-DD'),
 '/audio/Fur Elise.mp3');

INSERT INTO song
(album_id, artist_id, name, duration, release_date, audio_url)
VALUES
(1,
 2,
 'Passacaglia',
 215,
 TO_DATE('2024-01-10', 'YYYY-MM-DD'),
 '/audio/Passacaglia.mp3');

INSERT INTO song
(album_id, artist_id, name, duration, release_date, audio_url)
VALUES
(2,
 1,
 'Running Night',
 300,
 TO_DATE('2023-06-15', 'YYYY-MM-DD'),
 '/audio/Running Night.mp3');

INSERT INTO song
(album_id, artist_id, name, duration, release_date, audio_url)
VALUES
(3,
 1,
 'Tell Me What',
 275,
 TO_DATE('2024-03-20', 'YYYY-MM-DD'),
 '/audio/Tell Me What.mp3');


-- ============================================
-- PLAYLISTS
-- ============================================

INSERT INTO playlist
(user_id, playlist_name, visibility)
VALUES
(1, 'My Favorites', 'PUBLIC');

INSERT INTO playlist
(user_id, playlist_name, visibility)
VALUES
(2, 'Study Music', 'PRIVATE');


-- ============================================
-- PLAYLIST SONGS
-- ============================================

INSERT INTO playlist_song
(playlist_id, song_id)
VALUES
(1, 1);

INSERT INTO playlist_song
(playlist_id, song_id)
VALUES
(1, 2);

INSERT INTO playlist_song
(playlist_id, song_id)
VALUES
(2, 3);


-- ============================================
-- FOLLOWED ARTISTS
-- ============================================

INSERT INTO user_artist
(user_id, artist_id)
VALUES
(1, 1);

INSERT INTO user_artist
(user_id, artist_id)
VALUES
(1, 2);

INSERT INTO user_artist
(user_id, artist_id)
VALUES
(2, 3);


-- ============================================
-- SUBSCRIPTIONS
-- ============================================

INSERT INTO subscription
(user_id, plan_type, start_date, end_date)
VALUES
(1,
 'PREMIUM',
 TO_DATE('2026-01-01', 'YYYY-MM-DD'),
 TO_DATE('2026-12-31', 'YYYY-MM-DD'));

INSERT INTO subscription
(user_id, plan_type, start_date, end_date)
VALUES
(2,
 'FREE',
 TO_DATE('2026-01-01', 'YYYY-MM-DD'),
 NULL);


-- ============================================
-- PAYMENTS
-- ============================================

INSERT INTO payment
(user_id, subscription_id, amount, payment_mode)
VALUES
(1, 1, 999.00, 'CARD');

INSERT INTO payment
(user_id, subscription_id, amount, payment_mode)
VALUES
(2, 2, 0.00, 'NONE');


-- ============================================
-- DEVICES
-- ============================================

INSERT INTO device
(user_id, os, device_type)
VALUES
(1, 'Windows 11', 'LAPTOP');

INSERT INTO device
(user_id, os, device_type)
VALUES
(1, 'Android', 'MOBILE');

INSERT INTO device
(user_id, os, device_type)
VALUES
(2, 'Windows 11', 'LAPTOP');


-- ============================================
-- PODCASTS
-- ============================================

INSERT INTO podcast
(creator_id, title, language, release_date, description)
VALUES
(1,
 'Tech Talks',
 'English',
 TO_DATE('2026-01-10', 'YYYY-MM-DD'),
 'A podcast about technology and programming.');

INSERT INTO podcast
(creator_id, title, language, release_date, description)
VALUES
(2,
 'Entertainment Weekly',
 'English',
 TO_DATE('2026-02-15', 'YYYY-MM-DD'),
 'A podcast about entertainment and culture.');


-- ============================================
-- EPISODES
-- ============================================

INSERT INTO episode
(podcast_id, episode_no, title, duration, description,
 release_date, audio_url)
VALUES
(1,
 1,
 'Introduction to Programming',
 1800,
 'Introduction to programming concepts.',
 TO_DATE('2026-01-10', 'YYYY-MM-DD'),
 NULL);

INSERT INTO episode
(podcast_id, episode_no, title, duration, description,
 release_date, audio_url)
VALUES
(1,
 2,
 'Database Fundamentals',
 2100,
 'Introduction to database concepts.',
 TO_DATE('2026-01-17', 'YYYY-MM-DD'),
 NULL);

INSERT INTO episode
(podcast_id, episode_no, title, duration, description,
 release_date, audio_url)
VALUES
(2,
 1,
 'Entertainment Trends',
 1500,
 'Discussion about entertainment trends.',
 TO_DATE('2026-02-15', 'YYYY-MM-DD'),
 NULL);


-- ============================================
-- SAVE DATA
-- ============================================

COMMIT;


-- ============================================
-- SAMPLE DATA INSERTION COMPLETE
-- ============================================