import { Amplify } from 'aws-amplify'
import { fetchAuthSession, signIn } from '@aws-amplify/auth'
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity'
import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers'

const USER_POOL_ID = 'ap-south-1_qAqJMJ4JY'
const USER_POOL_CLIENT_ID = '3k7093obgaukcuq97dnnfepffe'
const REGION = 'ap-south-1'
const IDENTITY_POOL_ID = 'ap-south-1:1512cca2-db10-490e-85aa-4bea017a32f6' // copied from console, CfnOutput

Amplify.configure({
  // region: 'ap-south-1',
  Auth: {
    Cognito: {
      // identityPoolId: '',
      userPoolClientId: USER_POOL_CLIENT_ID,
      userPoolId: USER_POOL_ID,
    },
  },
})

class AuthService {
  public static async login(username: string, password: string) {
    const authResponse = await signIn({ username, password })
    return authResponse
  }

  public static async loginUserAndPrintJWT(username: string, password: string) {
    await this.login(username, password)
    const authUser = await fetchAuthSession()
    // eslint-disable-next-line no-console
    console.log(authUser.tokens?.idToken?.toString())
  }

  public static async generateTemporaryCredentials(username: string, password: string) {
    await this.login(username, password)
    const authUser = await fetchAuthSession()
    const token = authUser.tokens?.idToken?.toString()
    const cognitoIdentityPool = `cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`
    const cognitoIdentity = new CognitoIdentityClient({
      credentials: fromCognitoIdentityPool({
        identityPoolId: IDENTITY_POOL_ID,
        logins: {
          [cognitoIdentityPool]: token ?? '',
        },
      }),
    })

    const credentials = await cognitoIdentity.config.credentials()
    return credentials
  }
}

export default AuthService
