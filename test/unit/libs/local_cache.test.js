/* eslint-disable no-unused-expressions */
'use strict';

const sandbox = require('sinon').createSandbox();
const { expect } = require('chai');
const localCache = require('../../../libs/local_cache');

describe('libs/local_cache', () => {
  it('should return a object with a get function and a set function', () => {
    const cache = localCache();
    expect(cache).to.have.own.property('get');
    expect(cache.get).to.be.a('function');
    expect(cache).to.have.own.property('set');
    expect(cache.set).to.be.a('function');
  });

  it('should throw an error', () => {
    const cache = localCache();
    // get
    expect(() => cache.get()).to.throw();
    expect(() => cache.get('')).to.throw();
    expect(() => cache.get({})).to.throw();
    expect(() => cache.get(12)).to.throw();
    expect(() => cache.get('  ')).to.throw();
    // set
    expect(() => cache.set()).to.throw();
    expect(() => cache.set('')).to.throw();
    expect(() => cache.set({})).to.throw();
    expect(() => cache.set(12)).to.throw();
    expect(() => cache.set('  ')).to.throw();
  });

  it('should return null', () => {
    const cache = localCache();
    expect(cache.get('a')).to.be.null;
  });

  it('should return a string', () => {
    const cache = localCache();
    cache.set('key', 'value');
    expect(cache.get('key')).to.be.equal('value');
  });

  it('should return an array', () => {
    const cache = localCache();
    const value = ['value'];
    cache.set('key', value);
    expect(cache.get('key')).to.deep.equal(value);
  });

  it('should return an object', () => {
    const cache = localCache();
    const value = { key: 'value' };
    cache.set('key', value);
    expect(cache.get('key')).to.deep.equal(value);
  });

  it('should replace a string with an object', () => {
    const cache = localCache();
    cache.set('key', 'value');
    const value = { key: 'value' };
    cache.set('key', value);
    expect(cache.get('key')).to.deep.equal(value);
  });

  it('should replace an array with a string', () => {
    const cache = localCache();
    const value = ['value'];
    cache.set('key', value);
    cache.set('key', 'value');
    expect(cache.get('key')).to.be.equal('value');
  });

  it('should return value within 1000ms', () => {
    const timer = sandbox.useFakeTimers();
    const cache = localCache({ expiry: 1000 });
    cache.set('key', 'value');
    timer.tick(900);
    expect(cache.get('key')).to.be.equal('value');
    timer.restore();
  });

  it('should expire then return null over 1000ms', () => {
    const timer = sandbox.useFakeTimers();
    const cache = localCache({ expiry: 1000 });
    cache.set('key', 'value');
    timer.tick(1100);
    expect(cache.get('key')).to.be.null;
    timer.restore();
  });

  it('should be full then be deleted', () => {
    const cache = localCache({ capacity: 1 });
    cache.set('key', 'value');
    cache.set('key2', 'value2');
    expect(cache.get('key')).to.be.null;
    expect(cache.get('key2')).to.be.equal('value2');
  });

  it('should be full then the first one should be deleted', () => {
    const cache = localCache({ capacity: 2 });
    cache.set('key', 'value');
    cache.set('key2', 'value2');
    cache.set('key3', 'value3');
    expect(cache.get('key')).to.be.null;
    expect(cache.get('key2')).to.be.equal('value2');
    expect(cache.get('key3')).to.be.equal('value3');
  });
});
