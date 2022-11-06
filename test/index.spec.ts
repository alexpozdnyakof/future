import Future from '../index'
import FutureFactory from '../index'

describe('Future', () => {
  it('should return resolved value', done => {
    FutureFactory(resolve => resolve('peanut butter')).then(v => {
      expect(v).toBe('peanut butter')
      done()
    })
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

  it('should be execute asynchronous', done => {
    let value = 0
    FutureFactory(resolve => ((value = 1), resolve(value)))
    expect(value).toBe(0)
    done()
  })

  it('should resolve inner future in first way', done => {
    Future(resolve => resolve(Future(resolve => resolve('peanut butter')))).then(value => {
      expect(value).toBe('peanut butter')
      done()
    })
  })
  it('should auto-reject resolved error', () => {
    const resolve = jest.fn()
    const reject = jest.fn()
    Future(resolve => resolve(new Error('resolve error')))
      .then(resolve, reject)
      .then(() => {
        expect(resolve).not.toHaveBeenCalled()
        expect(reject).toHaveBeenCalled()
      })
  })

  it('should resolve inner future before catch', done => {
    Future(resolve => resolve(Future((_, reject) => reject('rejected')))).catch(reason => {
      expect(reason).toBe('rejected')
      done()
    })
  })

  it('should catch error from reject', done => {
    const rejectError = new Error('rejected')
    Future((_, reject) => reject(rejectError)).catch((anError: Error) => {
      expect(anError).toBe(rejectError)
      done()
    })
  })

  it('should catch error from throw', done => {
    const rejectError = new Error('rejected')
    Future(() => {
      throw rejectError
    }).catch((anError: Error) => {
      expect(anError).toBe(rejectError)
      done()
    })
  })
})
