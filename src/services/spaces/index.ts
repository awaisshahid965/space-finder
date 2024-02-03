import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda'
import { spacesApiRequestController } from './api'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { sendServerResponse } from './shared/utils'

const dynamoDBClient = new DynamoDBClient()

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function spacesHandler(event: APIGatewayProxyEvent, _: Context): Promise<APIGatewayProxyResult> {
  try {
    const response: APIGatewayProxyResult = await spacesApiRequestController(event, dynamoDBClient)
    return response
  } catch (err) {
    return sendServerResponse(500, {
      error: (err as Error).message ?? 'Internal Server Error!',
    })
  }
}

export { spacesHandler }
