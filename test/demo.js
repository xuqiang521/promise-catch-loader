this.p().then(res => {
  loading = false
  console.log('resolve')
})

foo().then(() => {
  console.log(123)
}).catch(() => {
  console.log('custom catch')
})