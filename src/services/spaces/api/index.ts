import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { HttpRequestMethod, SpacesItem } from '../shared/types'
import SpacesTable from '../shared/db'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

class SpacesApiController {
  private readonly spacesTable: SpacesTable

  constructor(spacesTable: SpacesTable) {
    this.spacesTable = spacesTable
  }

  spacesApiGetRequestController() {
    return {
      statusCode: 200,
      body: JSON.stringify('Hello from GET spaces handler'),
    }
  }

  async spacesApiPostRequestController(spacesItem: Omit<SpacesItem, 'id'>) {
    const createdSpaceItem = await this.spacesTable.insertOne(spacesItem)
    return this.sendSpacesSuccessResponse(createdSpaceItem)
  }

  sendSpacesSuccessResponse(spaceItem: SpacesItem): APIGatewayProxyResult {
    return {
      statusCode: 200,
      body: JSON.stringify(spaceItem),
    }
  }
}

const getSpacesApiRequestController = (dynamoDBClient: DynamoDBClient, body: SpacesItem) => {
  const spacesController = new SpacesApiController(new SpacesTable(dynamoDBClient))

  return {
    [HttpRequestMethod.GET]: spacesController.spacesApiGetRequestController.bind(spacesController),
    [HttpRequestMethod.POST]: spacesController.spacesApiPostRequestController.bind(spacesController, body),
    [HttpRequestMethod.PATCH]: () => {
      throw new Error('function not implemented yet')
    },
    [HttpRequestMethod.DELETE]: () => {
      throw new Error('function not implemented yet')
    },
  }
}

export const spacesApiRequestController = async (event: APIGatewayProxyEvent, dbClient: DynamoDBClient) => {
  const body = JSON.parse(event.body ?? '{}')
  const requestType = event.httpMethod.toUpperCase() as HttpRequestMethod
  const requestController = getSpacesApiRequestController(dbClient, body)[requestType]

  const response = await requestController()
  return response
}
