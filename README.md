# Future is a custom Promise implementation

Why? Just 4 fun.

## Example

```typescript
const future = Future(resolve => resolve('in future'))
future.then(x => console.log({ x })) // {x: in future}
```

```typescript
FutureFactory(resolve => resolve(0))
  .then(x => x + 1)
  .then(x => x + 1)
  .then(x => x + 1) // 3
```

```typescript
const panic = new Error('Panic!')

FutureFactory((_, reject) => reject(new Error('Not Panic!')))
  .then(() => {
    throw panic
  })
  .catch(e => e)
```
