import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib'
import { CfnUserPoolGroup, UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito'
import { Construct } from 'constructs'
import { SpacesCognitoUserGroup } from '../../shared/types/cognito-user-groups'

class AuthStack extends Stack {
  public userPool!: UserPool
  private userPoolClient!: UserPoolClient

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)
    this.createUserPool()
    this.createUserPoolClient()
    this.createCreateCognitoUserGroups()
  }

  private createUserPool() {
    this.userPool = new UserPool(this, 'SpaceUserPool', {
      selfSignUpEnabled: true,
      signInAliases: {
        username: true,
        email: true,
      },
    })

    new CfnOutput(this, 'SpaceUserPoolId', {
      value: this.userPool.userPoolId,
    })
  }

  private createUserPoolClient() {
    this.userPoolClient = this.userPool.addClient('SpaceUserPoolClient', {
      authFlows: {
        adminUserPassword: true,
        custom: true,
        userPassword: true,
        userSrp: true,
      },
    })

    new CfnOutput(this, 'SpaceUserPoolClientId', {
      value: this.userPoolClient.userPoolClientId,
    })
  }

  private createCreateCognitoUserGroups() {
    new CfnUserPoolGroup(this, 'SpaceAdmin', {
      userPoolId: this.userPool.userPoolId,
      groupName: SpacesCognitoUserGroup.ADMIN,
    })

    new CfnUserPoolGroup(this, 'SpaceUser', {
      userPoolId: this.userPool.userPoolId,
      groupName: SpacesCognitoUserGroup.USER,
    })
  }
}

export default AuthStack
