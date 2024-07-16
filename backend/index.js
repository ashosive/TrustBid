const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const path = require('path');
const cors = require("cors");

// routes
const invalidRoutes = require("./src/api/routes/invalid.route");
const tokenRoutes = require("./src/api/routes/token.route");
const subgraphRoutes = require("./src/api/routes/subgraph.route");
const marketRoutes = require("./src/api/routes/market.route");
const eventRoutes = require("./src/api/routes/event.route");
const cors = require('cors');

// app.use(express.static(path.join(__dirname, 'public')));

// req input phraser
app.use(express.json());

const corsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
};
app.use(cors(corsOptions));


app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use(tokenRoutes);

app.use(subgraphRoutes);

app.use(marketRoutes);

app.use(eventRoutes);

app.use(invalidRoutes);

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
