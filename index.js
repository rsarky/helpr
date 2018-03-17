module.exports = (robot) => {
  robot.on('pull_request.opened', pullHandler)
  robot.on('pull_request.edited', pullHandler)

  async function pullHandler (context) {
    const body = context.payload.pull_request.body
    const issueNum = parse(body)
    context.log(body)
    if (issueNum) {
      context.log(`Issue ${issueNum} has been referenced.`)
    }
  }

  function parse (body) {
    const re = /(^|\b)#\d+\b/
    const found = body.match(re)
    if (found) {
      return parseInt(found[0].slice(1), 10)
    }
  }
}
