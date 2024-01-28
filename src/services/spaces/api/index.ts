import { APIGatewayProxyEvent } from 'aws-lambda'
import { HttpRequestMethod } from '../shared/types'

const spacesApiGetRequestController = () => {
  return {
    statusCode: 200,
    body: JSON.stringify('Hello from GET spaces handler'),
  }
}

const spacesApiPostRequestController = () => {
  return {
    statusCode: 200,
    body: JSON.stringify('Hello from POST spaces handler'),
  }
}

const getSpacesApiRequestController = {
  [HttpRequestMethod.GET]: spacesApiGetRequestController,
  [HttpRequestMethod.POST]: spacesApiPostRequestController,
  [HttpRequestMethod.PATCH]: () => {
    throw new Error('function not implemented yet')
  },
  [HttpRequestMethod.DELETE]: () => {
    throw new Error('function not implemented yet')
  },
}

export const spacesApiRequestController = (event: APIGatewayProxyEvent) => {
  const requestType = event.httpMethod.toUpperCase() as HttpRequestMethod
  const requestController = getSpacesApiRequestController[requestType]

  return requestController()
}
