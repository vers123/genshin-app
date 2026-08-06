const express = require('express');
const path = require('path');
const config = require('./config');
const apiRoutes = require('./routes/api');
const logger = require('./middleware/logger');

const app = express();

app.use(logger);
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', apiRoutes);

app.listen(config.port, () => {
    console.log(`原神数据库服务已启动！`);
    console.log(`访问 http://localhost:${config.port}`);
});