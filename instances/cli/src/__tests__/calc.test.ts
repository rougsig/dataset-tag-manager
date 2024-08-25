import {sum} from '#/calc'
import {expect, test} from 'vitest'

test('sum 2 + 2 = 4', () => {
  expect(sum(2, 2)).toEqual(4)
})
