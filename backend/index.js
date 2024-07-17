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

// app.use(express.static(path.join(__dirname, 'public')));

// req input phraser
app.use(express.json());

const allowedOrigins = ['http://localhost:3001', 'http://localhost:3000','https://trust-bid.vercel.app'];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
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
