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
      return sendServerResponse(500, {
        error: (err as Error).message,
      })
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

  async spacesApiDeleteRequestController(id?: string) {
    try {
      if (!id) {
        throw new Error('Invalid SpaceItem ID!')
      }
      const deletedItem = await this.spacesTable.deleteById(id)
      return sendServerResponse(200, deletedItem)
    } catch (err) {
      return sendServerResponse(500, {
        error: (err as Error).message,
      })
    }
  }

  async spacesApiPutRequestController(spacesItem: SpacesItem): Promise<APIGatewayProxyResult> {
    if (!spacesItem.id) {
      throw new Error('Invalid SpaceItem ID!')
    }
    if (!spacesItem.location) {
      throw new Error('Invalid value for location field in Spaces Item')
    }
    const updatedSpacesItem = await this.spacesTable.updateById(spacesItem)
    return sendServerResponse(200, {
      item: updatedSpacesItem,
      updated: true,
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
    [HttpRequestMethod.PUT]: spacesController.spacesApiPutRequestController.bind(spacesController, body as SpacesItem),
    [HttpRequestMethod.DELETE]: spacesController.spacesApiDeleteRequestController.bind(spacesController, id),
  }
}

export const spacesApiRequestController = async (event: APIGatewayProxyEvent, dbClient: DynamoDBClient) => {
  const requestType = event.httpMethod.toUpperCase() as HttpRequestMethod
  const requestController = getSpacesApiRequestController(dbClient, event)[requestType]

  const response = await requestController()
  return response as APIGatewayProxyResult
}
