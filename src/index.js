const recast = require('recast')
const {
  identifier: id,
  memberExpression,
  callExpression,
  blockStatement,
  arrowFunctionExpression
} = recast.types.builders
const TNT = recast.types.namedTypes

module.exports = function (source) {
  const ast = recast.parse(source, {
    parser: require('recast/parsers/babel')
  })
  let firstExp

  recast.visit(ast, {
    visitArrowFunctionExpression ({ node, parentPath }) {
      const parentNode = parentPath.node
      if (
        TNT.CallExpression.check(parentNode) &&
        TNT.Identifier.check(parentNode.callee.property) &&
        parentNode.callee.property.name === 'then'
      ) {
        firstExp = node.body.body[0]
      }
      return false
    }
  })

  recast.visit(ast, {
    visitCallExpression (path) {
      const { node } = path
      let isArrowArg = false

      node.arguments.forEach(item => {
        if (TNT.ArrowFunctionExpression.check(item)) {
          isArrowArg = true
        }
      })

      if (
        TNT.ExpressionStatement.check(firstExp) &&
        TNT.Identifier.check(node.callee.property) &&
        node.callee.property.name === 'then' &&
        isArrowArg
      ) {
        const arrowFunc = arrowFunctionExpression([], blockStatement([firstExp]))
        const originFunc = callExpression(node.callee, node.arguments)
        const catchFunc = callExpression(id('catch'), [arrowFunc])
        const newFunc = memberExpression(originFunc, catchFunc)

        path.replace(newFunc)
      }

      return false
    }
  })

  return recast.print(ast).code
}
