import { serialize } from 'next-mdx-remote/serialize';

const tests = [
  `<Table data={{ headers: ['A'], rows: [['1']] }} />`,
  `<Table headers="hello" />`,
  `<div className="foo">x</div>`,
  `<Callout title="Hi">body</Callout>`
];

for (const source of tests) {
  const result = await serialize(source, {}, true);
  const empty = result.compiledSource.includes(', {}, undefined');
  console.log(source.slice(0, 40), '-> empty props:', empty);
}
