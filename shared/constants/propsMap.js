'use strict';

const propsMap = {
  serverStatus: {
    ch: 'checking',
    sd: 'seeding',
    p: 'paused',
    c: 'complete',
    d: 'downloading',
    s: 'stopped',
    e: 'error',
    i: 'inactive',
    a: 'active'
  },

  clientStatus: {
    checking: 'ch',
    seeding: 'sd',
    paused: 'p',
    complete: 'c',
    downloading: 'd',
    stopped: 's',
    error: 'e',
    inactive: 'i',
    active: 'a'
  }
};

module.exports = propsMap;
