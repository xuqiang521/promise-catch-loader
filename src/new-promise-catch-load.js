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
  // let firstExp

  // recast.visit(ast, {
  //   visitArrowFunctionExpression ({ node, parentPath }) {
  //     const parentNode = parentPath.node
  //     if (
  //       t.CallExpression.check(parentNode) &&
  //       t.Identifier.check(parentNode.callee.property) &&
  //       parentNode.callee.property.name === 'then'
  //     ) {
  //       firstExp = node.body.body[0]
  //     }
  //     return false
  //   }
  // })

  // recast.visit(ast, {
  //   visitCallExpression (path) {
  //     const { node } = path
  //     let isArrowArg = false
  //     let firstExp

  //     node.arguments.forEach(item => {
  //       if (t.ArrowFunctionExpression.check(item)) {
  //         isArrowArg = true
  //       }
  //     })

  //     const arguments = node.arguments

  //     arguments.forEach(item => {
  //       if (t.ArrowFunctionExpression.check(item)) {
  //         firstExp = item.body.body[0]
  //       }
  //     })

  //     if (
  //       t.ExpressionStatement.check(firstExp) &&
  //       t.Identifier.check(node.callee.property) &&
  //       node.callee.property.name === 'then' &&
  //       isArrowArg
  //     ) {
  //       const arrowFunc = arrowFunctionExpression([], blockStatement([firstExp]))
  //       const originFunc = callExpression(node.callee, node.arguments)
  //       const catchFunc = callExpression(id('catch'), [arrowFunc])
  //       const newFunc = memberExpression(originFunc, catchFunc)

  //       path.replace(newFunc)
  //     }

  //     return false
  //   }
  // })

  recast.visit(ast, {
    visitExpressionStatement (path) {
      // const { node } = path
      // const expression = node.expression
      const node = path.node.expression
      // printSource(node)
      if (t.CallExpression.check(node)) {
        // printSource(node.arguments)
        // console.log(t.Identifier.check(node.callee.property) && node.callee.property.name === 'then')
        if (t.Identifier.check(node.callee.property) && node.callee.property.name === 'then' && node.loc) {
          // const arguments = node.arguments
          printSource(node.arguments)
        }
        // arguments.forEach(item => {
        //   if (t.ArrowFunctionExpression.check(item)) {
        //     firstExp = item.body.body[0]
        //     if (
        //       t.ExpressionStatement.check(firstExp) &&
        //       t.Identifier.check(expression.callee.property) &&
        //       expression.callee.property.name === 'then'
        //     ) {
        //       const arrowFunc = arrowFunctionExpression([], blockStatement([firstExp]))
        //       const originFunc = callExpression(expression.callee, expression.arguments)
        //       const catchFunc = callExpression(id('catch'), [arrowFunc])
        //       const newFunc = memberExpression(originFunc, catchFunc)
        //       path.replace(newFunc)
        //     }
        //   }
        // })
      }

      return false
    }
  })

  return recast.print(ast).code
}
