#!/usr/bin/env node
// Back-compat shim: call the centralized script location
const path = require('path');
const { execFileSync } = require('child_process');
execFileSync(process.execPath, [path.join(__dirname, '..', 'scripts', 'pd', 'build-pd-manifest.js')], { stdio: 'inherit' });
