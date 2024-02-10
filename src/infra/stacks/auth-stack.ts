import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib'
import {
  CfnIdentityPool,
  CfnIdentityPoolRoleAttachment,
  CfnUserPoolGroup,
  UserPool,
  UserPoolClient,
} from 'aws-cdk-lib/aws-cognito'
import { Construct } from 'constructs'
import { SpacesCognitoUserGroup } from '../../shared/types/cognito-user-groups'
import { FederatedPrincipal, Role } from 'aws-cdk-lib/aws-iam'

class AuthStack extends Stack {
  public userPool!: UserPool
  private userPoolClient!: UserPoolClient
  private identityPool!: CfnIdentityPool
  private authenticationRole!: Role
  private unAuthenticationRole!: Role
  private adminRole!: Role

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)
    this.createUserPool()
    this.createUserPoolClient()
    this.createCreateCognitoUserGroups()
    this.createIdentityPool()
    this.createRoles()
    this.attachRoles()
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

  private createIdentityPool() {
    this.identityPool = new CfnIdentityPool(this, 'SpaceIdentityPool', {
      allowUnauthenticatedIdentities: true,
      cognitoIdentityProviders: [
        {
          clientId: this.userPoolClient.userPoolClientId,
          providerName: this.userPool.userPoolProviderName,
        },
      ],
    })

    new CfnOutput(this, 'SpaceIdentyPoolId', {
      value: this.identityPool.ref,
    })
  }

  private createRoles() {
    this.authenticationRole = new Role(this, 'CognitoDefaultAuthenticatedRole', {
      assumedBy: new FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          StringEquals: {
            'cognito-identity.amazonaws.com:aud': this.identityPool.ref,
          },
          'ForAnyValue:StringLike': {
            'cognito-identity.amazonaws.com:amr': 'authenticated',
          },
        },
        'sts:AssumeRoleWithWebIdentity',
      ),
    })

    this.unAuthenticationRole = new Role(this, 'CognitoDefaultUnauthenticatedRole', {
      assumedBy: new FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          StringEquals: {
            'cognito-identity.amazonaws.com:aud': this.identityPool.ref,
          },
          'ForAnyValue:StringLike': {
            'cognito-identity.amazonaws.com:amr': 'unauthenticated',
          },
        },
        'sts:AssumeRoleWithWebIdentity',
      ),
    })

    this.adminRole = new Role(this, 'CognitoAdminRole', {
      assumedBy: new FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          StringEquals: {
            'cognito-identity.amazonaws.com:aud': this.identityPool.ref,
          },
          'ForAnyValue:StringLike': {
            'cognito-identity.amazonaws.com:amr': 'authenticated',
          },
        },
        'sts:AssumeRoleWithWebIdentity',
      ),
    })
  }

  private attachRoles() {
    new CfnIdentityPoolRoleAttachment(this, 'RolesAttachment', {
      identityPoolId: this.identityPool.ref,
      roles: {
        authenticated: this.authenticationRole.roleArn,
        unauthenticated: this.unAuthenticationRole.roleArn,
      },
      roleMappings: {
        adminsMappings: {
          type: 'Token',
          ambiguousRoleResolution: 'AuthenticatedRole',
          identityProvider: `${this.userPool.userPoolProviderName}:${this.userPoolClient.userPoolClientId}`,
        },
      },
    })
  }
}

export default AuthStack
