import { Hono } from 'hono';
import { authRouter } from './routes/auth.route'
import { termRouter } from './routes/term.route';
import { cors } from 'hono/cors'

import type { JwtVariables } from 'hono/jwt';

type Variables = JwtVariables

const app = new Hono<{ Variables: Variables }>()

// CORS should be called before the route
app.use('/api/*', cors({ 
  origin: '*', 
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}))


app.route('/api/v1/auth', authRouter)
app.route('/api/v1/terms', termRouter)


// Habilitar CORS para todas las rutas con todos los orígenes, métodos y encabezados


app.get('/', (c) => c.text('Hello Bun!'));

export default { 
  port: process.env.PORT||3000, 
  fetch: app.fetch, 
} 