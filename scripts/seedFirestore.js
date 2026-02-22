/**
 * scripts/seedFirestore.js
 *
 * Seeds Firestore with 100 iconic trading cards — 50 pairs × 2 grades each.
 * Each pair is the same card graded at two different levels, which is exactly
 * what powers the "which graded higher?" game mechanic.
 *
 * ── HOW TO RUN ────────────────────────────────────────────────────────────────
 *
 *  STEP 1 — Temporarily open Firestore rules so the script can write:
 *    • Go to https://console.firebase.google.com/project/grade-it-3054b/firestore/rules
 *    • Replace the rules with:
 *
 *        rules_version = '2';
 *        service cloud.firestore {
 *          match /databases/{database}/documents {
 *            match /{document=**} {
 *              allow read, write: if true;
 *            }
 *          }
 *        }
 *
 *    • Click "Publish". (These are dev-only rules — lock them down after seeding.)
 *
 *  STEP 2 — Run the script from the project root:
 *    npm run seed
 *
 *  STEP 3 — After "✓ Done!" appears, restore your Firestore rules.
 *
 * ── NOTES ─────────────────────────────────────────────────────────────────────
 *  • Prices are approximate eBay sold averages as of early 2025.
 *  • The eBay Cloud Function (functions/index.js) will keep prices current.
 *  • Running this script again will add duplicates. Delete the 'cards'
 *    collection in the Firebase Console first if you need to re-seed.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, writeBatch, collection, doc } from 'firebase/firestore'

// ── Firebase config ───────────────────────────────────────────────────────────
// (Client credentials are public-facing — safe to use in dev scripts.)
const app = initializeApp({
  apiKey:            'AIzaSyCiBThAWaijrNQYwPDJW6qVWpLGKMxM0Hs',
  authDomain:        'grade-it-3054b.firebaseapp.com',
  projectId:         'grade-it-3054b',
  storageBucket:     'grade-it-3054b.firebasestorage.app',
  messagingSenderId: '579296815791',
  appId:             '1:579296815791:web:6907fd657c4d2d2535425a',
})

const db = getFirestore(app)

// ── Helper ────────────────────────────────────────────────────────────────────
// Takes a shared card identity (player, year, set, number, grading company)
// and two grade+price pairs, returns two complete Firestore-ready documents.
const now = new Date()

function pair(base, gradeHigh, priceHigh, gradeLow, priceLow) {
  return [
    { ...base, grade: gradeHigh, price: priceHigh, ebayUrl: null, images: { front: null, back: null, label: null }, updatedAt: now },
    { ...base, grade: gradeLow,  price: priceLow,  ebayUrl: null, images: { front: null, back: null, label: null }, updatedAt: now },
  ]
}

// ── Card catalog — 50 pairs = 100 documents ───────────────────────────────────
// Schema: playerName · year · set · number · gradingCompany
//         grade · price · ebayUrl · images{front,back,label} · updatedAt
//
// Pair rules (enforced by pairing.js):
//   • Same player, same grading company
//   • Grade gap must be 1–3  (e.g. PSA 8 vs PSA 10 ✓,  PSA 5 vs PSA 9 ✗)
//   • Higher grade = more valuable = correct answer

const CARDS = [

  // ═══════════════════════════════════════════════════════════════════════════
  //  BASEBALL  ·  15 pairs  ·  30 cards
  // ═══════════════════════════════════════════════════════════════════════════

  // The most iconic vintage card in existence
  ...pair({ playerName: 'Mickey Mantle',     year: '1952', set: 'Topps',         number: '311',   gradingCompany: 'PSA' },   4, 24000,   2, 8500   ),

  // Hammerin' Hank's rookie — consistently climbs at auction
  ...pair({ playerName: 'Hank Aaron',         year: '1954', set: 'Topps',         number: '128',   gradingCompany: 'PSA' },   6, 4200,    4, 1600   ),

  // Charlie Hustle's RC — controversial but undeniably iconic
  ...pair({ playerName: 'Pete Rose',          year: '1963', set: 'Topps',         number: '537',   gradingCompany: 'PSA' },   7, 2800,    5, 950    ),

  // Mr. October's rookie card
  ...pair({ playerName: 'Reggie Jackson',     year: '1969', set: 'Topps',         number: '260',   gradingCompany: 'PSA' },   8, 3500,    6, 1100   ),

  // George Brett's rookie — a Royals legend
  ...pair({ playerName: 'George Brett',       year: '1975', set: 'Topps',         number: '228',   gradingCompany: 'PSA' },   9, 2400,    7, 580    ),

  // Mattingly's Donruss RC — the defining junk wax-era rookie
  ...pair({ playerName: 'Don Mattingly',      year: '1984', set: 'Donruss',       number: '248',   gradingCompany: 'PSA' },  10, 1500,    8, 85     ),

  // McGwire's Olympic Team USA RC from the '84 Topps set
  ...pair({ playerName: 'Mark McGwire',       year: '1985', set: 'Topps',         number: '401',   gradingCompany: 'PSA' },  10, 2200,    8, 120    ),

  // The most popular modern hobby card — card #1 in the UD set
  ...pair({ playerName: 'Ken Griffey Jr.',    year: '1989', set: 'Upper Deck',    number: '1',     gradingCompany: 'PSA' },  10, 2800,    8, 120    ),

  // Rivera's rookie from the year before his famous playoff appearance
  ...pair({ playerName: 'Mariano Rivera',     year: '1992', set: 'Bowman',        number: '302',   gradingCompany: 'PSA' },   9, 2500,    7, 750    ),

  // Jeter's SP rookie — the key card of the 1993 Draft class
  ...pair({ playerName: 'Derek Jeter',        year: '1993', set: 'SP',            number: '279',   gradingCompany: 'PSA' },   9, 5500,    7, 2200   ),

  // A-Rod's SP rookie — one of the rarest SPs of the era
  ...pair({ playerName: 'Alex Rodriguez',     year: '1994', set: 'SP',            number: '15',    gradingCompany: 'PSA' },  10, 8500,    8, 1200   ),

  // Pujols' Bowman Chrome RC — the most valuable 2001 card
  ...pair({ playerName: 'Albert Pujols',      year: '2001', set: 'Bowman Chrome', number: '340',   gradingCompany: 'PSA' },  10, 3200,    8, 350    ),

  // The crown jewel of the modern hobby — Trout's Update Series RC
  ...pair({ playerName: 'Mike Trout',         year: '2011', set: 'Topps Update',  number: 'US175', gradingCompany: 'PSA' },  10, 12000,   8, 650    ),

  // Soto's RC from the year he had a historic postseason at 19
  ...pair({ playerName: 'Juan Soto',          year: '2018', set: 'Topps Update',  number: 'US252', gradingCompany: 'PSA' },  10, 2400,    8, 220    ),

  // Tatis Jr. — arguably the most exciting young player of the 2020s
  ...pair({ playerName: 'Fernando Tatis Jr.', year: '2019', set: 'Topps Update',  number: 'US263', gradingCompany: 'PSA' },  10, 1800,    8, 175    ),


  // ═══════════════════════════════════════════════════════════════════════════
  //  BASKETBALL  ·  15 pairs  ·  30 cards
  // ═══════════════════════════════════════════════════════════════════════════

  // Kareem's rookie — listed as Lew Alcindor on the card
  ...pair({ playerName: 'Kareem Abdul-Jabbar',   year: '1969', set: 'Topps',                     number: '25',  gradingCompany: 'PSA' },   7, 8500,    5, 2800   ),

  // The legendary tri-rookie with Bird, Magic, and Dr. J
  ...pair({ playerName: 'Larry Bird',            year: '1980', set: 'Topps',                     number: '34',  gradingCompany: 'PSA' },   8, 14000,   6, 4200   ),

  // The most valuable card in the modern hobby (PSA)
  ...pair({ playerName: 'Michael Jordan',        year: '1986', set: 'Fleer',                     number: '57',  gradingCompany: 'PSA' },   9, 35000,   7, 4800   ),

  // The most valuable card in the modern hobby (BGS) — gem mint commands massive premium
  ...pair({ playerName: 'Michael Jordan',        year: '1986', set: 'Fleer',                     number: '57',  gradingCompany: 'BGS' },   9.5, 180000, 8.5, 22000 ),

  // Magic's Fleer RC — the showtime era's defining card
  ...pair({ playerName: 'Magic Johnson',         year: '1986', set: 'Fleer',                     number: '53',  gradingCompany: 'PSA' },   9, 4500,    7, 1200   ),

  // Kobe's Chrome RC — iconic glossy finish, extreme condition sensitivity
  ...pair({ playerName: 'Kobe Bryant',           year: '1996', set: 'Topps Chrome',              number: '138', gradingCompany: 'PSA' },  10, 35000,   8, 4500   ),

  // Same Kobe Chrome RC graded by Beckett — BGS 9.5 = "Gem Mint"
  ...pair({ playerName: 'Kobe Bryant',           year: '1996', set: 'Topps Chrome',              number: '138', gradingCompany: 'BGS' },   9.5, 25000, 8.5, 4200  ),

  // LeBron's base Topps RC — the most-searched basketball card of the 2000s
  ...pair({ playerName: 'LeBron James',          year: '2003', set: 'Topps',                     number: '221', gradingCompany: 'PSA' },  10, 28000,   8, 3200   ),

  // LeBron's Upper Deck RC — Upper Deck had exclusive license that year
  ...pair({ playerName: 'LeBron James',          year: '2003', set: 'Upper Deck',                number: '301', gradingCompany: 'PSA' },  10, 22000,   8, 2800   ),

  // Durant's Chrome RC — the Slim Reaper's first iconic card
  ...pair({ playerName: 'Kevin Durant',          year: '2007', set: 'Topps Chrome',              number: '131', gradingCompany: 'PSA' },  10, 4500,    8, 850    ),

  // Curry's autographed Contenders RC — the rarest and most valuable Steph card
  ...pair({ playerName: 'Stephen Curry',         year: '2009', set: 'Panini Playoff Contenders', number: '101', gradingCompany: 'PSA' },  10, 18000,   8, 2800   ),

  // The Greek Freak's RC — low production, now a certified blue chip
  ...pair({ playerName: 'Giannis Antetokounmpo', year: '2013', set: 'Panini Prizm',              number: '290', gradingCompany: 'PSA' },  10, 12000,   8, 2200   ),

  // Luka's Prizm RC — the defining card of the new era
  ...pair({ playerName: 'Luka Doncic',           year: '2018', set: 'Panini Prizm',              number: '280', gradingCompany: 'PSA' },  10, 9500,    8, 1800   ),

  // Morant's RC — sky-high ceiling, recent legal drama has kept it volatile
  ...pair({ playerName: 'Ja Morant',             year: '2019', set: 'Panini Prizm',              number: '249', gradingCompany: 'PSA' },  10, 4800,    8, 850    ),

  // Zion's RC — the most hyped draft pick since LeBron
  ...pair({ playerName: 'Zion Williamson',       year: '2019', set: 'Panini Prizm',              number: '248', gradingCompany: 'PSA' },  10, 3500,    8, 680    ),


  // ═══════════════════════════════════════════════════════════════════════════
  //  FOOTBALL  ·  10 pairs  ·  20 cards
  // ═══════════════════════════════════════════════════════════════════════════

  // The first great NFL star RC — Jim Brown played 9 seasons, never ran out of bounds
  ...pair({ playerName: 'Jim Brown',       year: '1958', set: 'Topps',              number: '62',  gradingCompany: 'PSA' },   6, 8500,      4, 3200    ),

  // Broadway Joe's RC — the most valuable vintage football card
  ...pair({ playerName: 'Joe Namath',      year: '1965', set: 'Topps',              number: '122', gradingCompany: 'PSA' },   7, 6500,      5, 2200    ),

  // Marino's RC — the most dominant passing season rookie in NFL history
  ...pair({ playerName: 'Dan Marino',      year: '1984', set: 'Topps',              number: '123', gradingCompany: 'PSA' },  10, 5500,      8, 480     ),

  // Elway's RC — the iconic #7 of the Denver Broncos, same year as Marino
  ...pair({ playerName: 'John Elway',      year: '1984', set: 'Topps',              number: '63',  gradingCompany: 'PSA' },  10, 4200,      8, 380     ),

  // Jerry Rice's RC — widely considered the GOAT WR
  ...pair({ playerName: 'Jerry Rice',      year: '1986', set: 'Topps',              number: '161', gradingCompany: 'PSA' },  10, 8500,      8, 650     ),

  // Barry Sanders' RC — one of the most electrifying runners in NFL history
  ...pair({ playerName: 'Barry Sanders',   year: '1989', set: 'Score',              number: '257', gradingCompany: 'PSA' },  10, 3800,      8, 280     ),

  // The single most valuable football card ever — Brady's auto RC
  ...pair({ playerName: 'Tom Brady',       year: '2000', set: 'Playoff Contenders', number: '144', gradingCompany: 'PSA' },  10, 4200000,   8, 165000  ),

  // Rodgers' Topps RC — fell to #24 in the draft, proved everyone wrong
  ...pair({ playerName: 'Aaron Rodgers',   year: '2005', set: 'Topps',              number: '431', gradingCompany: 'PSA' },  10, 2800,      8, 220     ),

  // Mahomes' Prizm RC — the most traded modern football card
  ...pair({ playerName: 'Patrick Mahomes', year: '2017', set: 'Panini Prizm',       number: '269', gradingCompany: 'PSA' },  10, 18000,     8, 2800    ),

  // Josh Allen's RC — transformed Buffalo into a Super Bowl contender
  ...pair({ playerName: 'Josh Allen',      year: '2018', set: 'Panini Prizm',       number: '212', gradingCompany: 'PSA' },  10, 4500,      8, 780     ),


  // ═══════════════════════════════════════════════════════════════════════════
  //  POKÉMON  ·  10 pairs  ·  20 cards
  // ═══════════════════════════════════════════════════════════════════════════

  // The holy grail — 1st Edition Charizard sold for $420K+ at auction
  ...pair({ playerName: 'Charizard', year: '1999', set: 'Pokemon Base Set 1st Edition',  number: '4',  gradingCompany: 'PSA' },   9, 375000,  7, 45000  ),

  // Shadowless — the short-printed first print run before "shadows" were added to art
  ...pair({ playerName: 'Charizard', year: '1999', set: 'Pokemon Base Set Shadowless',   number: '4',  gradingCompany: 'PSA' },   9, 28000,   7, 7500   ),

  // Unlimited Charizard — most recognizable Pokémon card, still very valuable
  ...pair({ playerName: 'Charizard', year: '1999', set: 'Pokemon Base Set',              number: '4',  gradingCompany: 'PSA' },   9, 4800,    7, 1200   ),

  // Blastoise 1st Ed — the original starter, second only to Charizard in value
  ...pair({ playerName: 'Blastoise', year: '1999', set: 'Pokemon Base Set 1st Edition',  number: '2',  gradingCompany: 'PSA' },   9, 42000,   7, 8500   ),

  // Venusaur 1st Ed — completes the original starter trio
  ...pair({ playerName: 'Venusaur',  year: '1999', set: 'Pokemon Base Set 1st Edition',  number: '15', gradingCompany: 'PSA' },   9, 28000,   7, 5500   ),

  // Mewtwo 1st Ed — the most powerful Pokémon in the original game
  ...pair({ playerName: 'Mewtwo',    year: '1999', set: 'Pokemon Base Set 1st Edition',  number: '10', gradingCompany: 'PSA' },   9, 18000,   7, 3800   ),

  // Pikachu — the mascot, PSA 10 copies are surprisingly hard to find
  ...pair({ playerName: 'Pikachu',   year: '1999', set: 'Pokemon Base Set',              number: '58', gradingCompany: 'PSA' },  10, 4500,    8, 850    ),

  // Lugia 1st Ed — the box topper of Neo Genesis, Logan Paul's famous $216K card
  ...pair({ playerName: 'Lugia',     year: '2000', set: 'Pokemon Neo Genesis 1st Edition', number: '9', gradingCompany: 'PSA' }, 9, 22000,   7, 4800   ),

  // Legendary Collection Charizard — rare reverse holo reprint with swapped art
  ...pair({ playerName: 'Charizard', year: '2002', set: 'Pokemon Legendary Collection',  number: '3',  gradingCompany: 'PSA' },   9, 3500,    7, 850    ),

  // Japanese Base Set Pikachu — original printing from 1997, predates US release
  ...pair({ playerName: 'Pikachu',   year: '1998', set: 'Pokemon Japanese Base Set',     number: '25', gradingCompany: 'PSA' },  10, 2800,    8, 580    ),

]

// ── Seed ─────────────────────────────────────────────────────────────────────
async function seed() {
  console.log(`\n🃏  Grade It — Firestore Seeder`)
  console.log(`   Preparing ${CARDS.length} cards (${CARDS.length / 2} pairs)...\n`)

  const cardsRef = collection(db, 'cards')
  const batch = writeBatch(db)

  CARDS.forEach((card) => {
    batch.set(doc(cardsRef), card)
  })

  console.log('   Committing batch to Firestore...')
  await batch.commit()

  console.log(`\n✓  Done! ${CARDS.length} cards written to the 'cards' collection.`)
  console.log(`\n   View in Firebase Console:`)
  console.log(`   https://console.firebase.google.com/project/grade-it-3054b/firestore/data/~2Fcards\n`)

  process.exit(0)
}

seed().catch((err) => {
  console.error('\n✗  Seed failed:', err.message)
  console.error('\n   Common causes:')
  console.error('   • Firestore rules are not set to allow writes (see Step 1 above)')
  console.error('   • No internet connection')
  console.error('   • Firebase project ID mismatch\n')
  process.exit(1)
})
