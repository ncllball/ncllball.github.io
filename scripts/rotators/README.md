# Homepage rotator slides

Builds the 1110 x 510 slides for the ncllball.com homepage rotator from a small settings file.

## Make a slide

1. Copy a file in `slides/` (for example `2027-spring-game-on.json`) and change the wording and `output` name.
2. Run:

   ```
   python scripts/rotators/build.py scripts/rotators/slides/<your-slide>.json
   ```

3. Look at the three files in `scripts/rotators/out/` (git-ignored):
   - `<output>.png`: transparent corners. This is the one that goes on the site.
   - `<output>-dark.png`: same slide on a dark background, for previews and email.
   - `<output>-phone.png`: 360 px wide. If the date doesn't read here, shorten the text.
4. When it's final, copy `<output>.png` to `images/rotators/`, commit, push.

Needs Python with Pillow, Microsoft Edge (renders the page headless), and an internet connection (the Press Start 2P font loads from Google Fonts).

## Put it on the homepage

Sports Connect CMS > homepage > **Rotator** (admin bar) > **Add New Content**. Don't use Edit to swap an image; it doesn't reliably take.
Title (plain hyphens, no em dashes), URL, Sort Order > choose the PNG > **Upload** > **Crop** (required, or Save drops the image) > **Save Content**.
Lower sort order shows first. The CMS keeps it at 1110 x 520 and keeps the transparency.

## Templates

| Template | Look | Files |
|---|---|---|
| `retro-tv` | Chrome TV filling the frame; 8-bit night game (dusk sky, chain-link fence, NCLL-red players, on-deck circles with the NC logo) dimmed behind a big centred headline, a line, the date on a red bar, an action line, and a copyright line. NC badge on the top dial. | `retro-tv/`, `assets/chrome-tv.png` |
| chalkboard (not wired into build.py yet) | Chalkboard with chalk lettering, checklist, diamond and ice-cream doodles, NCLL badge | `chalkboard/make_chalk.py` |

### Slide settings (`retro-tv`)

| Key | Where it shows | Example |
|---|---|---|
| `score_left_red` / `score_left` / `score_right` | arcade line at the top | `1UP` / `000000` / `HI-SCORE 002027` |
| `headline` | big centre text | `GAME ON!` |
| `line` | line under it | `SPRING 2027 REGISTRATION OPENS` |
| `date_bar` | white on a red bar | `MON NOV 2` |
| `action` | after the cursor arrow | `CLICK TO START` |
| `copyright` | small, bottom (a © is added) | `2027 NORTH CENTRAL LITTLE LEAGUE` |

Layout numbers (where the game sits, light towers, dial badge) live at the top of `retro-tv/make_tv_wide.py` and `retro-tv/make_tv_full.py`.

## House style

- NCLL red `#c8102e`, black, white. Scene colours (grass, dirt, wood, chrome) are fine; no navy, yellow or light blue.
- Centre the composition; fill the frame; nothing touching the edges.
- One big headline, short lines, the key date on a red bar, an action verb (CLICK, PRESS, START), and the copyright line for the league name.
- Check the phone preview before it goes up.
