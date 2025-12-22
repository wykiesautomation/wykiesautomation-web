
// server/server.js
import express from 'express';
import appITN from './payfast-itn.js';

const app = express();
app.use(appITN);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
