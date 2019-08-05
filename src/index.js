const recast = require('recast')
const {
  identifier: id,
  memberExpression,
  callExpression,
  blockStatement,
  arrowFunctionExpression
} = recast.types.builders
const t = recast.types.namedTypes

function printSource (source) {
  console.log(recast.print(source).code)
}

module.exports = function (source) {
  const ast = recast.parse(source, {
    parser: require('recast/parsers/babel')
  })

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

  return recast.print(ast).code
}
