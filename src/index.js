const recast = require('recast')
const {
  identifier: id,
  memberExpression,
  callExpression,
  blockStatement,
  arrowFunctionExpression
} = recast.types.builders
const t = recast.types.namedTypes

module.exports = function (source) {
  const ast = recast.parse(source, {
    parser: require('recast/parsers/babel')
  })
  let firstExp

  recast.visit(ast, {
    visitArrowFunctionExpression ({ node, parentPath }) {
      const parentNode = parentPath.node
      if (
        t.CallExpression.check(parentNode) &&
        t.Identifier.check(parentNode.callee.property) &&
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
        if (t.ArrowFunctionExpression.check(item)) {
          isArrowArg = true
        }
      })

      if (
        t.ExpressionStatement.check(firstExp) &&
        t.Identifier.check(node.callee.property) &&
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
