import { App } from 'aws-cdk-lib'
import { DataStack } from './stacks/data-stack'
import { LambdaStack } from './stacks/lambda-stack'
import { ApiStack } from './stacks/api-stack'

const app = new App()

const dataStack = new DataStack(app, 'DataStack')
const lambdaStack = new LambdaStack(app, 'LambdaStack', {
  spacesTable: dataStack.spacesTable,
})
new ApiStack(app, 'ApiStack', {
  helloLanmbdaIntegration: lambdaStack.helloLanmbdaIntegration,
})
