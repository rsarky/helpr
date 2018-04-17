const issueParser = require('issue-parser')

const parse = issueParser('github')

module.exports = (robot) => {
  // TODO: Comment on issue along with adding label on pull_request events.
  // TODO: pull_request.reopened?
  robot.on(['pull_request.opened',
    'pull_request.edited',
    'pull_request.closed'], pullHandler)

  async function pullHandler (context) {
    const { github, payload } = context
    const { merged, state, body } = payload.pull_request
    // Create the labels. TODO : Add a config file for labels and label colors.
    try {
      await Promise.all([
        github.issues.createLabel(context.repo({ name: 'pr-available', color: '1381ef' })),
        github.issues.createLabel(context.repo({ name: 'pr-merged', color: '1381ef' })),
        github.issues.createLabel(context.repo({ name: 'pr-rejected', color: '1381ef' }))
      ])
    } catch (e) { }

    const issueNum = parser(body)
    if (issueNum[0]) {
      context.log(`Issue ${issueNum} has been referenced.`)

      if (state === 'open') {

        // Remove pr-rejected label if it exists.
        try {
          let promises = []
          issueNum.forEach(ele => {
            promises.push(github.issues.removeLabel(context.repo({ number: ele, name: 'pr-rejected' })))
          })
          await Promise.all(promises)
        } catch (e) { }

        // Add label to the issues.
        let promises = []
        issueNum.forEach(ele => {
          promises.push(github.issues.addLabels(context.repo({ number: ele, labels: ['pr-available'] })))
        })
        await Promise.all(promises)

      }

      else if (state === 'closed') {
        // Remove pr-open label if it exists.
        try {
          let promises = []
          issueNum.forEach(ele => {
            promises.push(github.issues.removeLabel(context.repo({ number: ele, name: 'pr-available' })))
          })
          await Promise.all(promises)
        } catch (e) { }

        if (merged) {
          // Remove pr-rejected label if it exists.
          try {
            let promises = []
            issueNum.forEach(ele => {
              promises.push(github.issues.removeLabel(context.repo({ number: ele, name: 'pr-rejected' })))
            })
            await Promise.all(promises)
          } catch (e) { }
          // Add pr-merged label to issues
          let promises = []
          issueNum.forEach(ele => {
            promises.push(github.issues.addLabels(context.repo({ number: ele, labels: ['pr-merged'] })))
          })
          await Promise.all(promises)
        }
        else {
          let promises = []
          issueNum.forEach(ele => {
            promises.push(github.issues.addLabels(context.repo({ number: ele, labels: ['pr-rejected'] })))
          })
          await Promise.all(promises)
        }
      }
    }
  }

  function parser (body) {
    const parse_result = parse(body)
    let issues = []
    parse_result.actions.forEach(obj => issues.push(parseInt(obj.issue)))
    return issues
  }
}