const pullRequestOpened = require('./fixtures/pull-request.opened.json')
const pullRequestMerged = require('./fixtures/pull-request.merged.json')
const pullRequestRejected = require('./fixtures/pull-request.closed.json')
const { createRobot } = require('probot')
const app = require('../src')

describe('pull-handler', () => {
  let robot, github
  const event = {
    open: {
      event: 'pull_request',
      payload: pullRequestOpened
    },
    merged: {
      event: 'pull_request',
      payload: pullRequestMerged
    },
    rejected: {
      event: 'pull_request',
      payload: pullRequestRejected
    }
  }
  beforeEach(() => {
    robot = createRobot()
    app(robot)
    github = {
      issues: {
        createComment: jest.fn(),
        createLabel: jest.fn(),
        removeLabel: jest.fn(),
        addLabels: jest.fn()
      },
      repos: {
        getContent: jest.fn(() => {
          let obj = {
            code: 404
          }
          throw obj
        })
      }
    }
    robot.auth = () => Promise.resolve(github)
  })

  // Test for config file somehow.
  // it('config is defaultConfig if repo doesnt have a config.yml', async () => {
  //   await robot.receive(event)
  //   expect(config).toEqual(defaultConfig)
  // })
  it('tries to create the labels', async () => {
    await robot.receive(event.open)
    expect(github.issues.createLabel).toHaveBeenCalledTimes(3)
  })
// Payload contains 2 issue references.
  it('tries to remove rejected labels if pr is open', async () => {
    await robot.receive(event.open)
    expect(github.issues.removeLabel).toHaveBeenCalledTimes(2)
  })

  it('tries to remove rejected labels if pr is open', async () => {
    await robot.receive(event.open)
    expect(github.issues.addLabels).toHaveBeenCalledTimes(2)
  })

  it('removes pr open labels and pr rejected when pr is closed and merged', async () => {
    await robot.receive(event.merged)
    expect(github.issues.removeLabel).toHaveBeenCalledTimes(4)
  })

  it('Adds pr merged label if pr is merged', async () => {
    await robot.receive(event.merged)
    expect(github.issues.addLabels).toHaveBeenCalledTimes(2)
  })

  it('Adds pr rejected label if pr is rejected', async () => {
    await robot.receive(event.rejected)
    expect(github.issues.addLabels).toHaveBeenCalledTimes(2)
  })
})
