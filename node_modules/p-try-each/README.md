# p-try-each [![Build Status](https://travis-ci.org/PedroMiguelSS/p-try-each.svg?branch=master)](https://travis-ci.org/PedroMiguelSS/p-try-each)

> Runs promise-returning functions in series but stops whenever any of the functions were successful. If all functions reject, the promise will be rejected with the error of the final task

Similar to [`async/tryEach`](https://caolan.github.io/async/v3/docs.html#tryEach).

## Install

```
npm install --save p-try-each
```

## Usage

```js
const pTryEach = require('p-try-each');

const tasks = [
  () => Promise.resolve('foo'),
  () => Promise.resolve('bar'),
  () => Promise.resolve('baz')
]

(async () => {
  const res = await pTryEach(tasks);
  console.log(res);
  // Logs:
  // 'foo'
})();
```

## API

### pTryEach(tasks)

Returns a `Promise` that is fulfilled with the value of the first fulfilled promise returned from calling the functions in `tasks`. If none is fulfilled, the promise will be rejected with the error of the final task.

#### tasks

Type: `Iterable<Function>`

Functions must return a value. In case of a returned promise, it will be awaited before starting with the next task.

## License

MIT
