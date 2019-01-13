const test = require('ava');
const path = require('path');
const fs = require('fs-extra');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebappWebpackPlugin = require('../');

const { logo, mkdir, generate, compare, expected } = require('./util');

test.beforeEach(async t => t.context.root = await mkdir());

test('should allow handling multiple html-webpack-plugin', async t => {
  const dist = path.join(t.context.root, 'dist');
  await generate({
    context: t.context.root,
    output: {
      path: dist,
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: 'a.html',
      }),
      new HtmlWebpackPlugin({
        filename: 'b.html',
      }),
      new WebappWebpackPlugin({
        logo,
        inject: htmlPlugin => htmlPlugin.options.filename === 'a.html',
      }),
    ],
  });

  t.deepEqual(await compare(dist, path.resolve(expected, 'multiplehtml')), []);
});

test.afterEach(t => fs.remove(t.context.root));
