import swaggerUi from 'swagger-ui-express'
import * as swaggerDocument from './openapi.json'
import { Application } from 'express'

export function setupSwagger(app: Application): void {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
  console.log('[Swagger] Now running on /docs route')
}