const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node')
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics')
const { NodeSDK } = require('@opentelemetry/sdk-node')
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-grpc')
const {
  OTLPMetricExporter,
} = require('@opentelemetry/exporter-metrics-otlp-grpc')
const {
  LoggerProvider,
  BatchLogRecordProcessor,
} = require('@opentelemetry/sdk-logs')
const { OTLPLogExporter } = require('@opentelemetry/exporter-logs-otlp-grpc')
const { trace, context } = require('@opentelemetry/api')

// Configura los exportadores de OTLP
const url = 'http://localhost:4317'
const traceExporter = new OTLPTraceExporter({ url })
const metricExporter = new OTLPMetricExporter({ url })
const logExporter = new OTLPLogExporter({ url })

// Configuración del proveedor de logs
const loggerProvider = new LoggerProvider()
loggerProvider.addLogRecordProcessor(new BatchLogRecordProcessor(logExporter))
//loggerProvider.register()

// Función para crear logs con trazabilidad integrada
const logger = {
  log: (level, message) => {
    const span = trace.getSpan(context.active())
    const spanContext = span ? span.spanContext() : {}
    const traceId = spanContext.traceId || 'unknown'
    const spanId = spanContext.spanId || 'unknown'
    const logEntry = {
      body: message,
      severityText: level.toUpperCase(),
      attributes: {
        traceId,
        spanId,
      },
    }
    loggerProvider.getLogger('backend-logger').emit(logEntry)
  },
  info: (message) => logger.log('info', message),
  warn: (message) => logger.log('warn', message),
  error: (message) => logger.log('error', message),
}

// Configuración del SDK de OpenTelemetry
const sdk = new NodeSDK({
  serviceName: 'backend',
  namespace: 'development',
  traceExporter,
  metricReader: new PeriodicExportingMetricReader({
    exporter: metricExporter,
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': { enabled: false },
      '@opentelemetry/instrumentation-dns': { enabled: false },
    }),
  ],
})

// Inicia el SDK de OpenTelemetry
console.log('Tracing, metrics, and logs initialized')
sdk.start()
// Exporta el logger para usarlo en otras partes de la aplicación
module.exports = logger
