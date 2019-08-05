const recast = require('recast')
const {
  identifier: id,
  memberExpression,
  callExpression,
  blockStatement,
  arrowFunctionExpression
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
  console.log(options)

  const ast = recast.parse(source, {
    parser: require('recast/parsers/babel')
  })

  switch (options.type) {
    case 'normal':
      recast.visit(ast, {
        visitCallExpression (path) {
          const { node } = path
          const arguments = node.arguments
    
          let firstExp
    
          arguments.forEach(item => {
            if (t.ArrowFunctionExpression.check(item)) {
              firstExp = item.body.body[0]
    
              if (
                t.ExpressionStatement.check(firstExp) &&
                t.Identifier.check(node.callee.property) &&
                node.callee.property.name === 'then'
              ) {
                const arrowFunc = arrowFunctionExpression([], blockStatement([firstExp]))
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
          let firstExp
    
          arguments.forEach(item => {
            if (t.ArrowFunctionExpression.check(item)) {
              firstExp = item.body.body[0]
    
              if (
                t.ExpressionStatement.check(firstExp) &&
                t.Identifier.check(node.callee.property) &&
                node.callee.property.name === 'then'
              ) {
    
                if (t.Identifier.check(parentNode.property) && parentNode.property.name) {
                  return false
                }
    
                const arrowFunc = arrowFunctionExpression([], blockStatement([firstExp]))
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
