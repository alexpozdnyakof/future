type Executor<T> = (resolve: (value: T) => void, reject: (reason?: any) => void) => void

enum FutureStatus {
  Pending,
  Resolved,
  Rejected,
}

interface Future<T = unknown> {
  then: (onFulfilled?: Function, onRejected?: Function) => Future
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
export default function Future<T = unknown>(executor: Executor<T>) {
  let resolvers: Array<Resolver<T>> = []
  let result: any
  let status: FutureStatus = FutureStatus.Pending

  const setState = (aValue: any, aStatus: FutureStatus) => {
    if (status !== FutureStatus.Pending) return

    result = aValue
    status = aStatus
    executeChain()
  }

  const resolve = (aValue: T) => async(() => setState(aValue, FutureStatus.Resolved))
  const reject = (aReason: any) => async(() => setState(aReason, FutureStatus.Rejected))

  async(() => executor(resolve, reject))

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

  return {
    then: <R1 = T, R2 = never>(onFulfilled?: null | ((value: T) => R1), onRejected?: null | ((reason: any) => R2)) =>
      Future(resolve => {
        resolvers.push({
          handleThen: (value: any) => {
            if (!onFulfilled) return
            resolve(onFulfilled(value))
          },
          handleCatch: reason => {
            if (!onRejected) return
            resolve(onRejected(reason))
          },
        })
        executeChain()
      }),
  }
}
