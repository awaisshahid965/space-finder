import { App } from 'aws-cdk-lib'
import { DataStack } from './stacks/data-stack'

const app = new App()

new DataStack(app, 'DataStack')
