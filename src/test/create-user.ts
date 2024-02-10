import AuthService from './auth-service'
;(async () => {
  await AuthService.loginUserAndPrintJWT('me.awais.1997@gmail.com', 'Awais123_')
})()
;(async () => {
  // eslint-disable-next-line no-console
  console.log(await AuthService.generateTemporaryCredentials('me.awais.1997@gmail.com', 'Awais123_'))
})()

/*
 ** command to verify cognito user
 ** aws cognito-idp admin-set-user-password --user-pool-id ap-south-1_qAqJMJ4JY --username awais --password "Awais123_" --permanent
 */
