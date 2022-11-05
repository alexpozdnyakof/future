import FutureFactory from '../index'

describe('Future', () => {
  it('should return resolved value', async () => {
    await expect(FutureFactory(resolve => resolve('peanut butter'))).resolves.toBe('peanut butter')
  })
})
