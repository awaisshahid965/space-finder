import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda'
import { spacesApiRequestController } from './api'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

const dynamoDBClient = new DynamoDBClient()

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function spacesHandler(event: APIGatewayProxyEvent, _: Context): Promise<APIGatewayProxyResult> {
  const response: APIGatewayProxyResult = await spacesApiRequestController(event, dynamoDBClient)
  return response
}

export { spacesHandler }
