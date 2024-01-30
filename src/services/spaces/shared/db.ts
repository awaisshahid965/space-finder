import { DynamoDBClient, GetItemCommand, PutItemCommand, ScanCommand } from '@aws-sdk/client-dynamodb'
import { v4 } from 'uuid'
import { SpacesItem } from './types'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'

const { TABLE_NAME } = process.env

class SpacesTable {
  private readonly dbClient: DynamoDBClient

  constructor(dbClient: DynamoDBClient) {
    this.dbClient = dbClient
  }

  async insertOne(spaceDataItem: Omit<SpacesItem, 'id'>) {
    const randomId = v4()
    const saveSpaceItemCommand = new PutItemCommand({
      TableName: TABLE_NAME,
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

  async findById(id: string) {
    const getSpaceItemCommand = new GetItemCommand({
      TableName: TABLE_NAME,
      Key: marshall({ id }),
    })
    const fetchedSpaceItemById = await this.dbClient.send(getSpaceItemCommand)

    if (!fetchedSpaceItemById.Item) {
      return null
    }
    return unmarshall(fetchedSpaceItemById.Item)
  }

  async getAll() {
    const getAllSpacesItemCommand = new ScanCommand({
      TableName: TABLE_NAME,
    })
    const dbSpaceItems = await this.dbClient.send(getAllSpacesItemCommand)
    return (dbSpaceItems.Items ?? []).map((item) => unmarshall(item))
  }
}

export default SpacesTable
