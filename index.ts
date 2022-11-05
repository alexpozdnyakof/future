type Executor = (resolve: (value: any) => void) => void

enum FutureStatus {
  Pending,
  Resolved,
}

export default function Future(executor: Executor) {
  let resolvers: Array<Function> = []
  let result: any
  let status: FutureStatus = FutureStatus.Pending

  const setState = (aValue: any, aStatus: FutureStatus) => {
    if (status !== FutureStatus.Pending) return

    result = aValue
    status = aStatus
  }
  const resolve = (value: any) => {
    setState(value, FutureStatus.Resolved)
  }

  executor(resolve)

  const executeChain = () => {
    resolvers.forEach(resolver => resolver(result))
    resolvers = []
  }

  return {
    then: (resolver: Function) => {
      resolvers.push(resolver)
      executeChain()
    },
  }
}
