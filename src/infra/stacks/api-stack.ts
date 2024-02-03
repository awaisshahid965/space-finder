import { Stack, StackProps } from 'aws-cdk-lib'
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway'
import { Construct } from 'constructs'

interface ApiStackProps extends StackProps {
  helloLanmbdaIntegration: LambdaIntegration
}

export class ApiStack extends Stack {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props)

    const spacesApi = new RestApi(this, 'SpacesApi')
    const spacesApiResource = spacesApi.root.addResource('spaces')
    spacesApiResource.addMethod('GET', props.helloLanmbdaIntegration)
  }
}
