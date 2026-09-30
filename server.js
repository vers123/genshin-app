const express = require('express');
const path = require('path');
const config = require('./config');
const apiRoutes = require('./routes/api');
const logger = require('./middleware/logger');
const GenshinService = require('./services/genshinService');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(logger);
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

// 启动时预建中英双语搜索索引（耗时操作，异步构建不阻塞监听）
setImmediate(() => {
    const t0 = Date.now();
    const index = GenshinService.buildIndex();
    console.log(`[index] 搜索索引构建完成：${index.length} 条，耗时 ${Date.now() - t0}ms`);
});

app.listen(config.port, () => {
    console.log('GenshinDB Search Web started!');
    console.log(`Visit http://localhost:${config.port}`);
});
