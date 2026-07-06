# Forge Master — Build Tracker

A single-file, drag-and-drop build tracker for the mobile idle game **Forge Master**.
Track your gear, pets, mounts, skills, tech tree and ascension progress on a free-form
board, and see live build totals against community stat targets.

**Live:** https://roshanabady.github.io/forge-master-decision-tree/

## Features

- **Card board** — one card per gear slot, pet, mount and inventory item, freely draggable
  on a fixed 1800×1000 canvas that auto-fits your screen (wheel to zoom, drag empty space
  to pan, works with touch).
- **Substat tracking** — two substat slots per item with per-roll caps from the wiki;
  rolls at or near their cap get `MAX` / `~CAP` badges and a card glow.
- **Build summary** — aggregates DMG/HP and all substats from equipped items, applies
  Tech Tree mastery (+2%/node) and character level bonus, and shows progress against
  build-archetype targets (**Balanced / Crit / Skill**). Capped stats (Double Chance,
  Crit Chance) warn when rolls are wasted over the 100% effectiveness cap.
- **Rarity-aware** — full tier ladder (Common → Mythic for drops, Space → Interstellar →
  Multiverse → Quantum → Divine for forge tiers) with color-coded card ribbons.
- **Ascension tracker** — stars per pillar (Forge / Pets / Skills / Mounts) with level
  requirements and reset notes.
- **Equip rules** — 3 pet slots, 1 mount, matching the in-game limits; parked items are
  excluded from totals.
- **Persistence** — everything saves to IndexedDB (`forge-master-v9`) automatically;
  export/import the full build (including custom cards) as JSON. Deleted cards can be
  undone for 10 seconds; the trash button resets the whole board.

## Running

It's one static page — open `index.html` directly, or serve the folder:

```
npx serve .
```

## Data entry philosophy

Enter the DMG/HP numbers exactly as the game shows them per item — ascension and other
multipliers already active in-game are therefore baked in, and the tracker only applies
bonuses that aren't (tech tree mastery, character level %). K/M/B suffixes are accepted
(e.g. `13.5m`).

## Sources

- [Forge Master Wiki (Fandom)](https://forge-master.fandom.com/wiki/Forge_Master_Wiki) —
  [Substats](https://forge-master.fandom.com/wiki/Substats) ·
  [Tech Tree](https://forge-master.fandom.com/wiki/Tech_Tree) ·
  [Ascension](https://forge-master.fandom.com/wiki/Ascension)
- [ForgeMaster Helper & game guide](https://1vcian.me/ForgeMasterCalculator/guide.html)
- [Clashiverse guides](https://clashiverse.com/forge-master-beginner-guide/) —
  [pets](https://clashiverse.com/forge-master-pets-guide/) ·
  [mounts](https://clashiverse.com/forge-master-mount-guide/)
