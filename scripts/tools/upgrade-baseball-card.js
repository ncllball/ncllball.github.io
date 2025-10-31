const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', '..', 'Baseball', 'index.html');
const source = fs.readFileSync(filePath, 'utf8');

const legacyCardRegex =
  /<!--\s*[^>]*Division Card[^>]*-->\s*<article[^>]*>\s*<div class="ncll-card__top-layer">[\s\S]*?<\/article>/;

const match = source.match(legacyCardRegex);

if (!match) {
  console.log('No legacy baseball cards remain — all caught up!');
  process.exit(0);
}

const legacyBlock = match[0];

const grab = (regex, text, fallback = '') => {
  const m = text.match(regex);
  return m ? m[1] : fallback;
};

const grabWhole = (regex, text, fallback = '') => {
  const m = text.match(regex);
  return m ? m[0] : fallback;
};

const indent = (text, spaces) => {
  if (!text) return '';
  const pad = ' '.repeat(spaces);
  return text
    .split('\n')
    .map((line) => {
      const trimmed = line.trimEnd();
      return trimmed.length ? pad + trimmed : trimmed;
    })
    .join('\n');
};

const commentLabel = grab(/<!--\s*(.*?)\s*-->/, legacyBlock, 'Division Card');
const title = grab(/<h3 class="ncll-card__title"[^>]*>([\s\S]*?)<\/h3>/, legacyBlock, '').trim();
const metaInner = grab(/<ul class="ncll-card__meta">([\s\S]*?)<\/ul>/, legacyBlock, '').trim();
const heroImgTag = grabWhole(/<img[^>]*>/, legacyBlock, '').trim();
const detailBlock = grab(
  /<div class="ncll-card__body">\s*<div class="ncll-card__details">([\s\S]*?)<\/div>\s*<\/div>/,
  legacyBlock,
  ''
);
const footerActionsInner = grab(
  /<div class="ncll-card__sticky-footer"[^>]*>([\s\S]*?)<\/div>\s*<\/article>/,
  legacyBlock,
  ''
).trim();

const sections = [];
const sectionRegex = /<h4[^>]*>([\s\S]*?)<\/h4>([\s\S]*?)(?=<h4[^>]*>|\s*$)/g;
let sectionMatch;
while ((sectionMatch = sectionRegex.exec(detailBlock)) !== null) {
  sections.push({
    heading: sectionMatch[1].trim(),
    body: sectionMatch[2].trim()
  });
}

if (!sections.length) {
  console.error('Unable to parse detail panels for card:', title);
  process.exit(1);
}

const introSection = sections[0];
const detailSections = sections.slice(1);

const baseToken = (() => {
  const candidateSource = commentLabel
    .replace(/Card/gi, '')
    .replace(/Division/gi, '')
    .trim() || title;
  const tokens = candidateSource.toLowerCase().match(/[a-z0-9]+/g);
  if (!tokens || !tokens.length) return 'legacy';
  return tokens[0];
})();

const slugBase = `uniforms-baseball-${baseToken}`;
const shortSlug = baseToken;
const hasHero = Boolean(heroImgTag);

if (footerActionsInner && detailSections.length) {
  const lastDetail = detailSections[detailSections.length - 1];
  lastDetail.body += `\n                        <div class="ncll-card__cta">\n${indent(
    footerActionsInner,
    28
  )}\n                        </div>`;
}

const buildActionButtons = (includeBackForLast) => {
  const btns = [];
  btns.push(
    `                    <label class="button button--primary btn-next btn-next-intro"\n                        for="${slugBase}-0">Next</label>`
  );
  detailSections.forEach((_, idx) => {
    const isLast = idx === detailSections.length - 1;
    const target = isLast ? `${slugBase}-intro` : `${slugBase}-${idx + 1}`;
    const label = isLast && includeBackForLast ? 'Back' : 'Next';
    btns.push(
      `                    <label class="button button--primary btn-next btn-next-${idx}"\n                        for="${target}">${label}</label>`
    );
  });
  return btns.join('\n');
};

const headerActions = [
  `                <div class="ncll-card__sticky-footer actions" role="group" aria-label="${title} card controls">`,
  buildActionButtons(true),
  '                </div>'
].join('\n');

const footerActions = [
  `                <div class="ncll-card__sticky-footer actions" role="group"\n                    aria-label="${title} card controls (footer)">`,
  buildActionButtons(true),
  '                </div>'
].join('\n');

const detailPanels = detailSections
  .map((section, idx) => {
    return (
      `                <div class="ncll-card__body panel panel${idx}">\n` +
      `                    <div class="ncll-card__details">\n` +
      `                        <h4>${section.heading}</h4>\n` +
      indent(section.body, 24) +
      `\n                    </div>\n` +
      `                </div>`
    );
  })
  .join('\n\n');

const metaListMarkup = metaInner
  ? `                        <ul class="ncll-card__meta">\n${indent(metaInner, 28)}\n                        </ul>`
  : '';

const heroThumbMarkup = hasHero
  ? `                        <div class="ncll-card__graphics">\n                            <label for="lightbox-baseball-${shortSlug}-1" class="lightbox-thumb">\n${indent(
      heroImgTag,
      32
    )}\n                            </label>\n                        </div>`
  : '';

const heroLightboxMarkup = hasHero
  ? `\n                <label for="lightbox-baseball-${shortSlug}-1" class="lightbox" data-id="1" role="dialog" aria-modal="true"\n                    aria-label="Enlarged ${title} illustration" tabindex="0">\n                    <span>Close image</span>\n                    <span class="close-btn" aria-hidden="true">&times;</span>\n${indent(
      heroImgTag,
      20
    )}\n                </label>`
  : '';

const heroCheckboxLine = hasHero
  ? `                <input type="checkbox" id="lightbox-baseball-${shortSlug}-1" class="lightbox-toggle">`
  : '';

let introDetailsContent = indent(introSection.body, 24);
if (heroThumbMarkup) {
  introDetailsContent += `\n${heroThumbMarkup}`;
}
if (metaListMarkup) {
  introDetailsContent += `\n${metaListMarkup}`;
}

const introPanel =
  `                <div class="ncll-card__body panel panel-intro">\n` +
  `                    <div class="ncll-card__details">\n` +
  `                        <h4>${introSection.heading}</h4>\n` +
  `${introDetailsContent}\n` +
  `                    </div>\n` +
  `                </div>`;

const newBlock = [
  `<!-- ${commentLabel} -->`,
  `            <article id="${slugBase}-toggle"\n                class="ncll-card ncll-card--division ncll-card--overlay ncll-card--toggle"\n                aria-labelledby="${slugBase}-h3">`,
  `                <input type="radio" name="${slugBase}" id="${slugBase}-intro" checked>`,
  ...detailSections.map((_, idx) => `                <input type="radio" name="${slugBase}" id="${slugBase}-${idx}">`),
  heroCheckboxLine,
  '',
  `                <div class="ncll-card__sticky-heading" aria-hidden="true">\n                    <h3 class="ncll-card__title" id="${slugBase}-h3">${title}</h3>\n${headerActions}\n                </div>`,
  '',
  introPanel,
  '',
  detailPanels,
  '',
  footerActions,
  heroLightboxMarkup,
  '            </article>'
].join('\n');

const updated = source.replace(legacyBlock, newBlock);
fs.writeFileSync(filePath, updated, 'utf8');

console.log(`Migrated card: ${title}`);

