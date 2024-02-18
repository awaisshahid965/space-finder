import { Stack, StackProps } from 'aws-cdk-lib'
import {
  AuthorizationType,
  CognitoUserPoolsAuthorizer,
  Cors,
  LambdaIntegration,
  MethodOptions,
  Resource,
  ResourceOptions,
  RestApi,
} from 'aws-cdk-lib/aws-apigateway'
import { IUserPool } from 'aws-cdk-lib/aws-cognito'
import { Construct } from 'constructs'

enum HttpRequestMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

interface ApiStackProps extends StackProps {
  spacesLanmbdaIntegration: LambdaIntegration
  spacesUserPool: IUserPool
}

export class ApiStack extends Stack {
  private spacesApiAuthorizerId!: string

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props)

    const spacesApi = new RestApi(this, 'SpacesApi')
    const spacesApiResource = spacesApi.root.addResource('spaces', this.getResourceOptions())

    this.attachAuthorizationToSpacesApi(spacesApi, props.spacesUserPool)
    this.linkLambdaWithResourceVerbs(spacesApiResource, props.spacesLanmbdaIntegration, [
      HttpRequestMethod.GET,
      HttpRequestMethod.POST,
      HttpRequestMethod.PUT,
      HttpRequestMethod.DELETE,
    ])
  }

  private getResourceOptions(): ResourceOptions {
    return {
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
      },
    }
  }

  private attachAuthorizationToSpacesApi(spacesApi: RestApi, spacesUserPool: IUserPool) {
    const spacesApiAuthorizer = new CognitoUserPoolsAuthorizer(this, 'SpacesApiAuthorizer', {
      cognitoUserPools: [spacesUserPool],
      identitySource: 'method.request.header.Authorization',
    })

    spacesApiAuthorizer._attachToApi(spacesApi)
    this.spacesApiAuthorizerId = spacesApiAuthorizer.authorizerId
  }

  private spacesApiResourceOptions(): MethodOptions {
    return {
      authorizationType: AuthorizationType.COGNITO,
      authorizer: {
        authorizerId: this.spacesApiAuthorizerId,
      },
    }
  }

  private linkLambdaWithResourceVerbs(resource: Resource, lambda: LambdaIntegration, httpVerbs: HttpRequestMethod[]) {
    httpVerbs.map((httpVerb) => {
      resource.addMethod(httpVerb, lambda, this.spacesApiResourceOptions())
    })
  }
}
