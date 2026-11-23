import assert from 'node:assert/strict';
import { test } from 'node:test';
import { evaluate, schemes, search } from './schemes.mjs';

test('the Telangana education demo retrieves ePASS in all three languages', () => {
  for (const query of ['Telangana scholarships', 'तेलंगाना के छात्रों के लिए कौन सी छात्रवृत्ति है?', 'తెలంగాణ కళాశాల విద్యార్థులకు ఏ స్కాలర్‌షిప్‌లు ఉన్నాయి?']) {
    assert.ok(search(query).some(scheme => scheme.id === 'epass'), query);
  }
});

test('directory honors category, supports search and leaves unknown schemes unresolved', () => {
  assert.equal(schemes.length, 10);
  assert.equal(search('crop insurance', 'Farmers')[0].id, 'pmfby');
  assert.deepEqual(search('unlisted fictional scheme xyz'), []);
});

test('missing and unmet pension rules remain distinct', () => {
  const scheme = schemes.find(record => record.id === 'ignoaps');
  assert.deepEqual(evaluate(scheme, { age: 59 }).failed, ['Age 60 or older']);
  assert.equal(evaluate(scheme, { age: 60 }).status, 'More information needed');
  assert.equal(evaluate(scheme, { age: 60, bpl: false }).status, 'Does not meet listed conditions');
  assert.equal(evaluate(scheme, { age: 60, bpl: true }).status, 'Potential match');
});

test('a state filter includes national and matching state records', () => {
  assert.deepEqual(search('', 'Students', 'Karnataka').map(scheme => scheme.id), ['csss']);
  assert.deepEqual(search('', 'Students', 'Telangana').map(scheme => scheme.id), ['epass', 'csss']);
});

test('ePASS applies welfare category and residence-specific income limits', () => {
  const scheme = schemes.find(record => record.id === 'epass');
  const profile = { state: 'Telangana', welfareCategory: 'BC', income: 175000, epassCourse: true, epassAge: true };
  assert.ok(evaluate(scheme, profile).missing.some(item => item.includes('residence')));
  assert.equal(evaluate(scheme, { ...profile, residence: 'Rural' }).status, 'Does not meet listed conditions');
  assert.equal(evaluate(scheme, { ...profile, residence: 'Urban' }).status, 'Potential match');
  assert.equal(evaluate(scheme, { ...profile, welfareCategory: 'SC', income: 250000 }).status, 'Potential match');
});
