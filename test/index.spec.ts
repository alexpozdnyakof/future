import FutureFactory from '../index'

describe('Future', () => {
  it('should return resolved value', async () => {
    await expect(FutureFactory(resolve => resolve('peanut butter'))).resolves.toBe('peanut butter')
  })

  it('should run thenable callback once', done => {
    const callback = jest.fn(v => v)
    FutureFactory(resolve => resolve('peanut butter'))
      .then(callback)
      .then(() => {
        expect(callback).toHaveBeenCalledTimes(1)
        done()
      })
  })
})
