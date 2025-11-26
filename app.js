import cors from "cors";
import "dotenv/config.js";
import express from "express";

// init app
const app = express();

//enable cors to frontend
let corsOptions = {
  origin: process.env.ORIGIN,
};

// Middleware
app.use(express.json());
app.use(cors(corsOptions));

// This is used to log the request on the console
app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

try {
  app.listen(process.env.PORT || 3000, () => {
    console.log(`listening  to port ${process.env.PORT || 3000}...`);
  });
} catch (e) {
  console.log(e);
}
