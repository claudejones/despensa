# Pueblo: game spec

Working title. A mobile-first game set in a Yucatán-peninsula town, where you learn conversational Spanish by shopping, paying, travelling and talking. This document records what has been decided, what is proposed and still needs your call, and what must be verified before it is built on.

- Design system: https://claude.ai/artifact/HJzmVnaVs5aQFM2pMs2jxL
- Screens: https://claude.ai/artifact/L7kiab86wXSpqT2R3GNbgN
- Research notes: `docs/research-m3.md`. Art notes: `art/README.md`. Market word list: `content/mercado.json`. Plan: `docs/production-plan.md`.

Marks used below: **Decided** (you said so), **Proposed** (my design, not yet confirmed by you), **VERIFY** (unproven; must be checked before it is relied on).

## 1. Pillars

1. Learning is the mechanic. If a challenge can be won without understanding the Spanish, it is cut.
2. The picture rule. A picture or icon sits only beside the English. Spanish answers are text only. **Decided.**
3. Hands, not lists. You drag, slide, count out coins and key in numbers.
4. Nothing is locked. Every place and challenge is open from day one; the game suggests a next step. **Decided.**
5. Short sessions. One challenge is two to three minutes, one-handed.
6. The town remembers. What you know shows in the town, and fades when you forget.
7. New, not ported. The old training tool supplies content and lessons only; no code or look carries over. **Decided.**

## 2. The town

Eight places, each with one townsperson, one wall colour and one signature challenge. **Decided:** the eight places and the characters' names. **Proposed:** each signature challenge.

| Place | Character | Signature challenge | What it trains |
|---|---|---|---|
| Mercado | Doña Carmen | A full trip: match the list, set amounts, pay | Fruit and vegetables, measures, numbers to 500 |
| Restaurante | Luis | Order from a Spanish-only menu under a dietary rule | Dishes, drinks, polite requests |
| Sitio (taxi stand) | Don Beto | Tell the driver where to go, agree the fare, give directions | Places, directions, fares |
| Clínica | Dra. Morales | Say what hurts and since when; follow the dose | Body, symptoms, time spans |
| Casa | Doña Lupe | Plan the day's tasks; name what is in each room | Rooms, furniture, polite commands |
| Plaza | Don Chucho | Tell the time; small talk | Time, greetings, weather |
| Escuela | Maestra Elena | Split a word into syllables and find the stress | Sounds, letters, reading |
| Banco | Don Rafael | Key in an amount you hear | Large numbers, money |

Each place has the same five challenges, in a suggested order: two warm-ups, the signature challenge, "by ear" (audio only), and the check.

The check is a conversation with no subtitles and no hints. Passing it is the place's can-do statement, such as "I can shop at the market on my own". It is re-offered some days later before the place counts as mastered. **Proposed.**

## 3. Ways to answer

The same word climbs these rungs as you improve. **Proposed.**

| Rung | How you answer | Screen |
|---|---|---|
| 1 | Match Spanish tiles into blanks, few tiles | 9a |
| 2 | The same, with more tiles and distractors | 9a |
| 3 | Build a sentence from tiles | 9e |
| 4 | Type it, with accent keys | Typing |
| 5 | Say it aloud and rate yourself | 9g |

Other answer types: quantity slider (9b), paying with notes and coins (9c), listen and pick the meaning (9d), number pad (Banco), picking from a menu (Restaurante), and conversation replies (9f).

List length is a difficulty setting: 3 items on a first visit, then 4, 5, 6 and 8. **Decided** that three was only the prototype; the steps are **Proposed.**

## 4. Help

- **Subtitles.** English under what a character says, shown with the Spanish. On by default; a setting turns them off. They apply to dialogue only. **Decided.**
- In number challenges (Pay, Banco) the subtitle hides only the amount: "That comes to ··· pesos". It is shown after a wrong try. Everywhere else subtitles are complete. **Decided.**
- **Pronunciation drawer.** The Abc button opens a drawer listing every Spanish word on screen with its syllables, the stressed one marked, a sound-it-out spelling and a speaker. Free, and hidden in listening challenges. **Decided** in principle; layout **Proposed.**
- **Hints.** The lightbulb decodes the line word by word and gives one clue. Costs 5 pesos. Off during a check. **Proposed.**
- **Info tips.** An info button explains a game idea the first time it appears.

## 5. Spanish forms for the player

**Decided:** set-up asks which forms Spanish should use for you, and it must be right in three places: what you say about yourself, how people address you, and words about other people.

**Proposed** data rule: any line that changes is written out in both forms and tagged with whose form it follows. Nothing is swapped by pattern at run time.

```json
{ "id": "carmen.welcome", "speaker": "carmen",
  "es": { "o": "¡Bienvenido al pueblo!", "a": "¡Bienvenida al pueblo!" },
  "en": "Welcome to the town!", "follows": "listener" }
```

`follows` is `listener` (the character is talking to you) or `speaker` (you are talking about yourself). Lines about a third person are written once, because each character's own form is fixed. A build check fails if a line mentions the player and has only one form. Two-player mode keeps a form for each player.

## 6. Learning model

**Proposed.** Each word or phrase has a memory record per skill: *recognise* (rungs 1 to 2, listening) and *produce* (rungs 3 to 5).

- Scheduling uses FSRS through the open-source `ts-fsrs` library (MIT). **VERIFY** that it runs in a phone browser from a single file.
- Each answer is rated: wrong = Again; right with a hint or second try = Hard; right first time = Good; right first time when typed or said = Easy.
- The four states shown to the player come from the record:

| State | Shape | Rule |
|---|---|---|
| New | circle | Never answered |
| Learning | clover | Seen, next review under 3 days away |
| Familiar | cookie | Next review 3 to 21 days away |
| Known | sunny | Next review over 21 days away, and produced at least once |

- A word becomes an errand when its predicted recall drops below 90%. Errands are grouped by place. A word past due steps back one state on screen until it is reviewed.
- The numbers above (3, 21, 90%) are starting values to tune in play, not research findings.

## 7. Conversations as data

**Proposed.** A conversation is a small graph of turns. Each turn is one character line and a set of replies; each reply names the next turn. Some replies are marked wrong for the situation.

```json
{ "id": "mercado.check", "place": "mercado", "subtitles": false, "start": "t1",
  "turns": {
    "t1": { "line": "carmen.algo_mas", "need": "You still need tomatoes.",
      "replies": [
        { "es": "Sí, ¿a cómo el tomate?", "next": "t2", "fits": true },
        { "es": "Es todo, gracias.", "next": "t_pay", "fits": false, "why": "You still needed tomatoes." },
        { "es": "No, es muy caro.", "next": "t1b", "fits": false }
      ] }
  } }
```

Off-script moments (an item is sold out, the price changed, a stranger greets you) are extra turns picked at random, so no two visits are the same.

## 8. Economy

**Decided:** a trip's budget is separate from savings. The rest is **Proposed.**

- You earn pesos by finishing challenges (about $20 to $35), passing checks, and replying to people in the street ($2).
- A shopping trip's budget is given for that trip and is not taken from your savings, so practising never makes you poorer.
- Hints cost $5 from savings.
- Savings buy things for your home. Each item is a Spanish noun and appears in the room with its name, so your home shows your vocabulary. Doña Lupe's tasks then refer to your own things.
- No real money, no ads, no timers that sell skips.
- First build: one room and about a dozen items. More rooms later.
- An avatar is out of scope for the first build. If added later: pick from ready-made characters and recolour them. **Decided** as the simple version.

## 9. Content

- Words live in one data file per place, never in code. Each entry has the Spanish with its article, plural, English, how it is sold or used, a level (core or extended), a note where usage is regional, and whether a dictionary lookup confirmed it.
- Mercado is done: 100 entries, fruit and vegetables plus 12 measure words. 84 single words were confirmed with their gender in the Diccionario del español de México; 14 two-word items were confirmed on the main noun; kale and nectarina are not in that dictionary and are flagged. **Decided:** scope and keeping those two.
- No native-speaker review is available. Lists are verified by dictionary lookup and research. **Decided.**
- Each word also needs pronunciation data: syllables, the stressed syllable and a sound-it-out spelling. **Proposed:** generate these with rules, then test every word. **VERIFY** the rules against the 100 Mercado words.
- The other seven places' word lists are not written yet.

## 10. Art

- Characters, scenes, item pictures and the map are pixel art; type never is. **Decided.**
- One approved master image per character; every expression is made from it. Six expressions: neutral, talking, happy, confused, impatient, surprised. Tested on Doña Carmen and it held.
- The map is painted from a layout sketch so buildings sit where the labels go. Tested and it held.
- Raw output needs a clean-up step to become true pixel sprites; each sprite keeps its own palette.
- Everything on the screens so far is test art, not approved production art. Seven characters, about 70 produce pictures and seven place scenes are still to make.
- **VERIFY:** cost per image, and a second character in the same style.

## 11. Technology

**Proposed**, to confirm in the first build:

- One self-contained web page that works offline, phone first, with the design system's styles and behaviours.
- Audio: the device's Spanish voice. **VERIFY** quality on your phone.
- Speech recognition is not relied on. Say-it-aloud is self-rated. **VERIFY** later whether recording yourself for playback works on your phone.
- Shape morphing uses clip-path polygons with equal point counts. Works in a headless browser; **VERIFY** on your phone.
- Dragging tiles by touch: confirmed working on your phone on 2026-11-21.

## 12. Saving

**Proposed.**

- One save key, kept forever, plus a backup key. A migration step fills any field a newer build adds.
- Saved: your name and forms, settings, pesos, home items, every word's memory record, challenges and checks passed, and the day you last played.
- A backup code you can copy out and paste back in. Reset asks for confirmation in a dialog.
- Test builds also keep a cloud copy so progress survives a new build.

## 13. Every build has

- A visible build label on the title screen, in Settings and on Pause.
- A test panel for you only (five taps on the build label): jump anywhere, set all words to a state, skip days ahead, set pesos, show answers, stop patience, speed up, copy bug info, reset. Never in a public build.
- Settings: sound, voice speed, subtitles, timed replies, Spanish forms, text size, reduced motion, backup, reset.

## 14. Order of work from here

1. A playable market trip on your phone, with the 100-word list and placeholder or test art.
2. Your notes on how it plays; fix them.
3. Then, place by place: word list, signature challenge, character art, check.

## 15. Open decisions for you

1. A name for the game. "Pueblo" stays as the placeholder.

Settled on 2026-11-21: the amount is hidden in subtitles during number challenges; the eight character names (the cleaner is Doña Lupe, addressed with usted like everyone else); a trip's budget is separate from savings.
