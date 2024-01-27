exports.main = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Hello from Lambda! - ' + process.env.TABLE_NAME }),
  }
}
