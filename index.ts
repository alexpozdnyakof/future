type Executor<T> = (resolve: (value: T | Future<T>) => void, reject: (reason?: any) => void) => void

enum FutureStatus {
  Pending,
  Resolved,
  Rejected,
}

interface Future<T = any> {
  then: <R1 = T, R2 = never>(
    onFulfilled?: null | ((value: T) => R1 | Future<R1>),
    onRejected?: null | ((reason: any) => R2 | Future<R2>)
  ) => Future<R1 | R2> | null | undefined
  catch: <R = never>(onRejected: null | ((reason: any) => R | Future<R>)) => Future<R>
}

interface Resolver<T> {
  handleThen: (value: T) => void
  handleCatch: (reason?: any) => void
}

const async = (fn: () => void) => {
  setTimeout(fn, 0)
}

const thenable = (x: { then?: Function }): x is Future => typeof x?.then === 'function'

/**
 * State transition
 * 1. Pending(default) -> undefined
 * 2. Resolved -> value
 * 3. Rejected -> reason
 * @param executor
 * @returns
 */
export default function Future<T = any>(executor: Executor<T>) {
  let resolvers: Array<Resolver<T>> = []
  let result: any
  let status: FutureStatus = FutureStatus.Pending

  const resolve = (aValue: T | Future<T>) => async(() => setState(aValue, FutureStatus.Resolved))
  const reject = (aReason: any) => async(() => setState(aReason, FutureStatus.Rejected))

  const setState = (aValue: any, aStatus: FutureStatus) => {
    if (status !== FutureStatus.Pending) return
    if (thenable(aValue)) {
      aValue.then(resolve, reject)
      return
    }

    result = aValue
    status = aStatus
    executeChain()
  }

  async(() => {
    try {
      executor(resolve, reject)
    } catch (e) {
      reject(e)
    }
  })

  const executeChain = () => {
    if (status === FutureStatus.Pending) return

    resolvers.forEach(({ handleThen, handleCatch }) => {
      if (status === FutureStatus.Resolved) {
        handleThen(result)
      } else {
        handleCatch(result)
      }
    })

    resolvers = []
  }

  const future = {
    then: <R1 = T, R2 = never>(
      onFulfilled?: null | ((value: T) => R1 | Future<R1>),
      onRejected?: null | ((reason: any) => R2 | Future<R2>)
    ) =>
      Future(resolve => {
        resolvers.push({
          handleThen: (value: any) => {
            if (!onFulfilled) {
              resolve(value)
            } else {
              try {
                resolve(onFulfilled(value) as R1 | Future<R1>)
              } catch (e) {
                reject(e)
              }
            }
          },
          handleCatch: reason => {
            if (!onRejected) {
              reject(reason)
            } else {
              try {
                resolve(onRejected(reason) as R2 | Future<R1 | R2>)
              } catch (e) {
                reject(e)
              }
            }
          },
        })
        executeChain()
      }),
    catch: <R = never>(onRejected?: (reason: any) => R | Future<R>) => future.then(undefined, onRejected),
  }

  return future
}
