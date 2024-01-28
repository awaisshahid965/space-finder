import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda'
import { spacesApiRequestController } from './api'

// eslint-disable-next-line require-await, @typescript-eslint/no-unused-vars
async function spacesHandler(event: APIGatewayProxyEvent, _: Context): Promise<APIGatewayProxyResult> {
  const response: APIGatewayProxyResult = spacesApiRequestController(event)
  return response
}

export { spacesHandler }
