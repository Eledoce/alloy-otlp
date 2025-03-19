import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { matchRoutes } from 'react-router-dom'
import App from './App.jsx'

// faro
import {
  initializeFaro,
  createReactRouterV6DataOptions,
  ReactIntegration,
  getWebInstrumentations,
} from '@grafana/faro-react'
import { TracingInstrumentation } from '@grafana/faro-web-tracing'

// Import OpenTelemetry
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web'
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base'
import { registerInstrumentations } from '@opentelemetry/instrumentation'
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch'

initializeFaro({
  // cambiar por el valor que da la seccion de frontend en grafana
  url: 'https://faro-collector-prod-us-east-0.grafana.net/collect/abcdefghx',
  app: {
    name: 'front-name', // cambiar el nombre de la app por el que pusieron en la seccion de frontend en grafana
    version: '1.0.0',
    environment: 'production',
  },
  sessionTracking: true,
  instrumentations: [
    ...getWebInstrumentations(),

    new TracingInstrumentation(),

    new ReactIntegration({
      router: createReactRouterV6DataOptions({
        matchRoutes,
      }),
    }),
  ],
})

// Initialize OpenTelemetry
const provider = new WebTracerProvider()

provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()))

provider.register()

registerInstrumentations({
  instrumentations: [
    new FetchInstrumentation({
      propagateTraceHeaderCorsUrls: /.*/, // Propaga `traceparent` a todas las URLs
    }),
  ],
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
