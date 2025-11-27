import { Router } from 'express';

export const openApiRouter = Router();

const schema = {
  openapi: '3.1.0',
  info: {
    title: 'SecondWind Backend API',
    version: '0.1.0',
    description:
      'Secure backend wrapper around Gemini for chat/coaching workflows. All endpoints expect JSON payloads.',
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  paths: {
    '/api/health': {
      get: {
        summary: 'Health check',
        responses: {
          '200': {
            description: 'Service is healthy',
          },
        },
      },
    },
    '/api/chat': {
      post: {
        summary: 'Send a message to the AI assistant',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'object',
                    properties: {
                      role: { type: 'string', enum: ['user'] },
                      text: { type: 'string' },
                    },
                    required: ['role', 'text'],
                  },
                  session: {
                    type: 'object',
                    properties: {
                      sessionId: { type: 'string' },
                      type: { type: 'string', enum: ['INTAKE', 'COACH', 'GLOBAL'] },
                    },
                    required: ['sessionId', 'type'],
                  },
                  history: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        role: { type: 'string', enum: ['user', 'assistant', 'system', 'model'] },
                        text: { type: 'string' },
                      },
                      required: ['role', 'text'],
                    },
                  },
                },
                required: ['message', 'session'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Chat reply',
          },
          '400': {
            description: 'Invalid payload',
          },
          '401': {
            description: 'Authentication required or invalid token',
          },
        },
        security: [{ bearerAuth: [] }],
      },
    },
    '/api/auth/login': {
      post: {
        summary: 'Authenticate a user and receive a JWT',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
                required: ['email', 'password'],
              },
            },
          },
        },
        responses: {
          '200': { description: 'Login successful, JWT returned' },
          '400': { description: 'Invalid payload' },
          '401': { description: 'Invalid email or password' },
        },
      },
    },
    '/api/images': {
      post: {
        summary: 'Generate an image with Gemini',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  prompt: { type: 'string' },
                  size: { type: 'string', enum: ['1K', '2K', '4K'] },
                },
                required: ['prompt'],
              },
            },
          },
        },
        responses: {
          '200': { description: 'Base64-encoded image returned' },
          '400': { description: 'Invalid payload' },
          '401': { description: 'Authentication required or invalid token' },
          '500': { description: 'Model unavailable or failed generation' },
        },
        security: [{ bearerAuth: [] }],
      },
    },
  },
};

openApiRouter.get('/openapi.json', (_, res) => {
  res.json(schema);
});
