#!/usr/bin/env python3
"""
Mirror cards from Tests/card-compare.html into hub files.

To update a card:
  1. Edit Tests/card-compare.html
  2. Run:  python Tests/update_cards.py

card-compare.html is the single source of truth.
Each card must start with its canonical HTML comment on its own line:
    <!-- Card: Background Check -->
    <!-- Card: Abuse Awareness Training -->
    <!-- Card: Diamond Leader Training -->
"""
import os

ROOT    = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
COMPARE = os.path.join(ROOT, 'Tests', 'card-compare.html')
COMPARE_INDENT = '            '   # 12-space base indent used in card-compare.html


# ─────────────────────────────────────────────────────────────────────────────
# I/O
# ─────────────────────────────────────────────────────────────────────────────

def read(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.readlines()

def write(path, lines):
    with open(path, 'w', encoding='utf-8') as f:
        f.writelines(lines)


# ─────────────────────────────────────────────────────────────────────────────
# Card extraction + transformation
# ─────────────────────────────────────────────────────────────────────────────

def extract_card(lines, comment):
    """Return lines from the card's HTML comment through </article> (inclusive)."""
    start = None
    for i, line in enumerate(lines):
        if comment in line:
            start = i
        if start is not None and i > start and line.strip() == '</article>':
            return lines[start : i + 1]
    return None

def transform_card(card_lines, from_prefix, to_prefix, from_indent, to_indent):
    """Replace prefix strings and re-indent every line."""
    result = []
    for line in card_lines:
        line = line.replace(from_prefix, to_prefix)
        if line.startswith(from_indent):
            line = to_indent + line[len(from_indent):]
        result.append(line)
    return result


# ─────────────────────────────────────────────────────────────────────────────
# Hub upsert logic
# ─────────────────────────────────────────────────────────────────────────────

def find_card_range(lines, comment, prefix):
    """Return (start_1idx, end_1idx) of the card in a hub file, or (None, None)."""
    start = None
    last_radio = None
    for i, line in enumerate(lines, 1):
        if comment in line:
            start = i
        if start is not None and f'name="{prefix}"' in line and 'type="radio"' in line:
            last_radio = i
        if last_radio is not None and i > last_radio and line.strip() == '</article>':
            return start, i
    return None, None

def upsert_card(lines, comment, prefix, card_lines, insert_after_comment=None, insert_after_prefix=None):
    """Replace the card if found; otherwise insert after the anchor card."""
    start, end = find_card_range(lines, comment, prefix)
    if start is not None:
        return lines[:start - 1] + card_lines + lines[end:]
    # Card not found — insert after anchor
    if insert_after_comment is None or insert_after_prefix is None:
        print(f'  WARNING: card not found and no insertion point given for: {comment}')
        return lines
    _, anchor_end = find_card_range(lines, insert_after_comment, insert_after_prefix)
    if anchor_end is None:
        print(f'  WARNING: anchor not found ({insert_after_comment}) for: {comment}')
        return lines
    return lines[:anchor_end] + ['\n'] + card_lines + lines[anchor_end:]


# ─────────────────────────────────────────────────────────────────────────────
# TARGETS — one entry per hub; cards listed in desired page order.
#
# Card entry: (comment, compare_suffix, insert_after_comment, insert_after_prefix)
#   comment              — the <!-- Card: X --> marker (same in compare + hubs)
#   compare_suffix       — suffix in card-compare  (e.g. 'bg' → prefix 'best-bg')
#   insert_after_comment — anchor comment if card needs to be inserted (or None)
#   insert_after_prefix  — radio-group prefix of that anchor card
# ─────────────────────────────────────────────────────────────────────────────

TARGETS = [
    {
        'path':   os.path.join(ROOT, 'Resources', 'volunteer-hub.html'),
        'indent': '            ',
        'prefix': 'vol',
        'cards': [
            ('<!-- Card: Abuse Awareness Training -->', 'abuse', None,                                     None),
            ('<!-- Card: Background Check -->',         'bg',    '<!-- Card: Abuse Awareness Training -->', 'vol-abuse'),
        ],
    },
    {
        'path':   os.path.join(ROOT, 'Programs', 'umpires-hub.html'),
        'indent': '                ',
        'prefix': 'umpires',
        'cards': [
            ('<!-- Card: Background Check -->',         'bg',    None,                                     None),
            ('<!-- Card: Abuse Awareness Training -->', 'abuse', '<!-- Card: Background Check -->',         'umpires-bg'),
        ],
    },
    {
        'path':   os.path.join(ROOT, 'Resources', 'coaches-hub.html'),
        'indent': '\t\t\t',
        'prefix': 'coach',
        'cards': [
            ('<!-- Card: Background Check -->',         'bg',    None,                                     None),
            ('<!-- Card: Abuse Awareness Training -->', 'abuse', '<!-- Card: Background Check -->',         'coach-bg'),
            ('<!-- Card: Diamond Leader Training -->',  'dl',    '<!-- Card: Abuse Awareness Training -->', 'coach-abuse'),
        ],
    },
]


# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────

compare_lines = read(COMPARE)

for target in TARGETS:
    path   = target['path']
    indent = target['indent']
    prefix = target['prefix']
    lines  = read(path)

    for comment, compare_suffix, ins_comment, ins_prefix in target['cards']:
        compare_prefix = f'best-{compare_suffix}'
        hub_prefix     = f'{prefix}-{compare_suffix}'

        raw = extract_card(compare_lines, comment)
        if raw is None:
            print(f'  WARNING: could not extract "{comment}" from card-compare.html')
            continue

        card_lines = transform_card(raw, compare_prefix, hub_prefix, COMPARE_INDENT, indent)
        lines = upsert_card(lines, comment, hub_prefix, card_lines, ins_comment, ins_prefix)

    write(path, lines)
    print(f'OK {os.path.basename(path)} updated')

print('\nDone. All hubs updated.')
