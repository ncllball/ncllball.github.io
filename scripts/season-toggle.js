/**
 * NCLL Early Season Ramp Visibility Toggle
 * Automatically hides elements marked with class `early-season-visible` and data attribute
 * `data-season="early-ramp"` after June 1 (league year) and shows any with `early-season-hidden` if reversed.
 *
 * Safe for static GitHub Pages: runs client-side only. If JS blocked, manual state (HTML) persists.
 */
(function(){
  try {
    var today = new Date();
    var year = today.getFullYear();
    // June 1 boundary (month is 0-based: 5 = June)
    var cutoff = new Date(year, 5, 1, 0, 0, 0, 0);
    var isPostCutoff = today >= cutoff;
    var earlySections = document.querySelectorAll('[data-season="early-ramp"]');
    earlySections.forEach(function(sec){
      // If we're pre-cutoff in a new year and section was previously archived, restore automatically
      if(!isPostCutoff && sec.classList.contains('post-cutoff-archived')) {
        sec.classList.remove('early-season-hidden','post-cutoff-archived');
        sec.classList.add('early-season-visible');
      }

      // After cutoff: convert visible sections into archived collapsible blocks
      if(isPostCutoff && sec.classList.contains('early-season-visible')) {
        if(!sec.dataset.originalState){ sec.dataset.originalState = 'visible'; }
        var heading = sec.querySelector('h2, h3, h4');
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'early-ramp-toggle';
        btn.setAttribute('aria-expanded','false');
        btn.textContent = 'Show Early Season Ramp (Archived)';

        // Insert subtle archived note that appears only when expanded
        var note = document.createElement('p');
        note.className = 'archived-ramp-note';
        note.textContent = 'Archived early-season guidance: not active after June 1.';
        // We'll leave note inside section; section is hidden initially.
        // Ensure note sits just after the toggle button once inserted.

        btn.addEventListener('click', function(){
          var hidden = sec.classList.contains('early-season-hidden');
            if(hidden){
              sec.classList.remove('early-season-hidden');
              sec.classList.add('early-season-visible');
              btn.textContent = 'Hide Early Season Ramp (Archived)';
              btn.setAttribute('aria-expanded','true');
              note.style.display = '';
            } else {
              sec.classList.remove('early-season-visible');
              sec.classList.add('early-season-hidden');
              btn.textContent = 'Show Early Season Ramp (Archived)';
              btn.setAttribute('aria-expanded','false');
            }
        });

        // Start hidden post-cutoff
        sec.classList.remove('early-season-visible');
        sec.classList.add('early-season-hidden','post-cutoff-archived');

        // Insert button and note ahead of first heading
        if(heading && heading.parentNode){
          heading.parentNode.insertBefore(btn, heading);
          heading.parentNode.insertBefore(note, heading);
        } else if(sec.firstChild){
          sec.insertBefore(btn, sec.firstChild);
          sec.insertBefore(note, btn.nextSibling);
        } else {
          sec.appendChild(btn);
          sec.appendChild(note);
        }

        // Keep note hidden until expansion (section hidden anyway, but keep consistent if styles differ)
        note.style.display = 'none';
      }
    });
  } catch(e) {
    console && console.warn && console.warn('Season toggle script error', e);
  }
})();
