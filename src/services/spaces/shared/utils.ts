export const sendServerResponse = <T extends object>(statusCode: number, body: T) => {
  return {
    statusCode,
    body: JSON.stringify(body),
  }
}
