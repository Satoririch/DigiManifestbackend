const express = require('express');
const app = express();
const port = process.env.PORT || 3000; // Use process.env.PORT for Railway

app.get('/', (req, res) => {
  res.send('Hello from DigiManifest backend!');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
