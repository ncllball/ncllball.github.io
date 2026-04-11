content = open('c:/Tools/ncllball.github.io/Resources/uniforms-hub-v2.html', 'r', encoding='utf-8').read()

# ── 1. Add shirt-style radio inputs (before c-hat-sz radios) ─────────────
old1 = '\t\t\t\t<input type="radio" name="c-hat-sz" id="c-hat-youth-adj" />'
new1 = ('\t\t\t\t<input type="radio" name="c-shirt-style" id="c-shirt-style-st350" />\n'
        '\t\t\t\t<input type="radio" name="c-shirt-style" id="c-shirt-style-st550" />\n\n'
        '\t\t\t\t<input type="radio" name="c-hat-sz" id="c-hat-youth-adj" />')
assert content.count(old1) == 1, f'1: {content.count(old1)}'
content = content.replace(old1, new1)

# ── 2. Replace shirt next-enable CSS portion ─────────────────────────────
old2 = ('\t\t\t\t\t\t.unif-wizard:has(\n'
        '\t\t\t\t\t\t\t\t#c-shirt-axs:checked,\n'
        '\t\t\t\t\t\t\t\t#c-shirt-as:checked,\n'
        '\t\t\t\t\t\t\t\t#c-shirt-am:checked,\n'
        '\t\t\t\t\t\t\t\t#c-shirt-al:checked,\n'
        '\t\t\t\t\t\t\t\t#c-shirt-axl:checked,\n'
        '\t\t\t\t\t\t\t\t#c-shirt-axxl:checked,\n'
        '\t\t\t\t\t\t\t\t#c-shirt-axxxl:checked,\n'
        '\t\t\t\t\t\t\t\t#c-shirt-axxxxl:checked,\n'
        '\t\t\t\t\t\t\t\t#c-shirt-ws:checked,\n'
        '\t\t\t\t\t\t\t\t#c-shirt-wm:checked,\n'
        '\t\t\t\t\t\t\t\t#c-shirt-wl:checked,\n'
        '\t\t\t\t\t\t\t\t#c-shirt-wxl:checked,\n'
        '\t\t\t\t\t\t\t\t#c-shirt-wxxl:checked\n'
        '\t\t\t\t\t\t\t)\n'
        '\t\t\t\t\t\t\t.wiz-panel--shirt\n'
        '\t\t\t\t\t\t\t.wiz-btn--next,\n'
        '\t\t\t\t\t\t.unif-wizard:has(\n'
        '\t\t\t\t\t\t\t\t#c-hat-youth-adj:checked,')
assert content.count(old2) == 1, f'2: {content.count(old2)}'
new2 = ('\t\t\t\t\t\t/* BB TB/KCP/A/AA: size only */\n'
        '\t\t\t\t\t\t.unif-wizard:has(#c-sport-bb:checked):has(#c-div-tb:checked, #c-div-kcp:checked, #c-div-a:checked, #c-div-aa:checked):has(#c-shirt-axs:checked, #c-shirt-as:checked, #c-shirt-am:checked, #c-shirt-al:checked, #c-shirt-axl:checked, #c-shirt-axxl:checked, #c-shirt-axxxl:checked, #c-shirt-axxxxl:checked)\n'
        '\t\t\t\t\t\t\t.wiz-panel--shirt\n'
        '\t\t\t\t\t\t\t.wiz-btn--next,\n'
        '\t\t\t\t\t\t/* SB A/AA: size only */\n'
        '\t\t\t\t\t\t.unif-wizard:has(#c-sport-sb:checked):has(#c-div-a:checked, #c-div-aa:checked):has(#c-shirt-ws:checked, #c-shirt-wm:checked, #c-shirt-wl:checked, #c-shirt-wxl:checked, #c-shirt-wxxl:checked)\n'
        '\t\t\t\t\t\t\t.wiz-panel--shirt\n'
        '\t\t\t\t\t\t\t.wiz-btn--next,\n'
        '\t\t\t\t\t\t/* BB/SB AAA+: style + size required */\n'
        '\t\t\t\t\t\t.unif-wizard:has(#c-sport-bb:checked):has(#c-div-aaa:checked, #c-div-majors:checked, #c-div-juniors:checked, #c-div-seniors:checked):has(#c-shirt-style-st350:checked, #c-shirt-style-st550:checked):has(#c-shirt-as:checked, #c-shirt-am:checked, #c-shirt-al:checked, #c-shirt-axl:checked, #c-shirt-axxl:checked, #c-shirt-axxxl:checked)\n'
        '\t\t\t\t\t\t\t.wiz-panel--shirt\n'
        '\t\t\t\t\t\t\t.wiz-btn--next,\n'
        '\t\t\t\t\t\t.unif-wizard:has(#c-sport-sb:checked):has(#c-div-aaa:checked, #c-div-majors:checked, #c-div-juniors:checked, #c-div-seniors:checked):has(#c-shirt-style-st350:checked, #c-shirt-style-st550:checked):has(#c-shirt-as:checked, #c-shirt-am:checked, #c-shirt-al:checked, #c-shirt-axl:checked, #c-shirt-axxl:checked, #c-shirt-axxxl:checked)\n'
        '\t\t\t\t\t\t\t.wiz-panel--shirt\n'
        '\t\t\t\t\t\t\t.wiz-btn--next,\n'
        '\t\t\t\t\t\t.unif-wizard:has(\n'
        '\t\t\t\t\t\t\t\t#c-hat-youth-adj:checked,')
content = content.replace(old2, new2)

# ── 3. Replace shirt hover CSS ────────────────────────────────────────────
old3 = ('\t\t\t\t\t\t.unif-wizard:has(\n'
        '\t\t\t\t\t\t\t\t#c-shirt-axs:checked,\n'
        '\t\t\t\t\t\t\t\t#c-shirt-as:checked,\n'
        '\t\t\t\t\t\t\t\t#c-shirt-am:checked,\n'
        '\t\t\t\t\t\t\t\t#c-shirt-al:checked,\n'
        '\t\t\t\t\t\t\t\t#c-shirt-axl:checked,\n'
        '\t\t\t\t\t\t\t\t#c-shirt-axxl:checked,\n'
        '\t\t\t\t\t\t\t\t#c-shirt-axxxl:checked,\n'
        '\t\t\t\t\t\t\t\t#c-shirt-axxxxl:checked,\n'
        '\t\t\t\t\t\t\t\t#c-shirt-ws:checked,\n'
        '\t\t\t\t\t\t\t\t#c-shirt-wm:checked,\n'
        '\t\t\t\t\t\t\t\t#c-shirt-wl:checked,\n'
        '\t\t\t\t\t\t\t\t#c-shirt-wxl:checked,\n'
        '\t\t\t\t\t\t\t\t#c-shirt-wxxl:checked\n'
        '\t\t\t\t\t\t\t)\n'
        '\t\t\t\t\t\t\t.wiz-panel--shirt\n'
        '\t\t\t\t\t\t\t.wiz-btn--next:hover,\n'
        '\t\t\t\t\t\t.unif-wizard:has(\n'
        '\t\t\t\t\t\t\t\t#c-hat-youth-adj:checked,')
assert content.count(old3) == 1, f'3: {content.count(old3)}'
new3 = ('\t\t\t\t\t\t.unif-wizard:has(#c-sport-bb:checked):has(#c-div-tb:checked, #c-div-kcp:checked, #c-div-a:checked, #c-div-aa:checked):has(#c-shirt-axs:checked, #c-shirt-as:checked, #c-shirt-am:checked, #c-shirt-al:checked, #c-shirt-axl:checked, #c-shirt-axxl:checked, #c-shirt-axxxl:checked, #c-shirt-axxxxl:checked)\n'
        '\t\t\t\t\t\t\t.wiz-panel--shirt\n'
        '\t\t\t\t\t\t\t.wiz-btn--next:hover,\n'
        '\t\t\t\t\t\t.unif-wizard:has(#c-sport-sb:checked):has(#c-div-a:checked, #c-div-aa:checked):has(#c-shirt-ws:checked, #c-shirt-wm:checked, #c-shirt-wl:checked, #c-shirt-wxl:checked, #c-shirt-wxxl:checked)\n'
        '\t\t\t\t\t\t\t.wiz-panel--shirt\n'
        '\t\t\t\t\t\t\t.wiz-btn--next:hover,\n'
        '\t\t\t\t\t\t.unif-wizard:has(#c-sport-bb:checked):has(#c-div-aaa:checked, #c-div-majors:checked, #c-div-juniors:checked, #c-div-seniors:checked):has(#c-shirt-style-st350:checked, #c-shirt-style-st550:checked):has(#c-shirt-as:checked, #c-shirt-am:checked, #c-shirt-al:checked, #c-shirt-axl:checked, #c-shirt-axxl:checked, #c-shirt-axxxl:checked)\n'
        '\t\t\t\t\t\t\t.wiz-panel--shirt\n'
        '\t\t\t\t\t\t\t.wiz-btn--next:hover,\n'
        '\t\t\t\t\t\t.unif-wizard:has(#c-sport-sb:checked):has(#c-div-aaa:checked, #c-div-majors:checked, #c-div-juniors:checked, #c-div-seniors:checked):has(#c-shirt-style-st350:checked, #c-shirt-style-st550:checked):has(#c-shirt-as:checked, #c-shirt-am:checked, #c-shirt-al:checked, #c-shirt-axl:checked, #c-shirt-axxl:checked, #c-shirt-axxxl:checked)\n'
        '\t\t\t\t\t\t\t.wiz-panel--shirt\n'
        '\t\t\t\t\t\t\t.wiz-btn--next:hover,\n'
        '\t\t\t\t\t\t.unif-wizard:has(\n'
        '\t\t\t\t\t\t\t\t#c-hat-youth-adj:checked,')
content = content.replace(old3, new3)

# ── 4. Add style pill highlight + summary row CSS ────────────────────────
old4 = ('\t\t\t.unif-wizard:has(#c-sport-sb:checked):has(#c-div-a:checked, #c-div-aa:checked) .wiz-panel--shirt .shirt-block--sb-a-aa {\n'
        '\t\t\t\t\t\t\tdisplay: block;\n'
        '\t\t\t\t\t\t}\n\n'
        '\t\t\t.unif-wizard:has(#c-sport-sb:checked):has(')
assert content.count(old4) == 1, f'4: {content.count(old4)}'
new4 = ('\t\t\t.unif-wizard:has(#c-sport-sb:checked):has(#c-div-a:checked, #c-div-aa:checked) .wiz-panel--shirt .shirt-block--sb-a-aa {\n'
        '\t\t\t\t\t\t\tdisplay: block;\n'
        '\t\t\t\t\t\t}\n\n'
        '\t\t\t/* Shirt style pills */\n'
        '\t\t\t\t\t\t.unif-wizard:has(#c-shirt-style-st350:checked) label[for="c-shirt-style-st350"],\n'
        '\t\t\t\t\t\t.unif-wizard:has(#c-shirt-style-st550:checked) label[for="c-shirt-style-st550"] {\n'
        '\t\t\t\t\t\t\tborder-color: #1a3a6b;\n'
        '\t\t\t\t\t\t\tbackground: #1a3a6b;\n'
        '\t\t\t\t\t\t\tcolor: #fff;\n'
        '\t\t\t\t\t\t}\n\n'
        '\t\t\t/* Shirt-style summary row hidden by default; visible for style-choice divisions */\n'
        '\t\t\t\t\t\t.wiz-summary__row--shirt-style {\n'
        '\t\t\t\t\t\t\tdisplay: none;\n'
        '\t\t\t\t\t\t}\n'
        '\t\t\t\t\t\t.unif-wizard:has(#c-div-aaa:checked, #c-div-majors:checked, #c-div-juniors:checked, #c-div-seniors:checked) .wiz-summary__row--shirt-style {\n'
        '\t\t\t\t\t\t\tdisplay: flex;\n'
        '\t\t\t\t\t\t}\n\n'
        '\t\t\t.unif-wizard:has(#c-sport-sb:checked):has(')
content = content.replace(old4, new4)

# ── 5. Add sval CSS for shirt-style (before Hat comment in coach CSS) ─────
old5 = '\t\t\t/* Hat */\n\t\t\t\t\t\t#c-hat-youth-adj:checked ~ .wiz-body .sval--hat-youth-adj'
assert content.count(old5) == 1, f'5: {content.count(old5)}'
new5 = ('\t\t\t/* Shirt style */\n'
        '\t\t\t\t\t\t#c-shirt-style-st350:checked ~ .wiz-body .sval--shirt-style-st350 {\n'
        '\t\t\t\t\t\t\tdisplay: inline;\n'
        '\t\t\t\t\t\t}\n\n'
        '\t\t\t#c-shirt-style-st350:checked ~ .wiz-body .sval--shirt-style-none {\n'
        '\t\t\t\t\t\t\tdisplay: none;\n'
        '\t\t\t\t\t\t}\n\n'
        '\t\t\t#c-shirt-style-st550:checked ~ .wiz-body .sval--shirt-style-st550 {\n'
        '\t\t\t\t\t\t\tdisplay: inline;\n'
        '\t\t\t\t\t\t}\n\n'
        '\t\t\t#c-shirt-style-st550:checked ~ .wiz-body .sval--shirt-style-none {\n'
        '\t\t\t\t\t\t\tdisplay: none;\n'
        '\t\t\t\t\t\t}\n\n'
        '\t\t\t/* Hat */\n'
        '\t\t\t\t\t\t#c-hat-youth-adj:checked ~ .wiz-body .sval--hat-youth-adj')
content = content.replace(old5, new5)

# ── 6. Update both identical shirt blocks (bb-aaa-sr and sb-aaa-sr) ───────
old6 = ('both are valid, same sizing. Measure pit-to-pit to find your size.\n'
        '\t\t\t\t\t\t\t</p>\n'
        '\t\t\t\t\t\t\t\n'
        '\t\t\t\t\t\t\t<div class="wiz-options">')
assert content.count(old6) == 2, f'6: {content.count(old6)}'
new6 = ('same sizing, different collar. Measure pit-to-pit to find your size.\n'
        '\t\t\t\t\t\t\t</p>\n'
        '\t\t\t\t\t\t\t<p class="wiz-block-title">Pick Your Style</p>\n'
        '\t\t\t\t\t\t\t<div class="wiz-options">\n'
        '\t\t\t\t\t\t\t\t<label class="wiz-opt" for="c-shirt-style-st350">\n'
        '\t\t\t\t\t\t\t\t\tST350\n'
        '\t\t\t\t\t\t\t\t\t<span style="font-size: 0.85em; display: block; font-weight: 400; margin-top: 0.25em">No collar</span>\n'
        '\t\t\t\t\t\t\t\t</label>\n'
        '\t\t\t\t\t\t\t\t<label class="wiz-opt" for="c-shirt-style-st550">\n'
        '\t\t\t\t\t\t\t\t\tST550\n'
        '\t\t\t\t\t\t\t\t\t<span style="font-size: 0.85em; display: block; font-weight: 400; margin-top: 0.25em">Collared</span>\n'
        '\t\t\t\t\t\t\t\t</label>\n'
        '\t\t\t\t\t\t\t</div>\n'
        '\t\t\t\t\t\t\t<p class="wiz-block-title">Choose Your Size</p>\n'
        '\t\t\t\t\t\t\t<div class="wiz-options">')
content = content.replace(old6, new6)
# Also update the note text
content = content.replace(
    'Coaches in this division choose either the\n\t\t\t\t\t\t\t\t<strong>ST350</strong>\n\t\t\t\t\t\t\t\tor\n\t\t\t\t\t\t\t\t<strong>ST550</strong>\n\t\t\t\t\t\t\t\t&mdash; both are valid,',
    'Coaches in this division get the\n\t\t\t\t\t\t\t\t<strong>ST350</strong>\n\t\t\t\t\t\t\t\tor\n\t\t\t\t\t\t\t\t<strong>ST550</strong>\n\t\t\t\t\t\t\t\t&mdash;'
)

# ── 7. Add shirt-style row in coach summary before Hat row ────────────────
# Use "13: Womens 2XL" as unique prefix (only in coach summary)
old7 = ('13: Womens 2XL</span>\n'
        '\t\t\t\t\t\t\t\t</dd>\n'
        '\t\t\t\t\t\t\t</div>\n'
        '\t\t\t\t\t\t\t<div class="wiz-summary__row">\n'
        '\t\t\t\t\t\t\t\t<dt class="wiz-summary__label">Hat</dt>\n'
        '\t\t\t\t\t\t\t\t<dd class="wiz-summary__value">\n'
        '\t\t\t\t\t\t\t\t\t<span class="sval sval--none sval--hat-none">\u2014 not selected</span>\n'
        '\t\t\t\t\t\t\t\t\t<span class="sval sval--hat-youth-adj">1: Youth / Adjustable</span>')
assert content.count(old7) == 1, f'7: {content.count(old7)}'
new7 = ('13: Womens 2XL</span>\n'
        '\t\t\t\t\t\t\t\t</dd>\n'
        '\t\t\t\t\t\t\t</div>\n'
        '\t\t\t\t\t\t\t<div class="wiz-summary__row wiz-summary__row--shirt-style">\n'
        '\t\t\t\t\t\t\t\t<dt class="wiz-summary__label">Style</dt>\n'
        '\t\t\t\t\t\t\t\t<dd class="wiz-summary__value">\n'
        '\t\t\t\t\t\t\t\t\t<span class="sval sval--none sval--shirt-style-none">\u2014 not selected</span>\n'
        '\t\t\t\t\t\t\t\t\t<span class="sval sval--shirt-style-st350">ST350 (No Collar)</span>\n'
        '\t\t\t\t\t\t\t\t\t<span class="sval sval--shirt-style-st550">ST550 (Collared)</span>\n'
        '\t\t\t\t\t\t\t\t</dd>\n'
        '\t\t\t\t\t\t\t</div>\n'
        '\t\t\t\t\t\t\t<div class="wiz-summary__row">\n'
        '\t\t\t\t\t\t\t\t<dt class="wiz-summary__label">Hat</dt>\n'
        '\t\t\t\t\t\t\t\t<dd class="wiz-summary__value">\n'
        '\t\t\t\t\t\t\t\t\t<span class="sval sval--none sval--hat-none">\u2014 not selected</span>\n'
        '\t\t\t\t\t\t\t\t\t<span class="sval sval--hat-youth-adj">1: Youth / Adjustable</span>')
content = content.replace(old7, new7)

open('c:/Tools/ncllball.github.io/Resources/uniforms-hub-v2.html', 'w', encoding='utf-8').write(content)
print('Done.')
