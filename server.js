const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const pollRoutes = require('./routes/pollRoutes');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Swagger Ayarları (Scrum 5)
const swaggerDocument = {
  openapi: '3.0.0',
  info: { title: 'VoteSafe API', version: '1.0.0' },
  paths: {
    '/api/polls/create': {
      post: {
        summary: 'Yeni Anket Oluştur',
        tags: ['Polls'],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  question: { type: 'string' },
                  options: { type: 'array', items: { type: 'string' } },
                  durationMinutes: { type: 'integer' }
                }
              }
            }
          }
        },
        responses: { '201': { description: 'Başarılı' } }
      }
    }
  }
};
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api/polls', pollRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Swagger Docs: http://localhost:${PORT}/api-docs`);
});