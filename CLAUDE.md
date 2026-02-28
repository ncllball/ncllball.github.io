# NCLL Project Instructions

## Hub Page URL Mapping

When linking to hub pages, use these canonical live URLs (not the GitHub Pages URLs):

| Local file | Live URL |
| --- | --- |
| `Resources/coaches-hub.html` | `https://www.ncllball.com/Default.aspx?tabid=2111982` |
| `Resources/events-hub.html` | `https://www.ncllball.com/Default.aspx?tabid=2244434` |
| `Resources/helping-hub.html` | `https://www.ncllball.com/Default.aspx?tabid=2246341` |
| `Resources/parents-hub.html` | `https://www.ncllball.com/Default.aspx?tabid=2111981` |
| `Resources/safety-hub.html` | `https://www.ncllball.com/Default.aspx?tabid=2245729` |
| `Resources/umpires-hub.html` | `https://www.ncllball.com/Default.aspx?tabid=2111983` |
| `Resources/uniforms-hub.html` | `https://www.ncllball.com/Default.aspx?tabid=2113971` |
| `Resources/volunteer-hub.html` | `https://www.ncllball.com/Default.aspx?tabid=2117276` |

## Canonical & og:url

For hub pages, both `rel="canonical"` and `og:url` should point to the canonical ncllball.com URL (not the GitHub Pages URL). Example for coaches-hub:

```html
<link href="https://www.ncllball.com/Default.aspx?tabid=2111982" rel="canonical" />
<meta property="og:url" content="https://www.ncllball.com/Default.aspx?tabid=2111982" />
```

## Images & Documents Root

All images, PDFs, and other static assets are served from:

`https://ncllball.github.io/images`

Example: a file at `images/2026-safety.pdf` → `https://ncllball.github.io/images/2026-safety.pdf`

## Standard Stylesheet Links

Every page uses these two stylesheet links in `<head>`:

```html
<link href="https://ncllball.github.io/css.css" rel="stylesheet" type="text/css" />
<link href="https://use.typekit.net/ldx2icb.css" rel="stylesheet" />
```

## HTML Attribute Conventions

`class` should be the first attribute on any element:

```html
<main class="coaches-landing" id="content" role="main">
<article class="ncll-card" aria-labelledby="...">
```
