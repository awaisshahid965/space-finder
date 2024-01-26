import { App } from 'aws-cdk-lib'
import { DataStack } from './stacks/data-stack'
import { LambdaStack } from './stacks/lambda-stack'

const app = new App()

new DataStack(app, 'DataStack')
new LambdaStack(app, 'LambdaStack')
