const pullHandler = require('./pull-handler')

module.exports = (robot) => {
  robot.on(['pull_request.opened',
    'pull_request.edited',
    'pull_request.closed'], pullHandler)
}
