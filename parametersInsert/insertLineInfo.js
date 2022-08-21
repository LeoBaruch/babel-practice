const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const types = require('@babel/types');
const generator = require('@babel/generator').default;

const sourceCode = `
    console.log(2, 1);

    function func() {
        console.info(2);
    }

    export default class Clazz {
        say() {
            console.debug(3);
        }
        render() {
            return <div>{console.error(4)}</div>
        }
    }
`;

const ast = parser.parse(sourceCode, {
  sourceType: 'unambiguous',
  plugins: ['jsx'],
});

traverse(ast, {
  CallExpression(path, state) {
    if (
      types.isMemberExpression(path.node.callee)
      && path.node.callee.object.name === 'console'
      && ['log', 'error', 'debug', 'info'].includes(path.node.callee.property.name)
    ) {
      const { line, column } = path.node.loc.start;
      // 插入一段文本节点
      path.node.arguments.unshift(types.stringLiteral(`lineInfo: ${line}, ${column}`));
    }
  },
});

const { code, map } = generator(ast);

console.log(code);
