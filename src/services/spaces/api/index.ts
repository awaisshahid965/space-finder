import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { HttpRequestMethod, SpacesItem } from '../shared/types'
import SpacesTable from '../shared/db'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { sendServerResponse } from '../shared/utils'

class SpacesApiController {
  private readonly spacesTable: SpacesTable

  constructor(spacesTable: SpacesTable) {
    this.spacesTable = spacesTable
  }

  async getSpaceItemById(id: string) {
    try {
      const spaceItem = await this.spacesTable.findById(id)

      if (!spaceItem) {
        throw new Error('No item found related to space id!')
      }

      return sendServerResponse(200, {
        item: spaceItem,
      })
    } catch (err) {
      return sendServerResponse(500, (err as Error).message)
    }
  }

  async getSpaceItems() {
    const spaceItems = await this.spacesTable.getAll()
    return sendServerResponse(200, {
      items: spaceItems,
    })
  }

  spacesApiGetRequestController(id?: string) {
    if (id) {
      return this.getSpaceItemById(id)
    }
    return this.getSpaceItems()
  }

  async spacesApiPostRequestController(spacesItem: Omit<SpacesItem, 'id'>) {
    const createdSpaceItem = await this.spacesTable.insertOne(spacesItem)
    return sendServerResponse(201, {
      item: createdSpaceItem,
    })
  }
}

const getSpacesApiRequestController = (dynamoDBClient: DynamoDBClient, event: APIGatewayProxyEvent) => {
  const body = JSON.parse(event.body ?? '{}')
  const id = event.queryStringParameters?.['id']
  const spacesController = new SpacesApiController(new SpacesTable(dynamoDBClient))

  return {
    [HttpRequestMethod.GET]: spacesController.spacesApiGetRequestController.bind(spacesController, id),
    [HttpRequestMethod.POST]: spacesController.spacesApiPostRequestController.bind(spacesController, body),
    [HttpRequestMethod.PUT]: () => {
      throw new Error('function not implemented yet')
    },
    [HttpRequestMethod.DELETE]: () => {
      throw new Error('function not implemented yet')
    },
  }
}

export const spacesApiRequestController = async (event: APIGatewayProxyEvent, dbClient: DynamoDBClient) => {
  const requestType = event.httpMethod.toUpperCase() as HttpRequestMethod
  const requestController = getSpacesApiRequestController(dbClient, event)[requestType]

  const response = await requestController()
  return response as APIGatewayProxyResult
}
