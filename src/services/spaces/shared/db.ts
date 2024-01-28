import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb'
import { v4 } from 'uuid'
import { SpacesItem } from './types'

class SpacesTable {
  private readonly dbClient: DynamoDBClient

  constructor(dbClient: DynamoDBClient) {
    this.dbClient = dbClient
  }

  async insertOne(spaceDataItem: Omit<SpacesItem, 'id'>) {
    const randomId = v4()
    const saveSpaceItemCommand = new PutItemCommand({
      TableName: process.env.TABLE_NAME,
      Item: {
        id: {
          S: randomId,
        },
        location: {
          S: spaceDataItem.location,
        },
      },
    })

    await this.dbClient.send(saveSpaceItemCommand)
    return {
      id: randomId,
      location: spaceDataItem.location,
    } as SpacesItem
  }
}

export default SpacesTable
