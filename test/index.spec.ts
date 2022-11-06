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

  it('should reject future', done => {
    const onRejected = jest.fn()
    FutureFactory((_, reject) => reject('peanut butter'))
      .then(null, onRejected)
      .then(() => {
        expect(onRejected).toHaveBeenCalledTimes(1)
        done()
      })
  })

  it('should be idempotent for resolved state', done => {
    const onFulfilled = jest.fn()
    const onRejected = jest.fn()
    FutureFactory(resolve => resolve('peanut butter'))
      .then(onFulfilled, onRejected)
      .then(() => {
        expect(onRejected).not.toHaveBeenCalled()
        expect(onFulfilled).toHaveBeenCalledTimes(1)
        done()
      })
  })

  it('should be idempotent for rejected state', done => {
    const onFulfilled = jest.fn()
    const onRejected = jest.fn()
    FutureFactory((_, reject) => reject('peanut butter'))
      .then(onFulfilled, onRejected)
      .then(() => {
        expect(onFulfilled).not.toHaveBeenCalled()
        expect(onRejected).toHaveBeenCalledTimes(1)
        done()
      })
  })
})
