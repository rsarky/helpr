const issueParser = require('issue-parser')

module.exports = (body) => {
  const parse = issueParser('github')
  const parseResult = parse(body)
  let issues = []
  parseResult.actions.forEach(obj => issues.push(parseInt(obj.issue)))
  return issues
}
