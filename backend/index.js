const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const path = require('path');

// routes
const invalidRoutes = require("./src/api/routes/invalid.route");
const tokenRoutes = require("./src/api/routes/token.route");
const subgraphRoutes = require("./src/api/routes/subgraph.route");

// app.use(express.static(path.join(__dirname, 'public')));

// req input phraser
app.use(express.json());


app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use(tokenRoutes);

app.use(subgraphRoutes);

app.use(invalidRoutes);

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
