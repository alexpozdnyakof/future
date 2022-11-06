import FutureFactory from '../index'

describe('Future', () => {
  it('should return resolved value', done => {
    FutureFactory(resolve => resolve('peanut butter')).then(v => (expect(v).toBe('peanut butter'), done()))
  })

  it('should run thenable callback once', done => {
    const callback = jest.fn(v => v)
    FutureFactory(resolve => resolve('peanut butter'))
      .then(callback)
      .then(() => (expect(callback).toHaveBeenCalledTimes(1), done()))
  })

  it('should reject future', done => {
    const onRejected = jest.fn()
    FutureFactory((_, reject) => reject('peanut butter'))
      .then(null, onRejected)
      .then(() => (expect(onRejected).toHaveBeenCalledTimes(1), done()))
  })

  it('should be execute asynchronous', done => {
    let value = 0
    FutureFactory(resolve => ((value = 1), resolve(value)))
    expect(value).toBe(0)
    done()
  })

  it('should resolve inner future in first way', done => {
    FutureFactory(resolve => resolve(FutureFactory(resolve => resolve('peanut butter')))).then(
      value => (expect(value).toBe('peanut butter'), done())
    )
  })
  it('should auto-reject resolved error', () => {
    const [onFulfilled, onRejected] = [jest.fn(), jest.fn()]
    FutureFactory(resolve => resolve(new Error('resolve error')))
      .then(onFulfilled, onRejected)
      .then(() => (expect(onFulfilled).not.toHaveBeenCalled(), expect(onRejected).toHaveBeenCalled()))
  })

  it('should resolve inner future before catch', done => {
    FutureFactory(resolve => resolve(FutureFactory((_, reject) => reject('rejected')))).catch(
      reason => (expect(reason).toBe('rejected'), done())
    )
  })

  it('should catch error from reject', done => {
    const rejectError = new Error('rejected')
    FutureFactory((_, reject) => reject(rejectError)).catch(
      (anError: Error) => (expect(anError).toBe(rejectError), done())
    )
  })

  it('should catch error from throw', done => {
    const rejectError = new Error('rejected')
    FutureFactory(() => {
      throw rejectError
    }).catch((anError: Error) => (expect(anError).toBe(rejectError), done()))
  })

  it('should not change state after fulfilled', done => {
    FutureFactory((resolve, reject) => (resolve('resolved'), reject('rejected')))
      .catch(() => done.fail(new Error('should not be called')))
      .then(value => (expect(value).toBe('resolved'), done()))
  })

  it('should not change state after rejected', done => {
    FutureFactory((resolve, reject) => (reject('rejected'), resolve('resolved')))
      .then(() => done.fail('should not be called'))
      .catch(error => (expect(error).toBe('rejected'), done()))
  })

  it('should not run onRejected when resolved', done => {
    const [onFulfilled, onRejected] = [jest.fn(), jest.fn()]
    FutureFactory(resolve => resolve('peanut butter'))
      .then(onFulfilled, onRejected)
      .then(() => (expect(onRejected).not.toHaveBeenCalled(), expect(onFulfilled).toHaveBeenCalledTimes(1), done()))
  })

  it('should not run onResolved when rejected', done => {
    const [onFulfilled, onRejected] = [jest.fn(), jest.fn()]
    FutureFactory((_, reject) => reject('peanut butter'))
      .then(onFulfilled, onRejected)
      .then(() => (expect(onFulfilled).not.toHaveBeenCalled(), expect(onRejected).toHaveBeenCalledTimes(1), done()))
  })

  it('should chaining computation', done => {
    FutureFactory(resolve => resolve(0))
      .then(x => x + 1)
      .then(x => x + 1)
      .then(x => x + 1)
      .then(x => (expect(x).toBe(3), done()))
  })
})
