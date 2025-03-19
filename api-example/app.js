const express = require('express')
const logger = require('./instrumentation')
const { metrics } = require('@opentelemetry/api')

const app = express()

// el meter es el objeto que se usa para crear metricas
const meter = metrics.getMeter('otel-test-meter')

// creacion de metricas, en este caso es un contador que se llama http_endpoint (en grafana aparecera como http_endpoint_total)
const endpointAccessCounter = meter.createCounter('http_endpoint', {
  description: 'peticiones y la url',
})

// Middleware CORS para permitir solicitudes de cualquier origen
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  next()
})

// Middleware para loguear cada solicitud
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`) // Log sin trazabilidad
  logger.info(`${req.method} ${req.url}`) // Log con trazabilidad
  next()
})

// Rutas
app.get('/', (req, res) => {
  endpointAccessCounter.add(1, { url: '/' }) // Incrementa el contador de la métrica y le agrega un label llamado url con el valor '/' en este caso
  res.send('Hello World!')
})

app.get('/users', (req, res) => {
  res.send('users')
})

app.get('/error', (req, res) => {
  logger.error('Error en la solicitud')
  res.status(500).send('Error')
})

app.get('/warn', (req, res) => {
  logger.warn('Advertencia en la solicitud')
  res.status(400).send('Warning')
})

// Inicia el servidor
const PORT = 3001
app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`)
  logger.info(`Servidor iniciado en http://localhost:${PORT}`)
})
