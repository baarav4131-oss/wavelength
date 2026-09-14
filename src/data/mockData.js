/**
 * WAVELENGTH — INITIAL MOCK DATABASE
 * Seed data matching original DBMS specifications.
 * Used for Demo Mode and client-side testing.
 */

export const INITIAL_MOCK_DATA = {
  users: [
    { User_ID: 'U001', First_Name: 'Aarav', Last_Name: 'Sharma', Email: 'aarav.sharma@mail.com', Gender: 'Male', DOB: '1999-03-12', Phone_No: '9840011122' },
    { User_ID: 'U002', First_Name: 'Diya', Last_Name: 'Menon', Email: 'diya.menon@mail.com', Gender: 'Female', DOB: '2001-07-25', Phone_No: '9840022233' },
    { User_ID: 'U003', First_Name: 'Kabir', Last_Name: 'Rao', Email: 'kabir.rao@mail.com', Gender: 'Male', DOB: '1998-11-02', Phone_No: '9840033344' },
    { User_ID: 'U004', First_Name: 'Anika', Last_Name: 'Iyer', Email: 'anika.iyer@mail.com', Gender: 'Female', DOB: '2000-01-30', Phone_No: '9840044455' },
    { User_ID: 'U005', First_Name: 'Vihaan', Last_Name: 'Nair', Email: 'vihaan.nair@mail.com', Gender: 'Male', DOB: '2002-09-18', Phone_No: '9840055566' },
    { User_ID: 'U006', First_Name: 'Meera', Last_Name: 'Pillai', Email: 'meera.pillai@mail.com', Gender: 'Female', DOB: '1997-05-09', Phone_No: '9840066677' },
  ],
  artists: [
    { Artist_ID: 'AR001', Name: 'Nova Ember', Country: 'India', Bio: 'Indie-electronic artist blending Carnatic textures with modular synthesis.' },
    { Artist_ID: 'AR002', Name: 'The Tideline', Country: 'UK', Bio: 'Four-piece alt-rock and ambient post-punk band from Bristol.' },
    { Artist_ID: 'AR003', Name: 'Rhea Kapoor', Country: 'India', Bio: 'Playback and independent singer-songwriter exploring acoustic jazz pop.' },
    { Artist_ID: 'AR004', Name: 'Low Static', Country: 'USA', Bio: 'Lo-fi / bedroom pop beatmaker and analog tape enthusiast.' },
    { Artist_ID: 'AR005', Name: 'Arjun Vale', Country: 'India', Bio: 'Hip-hop lyricist, beat designer and trap producer from Chennai.' },
  ],
  albums: [
    { Album_ID: 'AL001', Title: 'Monsoon Circuits', Release_Date: '2023-06-14', Cover_Page: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&q=80', Artist_ID: 'AR001' },
    { Album_ID: 'AL002', Title: 'Salt & Harbour', Release_Date: '2022-02-20', Cover_Page: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&q=80', Artist_ID: 'AR002' },
    { Album_ID: 'AL003', Title: 'Glass Ceilings', Release_Date: '2024-01-10', Cover_Page: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&q=80', Artist_ID: 'AR003' },
    { Album_ID: 'AL004', Title: 'Bedroom Static', Release_Date: '2021-11-05', Cover_Page: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80', Artist_ID: 'AR004' },
    { Album_ID: 'AL005', Title: 'Chennai Heat', Release_Date: '2023-09-01', Cover_Page: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80', Artist_ID: 'AR005' },
  ],
  songs: [
    { Song_ID: 'SG001', Title: 'Copper Sky', Duration: 214, Language: 'Hindi', Release_Date: '2023-06-14', Album_ID: 'AL001' },
    { Song_ID: 'SG002', Title: 'Rewire', Duration: 198, Language: 'English', Release_Date: '2023-06-14', Album_ID: 'AL001' },
    { Song_ID: 'SG003', Title: 'Harbour Lights', Duration: 241, Language: 'English', Release_Date: '2022-02-20', Album_ID: 'AL002' },
    { Song_ID: 'SG004', Title: 'Undertow', Duration: 187, Language: 'English', Release_Date: '2022-02-20', Album_ID: 'AL002' },
    { Song_ID: 'SG005', Title: 'Glass Ceiling', Duration: 203, Language: 'Hindi', Release_Date: '2024-01-10', Album_ID: 'AL003' },
    { Song_ID: 'SG006', Title: 'Paper Walls', Duration: 176, Language: 'Hindi', Release_Date: '2024-01-10', Album_ID: 'AL003' },
    { Song_ID: 'SG007', Title: 'Slow Fade', Duration: 164, Language: 'English', Release_Date: '2021-11-05', Album_ID: 'AL004' },
    { Song_ID: 'SG008', Title: 'Marina', Duration: 229, Language: 'Tamil', Release_Date: '2023-09-01', Album_ID: 'AL005' },
  ],
  playlists: [
    { Playlist_ID: 'PL001', Playlist_Name: 'Late Night Drive', Created_Date: '2024-02-01', Visibility: 'Public', User_ID: 'U001' },
    { Playlist_ID: 'PL002', Playlist_Name: 'Focus Flow', Created_Date: '2024-03-15', Visibility: 'Private', User_ID: 'U002' },
    { Playlist_ID: 'PL003', Playlist_Name: 'Gym Energy', Created_Date: '2024-01-20', Visibility: 'Public', User_ID: 'U003' },
    { Playlist_ID: 'PL004', Playlist_Name: 'Rainy Day', Created_Date: '2024-04-02', Visibility: 'Private', User_ID: 'U004' },
    { Playlist_ID: 'PL005', Playlist_Name: 'Weekend Mix', Created_Date: '2024-05-11', Visibility: 'Public', User_ID: 'U005' },
  ],
  creators: [
    { Creator_ID: 'PC001', Bio: 'Tech journalist with 8+ years covering artificial intelligence and silicon startups.', Role: 'Host' },
    { Creator_ID: 'PC002', Bio: 'Clinical psychologist specializing in digital wellness and cognitive mindfulness.', Role: 'Host' },
    { Creator_ID: 'PC003', Bio: 'Early-stage startup founder turned investigative narrator and podcast author.', Role: 'Producer' },
  ],
  podcasts: [
    { Podcast_ID: 'PD001', Podcast_Title: 'Signal & Noise', Description: 'Weekly deep dives into tech architecture, developer culture, and future systems.', Language: 'English', Release_Date: '2022-08-01', Creator_ID: 'PC001' },
    { Podcast_ID: 'PD002', Podcast_Title: 'Mind Space', Description: 'Thoughtful conversations unraveling emotional vocabulary and creative resilience.', Language: 'English', Release_Date: '2023-01-15', Creator_ID: 'PC002' },
    { Podcast_ID: 'PD003', Podcast_Title: 'Founders Table', Description: 'Unfiltered war stories from zero to Series A across emerging software hubs.', Language: 'English', Release_Date: '2021-05-10', Creator_ID: 'PC003' },
    { Podcast_ID: 'PD004', Podcast_Title: 'Chai & Chords', Description: 'Celebrating Carnatic roots, South Indian cinema melodies, and independent voices.', Language: 'Tamil', Release_Date: '2023-11-20', Creator_ID: 'PC001' },
  ],
  episodes: [
    { Podcast_ID: 'PD001', Episode_No: 1, Episode_Title: 'The Algorithm Problem', Duration: 1820, Description: 'Kicking off the season exploring recommendation heuristics.', Release_Date: '2022-08-01' },
    { Podcast_ID: 'PD001', Episode_No: 2, Episode_Title: 'Attention Economy', Duration: 1650, Description: 'Why infinite scroll UX hijacks dopamine loops.', Release_Date: '2022-08-08' },
    { Podcast_ID: 'PD002', Episode_No: 1, Episode_Title: 'Naming the Feeling', Duration: 1420, Description: 'Building a rich psychological vocabulary for stress.', Release_Date: '2023-01-15' },
    { Podcast_ID: 'PD002', Episode_No: 2, Episode_Title: 'Rest Is Productive', Duration: 1580, Description: 'Reframing recovery as an engineering priority.', Release_Date: '2023-01-22' },
    { Podcast_ID: 'PD003', Episode_No: 1, Episode_Title: 'Zero to First Cheque', Duration: 2010, Description: 'How angel syndicates think during pre-seed discussions.', Release_Date: '2021-05-10' },
    { Podcast_ID: 'PD004', Episode_No: 1, Episode_Title: 'Gaana to Playback', Duration: 1290, Description: 'The grassroots journey of Chennai street rhythms.', Release_Date: '2023-11-20' },
  ],
  subscriptions: [
    { Subscription_ID: 'SUB001', Plan_Type: 'Premium', Start_Date: '2023-01-01', End_Date: '2024-01-01', User_ID: 'U001' },
    { Subscription_ID: 'SUB002', Plan_Type: 'Free', Start_Date: '2023-05-01', End_Date: null, User_ID: 'U002' },
    { Subscription_ID: 'SUB003', Plan_Type: 'Family', Start_Date: '2022-11-15', End_Date: '2023-11-15', User_ID: 'U003' },
    { Subscription_ID: 'SUB004', Plan_Type: 'Student', Start_Date: '2024-02-01', End_Date: '2025-02-01', User_ID: 'U004' },
    { Subscription_ID: 'SUB005', Plan_Type: 'Premium', Start_Date: '2023-08-20', End_Date: '2024-08-20', User_ID: 'U005' },
    { Subscription_ID: 'SUB006', Plan_Type: 'Free', Start_Date: '2024-01-05', End_Date: null, User_ID: 'U006' },
  ],
  payments: [
    { Payment_ID: 'PAY001', Amount: 119.00, Mode: 'Card', Payment_Date: '2023-01-01', Subscription_ID: 'SUB001' },
    { Payment_ID: 'PAY002', Amount: 0.00, Mode: 'UPI', Payment_Date: '2023-05-01', Subscription_ID: 'SUB002' },
    { Payment_ID: 'PAY003', Amount: 179.00, Mode: 'UPI', Payment_Date: '2022-11-15', Subscription_ID: 'SUB003' },
    { Payment_ID: 'PAY004', Amount: 59.00, Mode: 'Wallet', Payment_Date: '2024-02-01', Subscription_ID: 'SUB004' },
    { Payment_ID: 'PAY005', Amount: 119.00, Mode: 'Card', Payment_Date: '2023-08-20', Subscription_ID: 'SUB005' },
    { Payment_ID: 'PAY006', Amount: 0.00, Mode: 'Netbanking', Payment_Date: '2024-01-05', Subscription_ID: 'SUB006' },
  ],
  devices: [
    { Device_ID: 'DEV001', OS: 'iOS', Type: 'Mobile', User_ID: 'U001' },
    { Device_ID: 'DEV002', OS: 'Windows', Type: 'Desktop', User_ID: 'U002' },
    { Device_ID: 'DEV003', OS: 'Android', Type: 'Mobile', User_ID: 'U003' },
    { Device_ID: 'DEV004', OS: 'macOS', Type: 'Desktop', User_ID: 'U004' },
    { Device_ID: 'DEV005', OS: 'Android', Type: 'Tablet', User_ID: 'U005' },
    { Device_ID: 'DEV006', OS: 'iOS', Type: 'Smart Speaker', User_ID: 'U006' },
  ],
};
