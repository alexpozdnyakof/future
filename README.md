# Future is a custom Promise implementation

Why? Just 4 fun.


## Example

```typescript
const future = Future(resolve => resolve('in future'))

future.then(x => console.log({x})) // {x: in future}

```