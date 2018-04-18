const issueParser = require('issue-parser')

const parse = issueParser('github')

module.exports = (robot) => {
  // TODO: Comment on issue along with adding label on pull_request events.
  // TODO: pull_request.reopened?
  const default_config = {
    opened: 'pr-available',
    merged: 'pr-merged',
    rejected: 'pr-rejected'
  }

  robot.on(['pull_request.opened',
    'pull_request.edited',
    'pull_request.closed'], pullHandler)

  async function pullHandler (context) {
    const { github, payload } = context
    const { merged, state, body } = payload.pull_request
    const userConfig = await context.config('config.yml')
    const config = userConfig && userConfig.helpr ? {...default_config, ...userConfig.helpr} : default_config
    // Create the labels. TODO : Add a config file for labels and label colors.
    try {
      await Promise.all([
        github.issues.createLabel(context.repo({ name: config.opened, color: '363396' })),
        github.issues.createLabel(context.repo({ name: config.merged, color: '363396' })),
        github.issues.createLabel(context.repo({ name: config.rejected, color: '363396' }))
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
            promises.push(github.issues.removeLabel(context.repo({ number: ele, name: config.rejected })))
          })
          await Promise.all(promises)
        } catch (e) { }

        // Add label to the issues.
        let promises = []
        issueNum.forEach(ele => {
          promises.push(github.issues.addLabels(context.repo({ number: ele, labels: [config.opened] })))
        })
        await Promise.all(promises)

      }

      else if (state === 'closed') {
        // Remove pr-open label if it exists.
        try {
          let promises = []
          issueNum.forEach(ele => {
            promises.push(github.issues.removeLabel(context.repo({ number: ele, name: config.opened })))
          })
          await Promise.all(promises)
        } catch (e) { }

        if (merged) {
          // Remove pr-rejected label if it exists.
          try {
            let promises = []
            issueNum.forEach(ele => {
              promises.push(github.issues.removeLabel(context.repo({ number: ele, name: config.rejected })))
            })
            await Promise.all(promises)
          } catch (e) { }
          // Add pr-merged label to issues
          let promises = []
          issueNum.forEach(ele => {
            promises.push(github.issues.addLabels(context.repo({ number: ele, labels: [config.merged] })))
          })
          await Promise.all(promises)
        }
        else {
          let promises = []
          issueNum.forEach(ele => {
            promises.push(github.issues.addLabels(context.repo({ number: ele, labels: [config.rejected] })))
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