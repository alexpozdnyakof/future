type Executor<T> = (resolve: (value: T) => void, reject?: (reason?: any) => void) => void

enum FutureStatus {
  Pending,
  Resolved,
  Rejected,
}

interface Future {
  then: (resolver: Function) => Future
}

/**
 * State transition
 * 1. Pending(default) -> undefined
 * 2. Resolved -> value
 * 3. Rejected -> reason
 * @param executor
 * @returns
 */

export default function Future<T = unknown>(executor: Executor<T>) {
  let resolvers: Array<Function> = []
  let result: any
  let status: FutureStatus = FutureStatus.Pending

  const setState = (aValue: any, aStatus: FutureStatus) => {
    if (status !== FutureStatus.Pending) return

    result = aValue
    status = aStatus
  }

  const resolve = (value: any) => setState(value, FutureStatus.Resolved)
  const reject = (reason: any) => setState(reason, FutureStatus.Resolved)

  executor(resolve)

  const executeChain = () => {
    resolvers.forEach(resolver => resolver(result))
    resolvers = []
  }

  return {
    then: (resolver: Function) => {
      return Future(resolve => {
        resolvers.push((value: any) => {
          resolve(resolver(value))
        })
        executeChain()
      })
    },
  }
}
