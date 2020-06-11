const recast = require('recast')
const {
  identifier: id,
  memberExpression,
  callExpression,
  blockStatement,
  arrowFunctionExpression,
  expressionStatement
} = recast.types.builders
const t = recast.types.namedTypes
const loaderUtils = require('loader-utils')

function printSource (source) {
  console.log(recast.print(source).code)
}

const DEFAULT = {
  type: 'normal' // normal 普通遍历注入  deep 深度循环注入
}

module.exports = function (source) {
  const options = { ...DEFAULT, ...loaderUtils.getOptions(this) }

  const ast = recast.parse(source, {
    parser: require('recast/parsers/babel')
  })

  switch (options.type) {
    case 'normal':
      recast.visit(ast, {
        visitCallExpression (path) {
          const { node } = path
          const arguments = node.arguments
    
          let assignExp
    
          arguments.forEach(item => {
            if (t.ArrowFunctionExpression.check(item)) {
              assignExp = item.body.body[0]

              // 默认箭头函数体
              const defaultExp = callExpression(
                memberExpression(id('console'), id('log')),
                [id('error')]
              )
              const defaultArrowFunc = arrowFunctionExpression([
                id('error')
              ], blockStatement([
                expressionStatement(defaultExp)
              ]))

              // 拼接的箭头函数执行语句为 then 方法中指定行数的表达式，否则直接取第一行表达式
              if (options.line !== undefined && item.body.body[options.line]) {
                assignExp = item.body.body[options.line]
              }

              // printSource(assignExp)
              // printSource(defaultExp)
              // printSource(defaultArrowFunc)
              // 确保 property 为 then，且指定执行语句为表达式
              if (
                t.ExpressionStatement.check(assignExp) &&
                t.Identifier.check(node.callee.property) &&
                node.callee.property.name === 'then'
              ) {
                let arrowFunc = arrowFunctionExpression([], blockStatement([assignExp]))
                
                // 如果不指定 catch 箭头函数表达式，则直接取默认箭头函数为拼接体
                if (options.line === undefined) {
                  arrowFunc = defaultArrowFunc
                }
                
                const originFunc = callExpression(node.callee, node.arguments)
                const catchFunc = callExpression(id('catch'), [arrowFunc])
                const newFunc = memberExpression(originFunc, catchFunc)
        
                path.replace(newFunc)
              }
            }
          })
    
          return false
        }
      })
      break
    case 'deep':
      recast.visit(ast, {
        visitCallExpression (path) {
          this.traverse(path)
    
          const { node } = path
          const parentNode = path.parentPath.node
          const arguments = node.arguments
          let assignExp
    
          arguments.forEach(item => {
            if (t.ArrowFunctionExpression.check(item)) {
              assignExp = item.body.body[0]

              // 默认箭头函数体
              const defaultExp = callExpression(
                memberExpression(id('console'), id('log')),
                [id('error')]
              )
              const defaultArrowFunc = arrowFunctionExpression([
                id('error')
              ], blockStatement([
                expressionStatement(defaultExp)
              ]))

              // 拼接的箭头函数执行语句为 then 方法中指定行数的表达式，否则直接取第一行表达式
              if (options.line !== undefined && item.body.body[options.line]) {
                assignExp = item.body.body[options.line]
              }
    
              if (
                t.ExpressionStatement.check(assignExp) &&
                t.Identifier.check(node.callee.property) &&
                node.callee.property.name === 'then'
              ) {
    
                if (t.Identifier.check(parentNode.property) && parentNode.property.name) {
                  return false
                }

                let arrowFunc = arrowFunctionExpression([], blockStatement([assignExp]))
                
                // 如果不指定 catch 箭头函数表达式，则直接取默认箭头函数为拼接体
                if (options.line === undefined) {
                  arrowFunc = defaultArrowFunc
                }
    
                // const arrowFunc = arrowFunctionExpression([], blockStatement([assignExp]))
                const originFunc = callExpression(node.callee, node.arguments)
                const catchFunc = callExpression(id('catch'), [arrowFunc])
                const newFunc = memberExpression(originFunc, catchFunc)
    
                path.replace(newFunc)
              }
            }
          })
        }
      })
      break
    default: throw new Error(`there is no ${options.type} type`); break
  }

  return recast.print(ast).code
}
