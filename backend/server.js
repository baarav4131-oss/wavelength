const express = require("express");
const cors = require("cors");
require("dotenv").config();

const songsRouter = require("./routes/songs");
const artistsRouter = require("./routes/artists");
const albumsRouter = require("./routes/albums");
const playlistsRouter = require("./routes/playlists");
const podcastsRouter = require("./routes/podcasts");
const episodesRouter = require("./routes/episodes");
const usersRouter = require("./routes/users");
const subscriptionsRouter = require("./routes/subscriptions");
const paymentsRouter = require("./routes/payments");
const authRouter = require("./routes/auth");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRouter);
app.get("/", (req, res) => {
  res.json({
    message: "Music Streaming API is running"
  });
});

app.use("/api/songs", songsRouter);
app.use("/api/artists", artistsRouter);
app.use("/api/albums", albumsRouter);
app.use("/api/playlists", playlistsRouter);
app.use("/api/podcasts", podcastsRouter);
app.use("/api/episodes", episodesRouter);
app.use("/api/users", usersRouter);
app.use("/api/subscriptions", subscriptionsRouter);
app.use("/api/payments", paymentsRouter);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});