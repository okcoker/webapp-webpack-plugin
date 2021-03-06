const test = require('ava');
const path = require('path');
const fs = require('fs-extra');
const WebappWebpackPlugin = require('../');

const { logo, generate, mkdir, compare, expected } = require('./util');

test.beforeEach(async t => t.context.root = await mkdir());

test('should generate the expected default result', async t => {
  const dist = path.join(t.context.root, 'dist');
  await generate({
    context: t.context.root,
    output: {
      path: dist,
    },
    plugins: [new WebappWebpackPlugin({ logo })]
  });

  t.deepEqual(await compare(dist, path.resolve(expected, 'default')), []);
});

test.afterEach(t => fs.remove(t.context.root));
