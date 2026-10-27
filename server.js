const express = require('express');
const path = require('path');
const config = require('./src/config');
const logger = require('./src/infrastructure/logging/logger');
const apiRoutes = require('./src/app/routes');
const { notFoundHandler, errorHandler } = require('./src/app/middleware/error-handler');

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', apiRoutes);
app.use('/api', notFoundHandler);
app.use(errorHandler);

app.listen(config.port, () => {
  logger.info(`VETEC rodando em http://localhost:${config.port}`);
});