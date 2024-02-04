import { Amplify } from 'aws-amplify'
import { fetchAuthSession, signIn } from '@aws-amplify/auth'

Amplify.configure({
  // region: 'ap-south-1',
  Auth: {
    Cognito: {
      // identityPoolId: '',
      userPoolClientId: '3k7093obgaukcuq97dnnfepffe',
      userPoolId: 'ap-south-1_qAqJMJ4JY',
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
}

export default AuthService
