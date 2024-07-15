import { sum } from '../src/index'
describe('math', () => {
  test('sum', () => {
    expect(sum(1, 2)).toBe(3)
  })
})