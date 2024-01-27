import { Stack, StackProps } from 'aws-cdk-lib'
import { ITable, Table as DynamoDBTable, AttributeType } from 'aws-cdk-lib/aws-dynamodb'
import { Construct } from 'constructs'
import { getSuffix } from '../utils'

export class DataStack extends Stack {
  public readonly spacesTable: ITable

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    this.spacesTable = new DynamoDBTable(this, 'SpacesTable', {
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
      tableName: `SpacesTable-${getSuffix(this)}`,
    })
  }
}
