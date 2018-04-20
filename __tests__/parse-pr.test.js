const parser = require('../src/parse-pr')

test('Parses a string which contains 1 closing action', () => {
  expect(parser('Fixes #1')).toEqual([1])
})

test('Parses a string which contains 2 closing actions', () => {
  expect(parser('This test PR fixes #1 and it also closes #2')).toEqual([1, 2])
})

test('Parses a string which does not contain any references', () => {
  expect(parser('This PR does not fix anything')).toEqual([])
})

test('Parses a string which contains references that are not closing', () => {
  expect(parser('This PR fixes #1 and just refers #2')).toEqual([1])
})
