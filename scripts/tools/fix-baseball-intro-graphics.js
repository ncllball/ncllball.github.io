const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', '..', 'Baseball', 'index.html');
let html = fs.readFileSync(file, 'utf8');

const panelRegex =
  /(\s*<div class="ncll-card__body panel panel-intro">\s*<div class="ncll-card__details">)([\s\S]*?)(\s*<\/div>)(\s*<div class="ncll-card__graphics">([\s\S]*?)<\/div>)(\s*<\/div>)/g;

let updated = false;

html = html.replace(
  panelRegex,
  (match, prefix, details, detailsClose, graphicsWrap, panelClose) => {
    if (details.includes('ncll-card__graphics')) {
      return match;
    }

    let newDetails = details;
    const graphicsBlock = graphicsWrap.trimStart();

    if (newDetails.includes('<ul class="ncll-card__meta">')) {
      newDetails = newDetails.replace(
        '<ul class="ncll-card__meta">',
        `${graphicsBlock}\n                        <ul class="ncll-card__meta">`
      );
    } else {
      newDetails = `${newDetails}${graphicsBlock.startsWith('\n') ? '' : '\n'}${graphicsBlock}`;
    }

    updated = true;
    return `${prefix}${newDetails}${detailsClose}${panelClose}`;
  }
);

if (updated) {
  fs.writeFileSync(file, html, 'utf8');
  console.log('Updated intro graphics placement for Baseball cards.');
} else {
  console.log('No intro graphics adjustments were necessary.');
}
