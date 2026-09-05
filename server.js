const express = require('express');
const path = require('path');
const config = require('./config');
const apiRoutes = require('./routes/api');
const logger = require('./middleware/logger');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(logger);
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(config.port, () => {
    console.log(`GenshinDB Search Web started!`);
    console.log(`Visit http://localhost:${config.port}`);
});
