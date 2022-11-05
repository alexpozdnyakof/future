type Executor<T> = (resolve: (value: T) => void, reject?: (reason?: any) => void) => void

enum FutureStatus {
  Pending,
  Resolved,
  Rejected,
}

interface Future {
  then: (onFulfilled?: Function, onRejected?: Function) => Future
}

/**
 * State transition
 * 1. Pending(default) -> undefined
 * 2. Resolved -> value
 * 3. Rejected -> reason
 * @param executor
 * @returns
 */

interface Resolver<T> {
  handleThen: (value: T) => void
  handleCatch: (reason?: any) => void
}

export default function Future<T = unknown>(executor: Executor<T>) {
  let resolvers: Array<Resolver<T>> = []
  let result: any
  let status: FutureStatus = FutureStatus.Pending

  const setState = (aValue: any, aStatus: FutureStatus) => {
    if (status !== FutureStatus.Pending) return

    result = aValue
    status = aStatus
  }

  const resolve = (aValue: T) => setState(aValue, FutureStatus.Resolved)
  const reject = (aReason: any) => setState(aReason, FutureStatus.Rejected)

  executor(resolve, reject)

  const executeChain = () => {
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
    then: (onFulfilled?: Function, onRejected?: Function) =>
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
