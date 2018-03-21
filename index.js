module.exports = (robot) => {
  // TODO: Comment on issue along with adding label on pull_request events.
  // TODO: pull_request.reopened?
  robot.on(['pull_request.opened',
            'pull_request.edited',
            'pull_request.closed'], pullHandler)

  async function pullHandler (context) {
    const { github, payload } = context
    const merged = payload.pull_request.merged
    const state = payload.pull_request.state
    const body = payload.pull_request.body
    // Create the labels. TODO : Add a config file for labels and label colors.
    try {
      await Promise.all([
        github.issues.createLabel(context.repo({name: 'pr-available', color: '1381ef'})),
        github.issues.createLabel(context.repo({name: 'pr-merged', color: '1381ef'})),
        github.issues.createLabel(context.repo({name: 'pr-rejected', color: '1381ef'}))
      ])
    } catch (e) {}

    const issueNum = parse(body)
    if (issueNum) {
      context.log(`Issue ${issueNum} has been referenced.`)

      // Add label to the issue.
      if (state === 'open') {
        // Remove pr-rejected label if it exists.
        try {
          await github.issues.removeLabel(context.repo({number: issueNum, name: 'pr-rejected'}))
        } catch (e) {}
        await github.issues.addLabels(context.repo({number: issueNum, labels: ['pr-available']}))
      }
      else if (state === 'closed') {
        // Remove pr-open label if it exists.
        try {
          await github.issues.removeLabel(context.repo({number: issueNum, name: 'pr-available'}))
        } catch (e) {}

        if (merged) {
          // Remove pr-rejected label if it exists.
          try {
            await github.issues.removeLabel(context.repo({number: issueNum, name: 'pr-rejected'}))
          } catch (e) {}

          await github.issues.addLabels(context.repo({number: issueNum, labels: ['pr-merged']}))
        }
        else {
          await github.issues.addLabels(context.repo({number: issueNum, labels: ['pr-rejected']}))
        }
      }
    }
  }

  function parse (body) {
    const re = /\B#\d+\b/
    const found = body.match(re)
    if (found) {
      return parseInt(found[0].slice(1), 10)
    }
  }
}
