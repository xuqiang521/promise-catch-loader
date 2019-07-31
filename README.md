# promise-catch-loader

> 一个自动为 promise 注入 catch 语句的 webpack loader

开发中或多或少需要对 `Promise` 进行 `catch` 操作，而这些操作则会让你项目中代码变的臃肿，所以衍生出来 `promise-catch-loader` 这么一个 `webpack loader` 对你项目中的 `Promise` 自动注入 `catch` 操作的代码，解放了你的双手，也解决了臃肿冗余的问题

## Install

```bash
npm i promise-catch-loader -D
```

## Usage
```javascript
// webpack.config.js

module: {
  rules: [
    {
      test: /\.js$/,
      use: {
        loader: 'promise-catch-loader'
      }
    }
  ]
}

// vue.config.js
module.exports = {
  chainWebpack: config => {
    config.module
      .rule('js')
      .test(/\.js$/)
      .use('babel-loader').loader('babel-loader').end()
      .use('promise-catch-loader').loader('promise-catch-loader').end()
  }
}
```

```javascript
const p = new Promise()
let loading = true
p.then(res => {
  loading = false
  console.log('resolve')
})
```

引入 `promise-catch-loader` 后

```javascript
const p = new Promise()
let loading = true
p.then(res => {
  loading = false
  console.log('resolve')
}).catch(() => {
  loading = false
})
```
