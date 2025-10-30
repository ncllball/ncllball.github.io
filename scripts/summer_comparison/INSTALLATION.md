# Installation & Setup Guide

## Prerequisites

You need Node.js and npm installed to run the consolidation script.

### Check if Node.js is installed

```powershell
node --version
```

If you see a version number (like `v18.x.x` or `v20.x.x`), Node is installed.

### Check if npm is installed

```powershell
npm --version
```

If you see a version number, npm is installed.

## If Node.js/npm is NOT Installed

1. Download Node.js from: https://nodejs.org/
2. Install the LTS (Long Term Support) version
3. Restart your terminal/PowerShell
4. Verify: `node --version` and `npm --version`

## Installing Dependencies

Once Node.js and npm are installed:

```powershell
# Navigate to the repository root
cd c:\Tools\ncllball.github.io

# Install all dependencies
npm install
```

This will install:
- `csv-parse` - For reading CSV files
- `csv-stringify` - For writing CSV files

## Verifying Installation

After running `npm install`, you should see a `node_modules` folder:

```powershell
Test-Path "node_modules"
# Should return: True
```

## Troubleshooting

### "npm: The term 'npm' is not recognized"

**Problem**: npm is not in your PATH or not installed

**Solutions**:
1. **Reinstall Node.js** from https://nodejs.org/ (includes npm)
2. **Check PATH**: npm should be at `C:\Program Files\nodejs\npm.cmd`
3. **Restart terminal** after installing Node.js
4. **Use full path**: `& "C:\Program Files\nodejs\npm.cmd" install`

### "Cannot find module 'csv-parse/sync'"

**Problem**: Dependencies not installed

**Solution**:
```powershell
npm install
```

### Old Node.js version (v6.x)

**Problem**: You're running Node.js v6.14.0 which is very old

**Solution**:
1. Uninstall old Node.js
2. Download latest LTS from https://nodejs.org/
3. Install and restart terminal
4. Run `npm install` again

**Note**: Node v6 is from 2016 and many modern packages won't work with it.

## After Installation

Once dependencies are installed, you can run the script:

```powershell
# Dry run (preview)
node scripts/summer_comparison/consolidate.js

# Actually write the master file
node scripts/summer_comparison/consolidate.js --write

# With detailed progress
node scripts/summer_comparison/consolidate.js --write --verbose
```

## Alternative: Manual Installation

If npm isn't working, you can manually download the packages:

1. Go to: https://www.npmjs.com/package/csv-parse
2. Download the package
3. Extract to `node_modules/csv-parse`
4. Repeat for `csv-stringify`

(Not recommended - npm is much easier!)

## Getting Help

If you're still having issues:
1. Check Node.js version: `node --version` (should be v16 or higher)
2. Check npm version: `npm --version`
3. Try: `npm install --verbose` to see detailed output
4. Check if `node_modules` folder exists after install

