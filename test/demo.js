this.p().then(res => {
  loading = false
  console.log('resolve')
  // this.b().then(res => {
  //   console.log('inner')
  // })
})

this.p().then(res => {
  console.log('resolve')
})

foo().then(() => {
  console.log(123)
}).catch(() => {
  console.log('custom catch')
})