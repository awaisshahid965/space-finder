import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda'

// eslint-disable-next-line require-await, @typescript-eslint/no-unused-vars
async function handler(event: APIGatewayProxyEvent, context: Context) {
  const response: APIGatewayProxyResult = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'hello form ts function',
    }),
  }
  return response
}

export { handler }
