/**
 * scripts/setFanaticsUrls.js
 *
 * Writes Fanatics Collect listing URLs into existing Firestore card documents.
 * Run once after populating the FANATICS_LISTINGS array below.
 *
 *   npm run set-fanatics
 *
 * Then run the scraper to extract cert numbers and prices:
 *   npm run enrich:fanatics
 */

import { initializeApp }                                     from 'firebase/app'
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore'
import { readFileSync }                                      from 'fs'

try {
  readFileSync('.env', 'utf8').split('\n').forEach(line => {
    const eq = line.indexOf('=')
    if (eq > 0) {
      const key = line.slice(0, eq).trim()
      const val = line.slice(eq + 1).trim()
      if (key && !key.startsWith('#')) process.env[key] = val
    }
  })
} catch {}

const app = initializeApp({
  apiKey:            'AIzaSyCiBThAWaijrNQYwPDJW6qVWpLGKMxM0Hs',
  authDomain:        'grade-it-3054b.firebaseapp.com',
  projectId:         'grade-it-3054b',
  storageBucket:     'grade-it-3054b.firebasestorage.app',
  messagingSenderId: '579296815791',
  appId:             '1:579296815791:web:6907fd657c4d2d2535425a',
})
const db = getFirestore(app)

// ── Fanatics Collect listing URLs ─────────────────────────────────────────────
// Populated by the search agent. url: null = not found yet.

const FANATICS_LISTINGS = [

  // ── BASEBALL ────────────────────────────────────────────────────────────────
  { playerName: 'Mickey Mantle',     year: '1952', set: 'Topps',         gradingCompany: 'PSA', grade: 4,  url: 'https://www.fanaticscollect.com/premier/b39e517c-3d2b-11ee-ab01-0a58a9feac02' },
  { playerName: 'Mickey Mantle',     year: '1952', set: 'Topps',         gradingCompany: 'PSA', grade: 2,  url: 'https://www.fanaticscollect.com/premier/b6e4cbb2-0fb9-11ee-8dbe-0a58a9feac02' },
  { playerName: 'Hank Aaron',        year: '1954', set: 'Topps',         gradingCompany: 'PSA', grade: 6,  url: 'https://www.fanaticscollect.com/premier/9aea21b6-a079-11f0-b28e-0a58a9feac02' },
  { playerName: 'Hank Aaron',        year: '1954', set: 'Topps',         gradingCompany: 'PSA', grade: 4,  url: 'https://www.fanaticscollect.com/premier/fbb10e56-7be7-11ed-997c-0a57732bc7af' },
  { playerName: 'Pete Rose',         year: '1963', set: 'Topps',         gradingCompany: 'PSA', grade: 7,  url: 'https://www.fanaticscollect.com/fixed/03911ee0-7be8-11ed-a385-0a57732bc7af' },
  { playerName: 'Pete Rose',         year: '1963', set: 'Topps',         gradingCompany: 'PSA', grade: 5,  url: null },
  { playerName: 'Reggie Jackson',    year: '1969', set: 'Topps',         gradingCompany: 'PSA', grade: 8,  url: null },
  { playerName: 'Reggie Jackson',    year: '1969', set: 'Topps',         gradingCompany: 'PSA', grade: 6,  url: null },
  { playerName: 'George Brett',      year: '1975', set: 'Topps',         gradingCompany: 'PSA', grade: 9,  url: null },
  { playerName: 'George Brett',      year: '1975', set: 'Topps',         gradingCompany: 'PSA', grade: 7,  url: null },
  { playerName: 'Don Mattingly',     year: '1984', set: 'Donruss',       gradingCompany: 'PSA', grade: 10, url: null },
  { playerName: 'Don Mattingly',     year: '1984', set: 'Donruss',       gradingCompany: 'PSA', grade: 8,  url: null },
  { playerName: 'Mark McGwire',      year: '1985', set: 'Topps',         gradingCompany: 'PSA', grade: 10, url: null },
  { playerName: 'Mark McGwire',      year: '1985', set: 'Topps',         gradingCompany: 'PSA', grade: 8,  url: null },
  { playerName: 'Ken Griffey Jr.',   year: '1989', set: 'Upper Deck',    gradingCompany: 'PSA', grade: 10, url: null },
  { playerName: 'Ken Griffey Jr.',   year: '1989', set: 'Upper Deck',    gradingCompany: 'PSA', grade: 8,  url: null },
  { playerName: 'Mariano Rivera',    year: '1992', set: 'Bowman',        gradingCompany: 'PSA', grade: 9,  url: null },
  { playerName: 'Mariano Rivera',    year: '1992', set: 'Bowman',        gradingCompany: 'PSA', grade: 7,  url: null },
  { playerName: 'Derek Jeter',       year: '1993', set: 'SP',            gradingCompany: 'PSA', grade: 9,  url: null },
  { playerName: 'Derek Jeter',       year: '1993', set: 'SP',            gradingCompany: 'PSA', grade: 7,  url: null },
  { playerName: 'Alex Rodriguez',    year: '1994', set: 'SP',            gradingCompany: 'PSA', grade: 10, url: null },
  { playerName: 'Alex Rodriguez',    year: '1994', set: 'SP',            gradingCompany: 'PSA', grade: 8,  url: null },
  { playerName: 'Albert Pujols',     year: '2001', set: 'Bowman Chrome', gradingCompany: 'PSA', grade: 10, url: null },
  { playerName: 'Albert Pujols',     year: '2001', set: 'Bowman Chrome', gradingCompany: 'PSA', grade: 8,  url: null },
  { playerName: 'Mike Trout',        year: '2011', set: 'Topps Update',  gradingCompany: 'PSA', grade: 10, url: null },
  { playerName: 'Mike Trout',        year: '2011', set: 'Topps Update',  gradingCompany: 'PSA', grade: 8,  url: null },
  { playerName: 'Juan Soto',         year: '2018', set: 'Topps Update',  gradingCompany: 'PSA', grade: 10, url: null },
  { playerName: 'Juan Soto',         year: '2018', set: 'Topps Update',  gradingCompany: 'PSA', grade: 8,  url: null },
  { playerName: 'Fernando Tatis Jr.', year: '2019', set: 'Topps Update', gradingCompany: 'PSA', grade: 10, url: null },
  { playerName: 'Fernando Tatis Jr.', year: '2019', set: 'Topps Update', gradingCompany: 'PSA', grade: 8,  url: null },

  // ── BASKETBALL ──────────────────────────────────────────────────────────────
  { playerName: 'Kareem Abdul-Jabbar',   year: '1969', set: 'Topps',                     gradingCompany: 'PSA', grade: 7,   url: null },
  { playerName: 'Kareem Abdul-Jabbar',   year: '1969', set: 'Topps',                     gradingCompany: 'PSA', grade: 5,   url: null },
  { playerName: 'Larry Bird',            year: '1980', set: 'Topps',                     gradingCompany: 'PSA', grade: 8,   url: null },
  { playerName: 'Larry Bird',            year: '1980', set: 'Topps',                     gradingCompany: 'PSA', grade: 6,   url: null },
  { playerName: 'Michael Jordan',        year: '1986', set: 'Fleer',                     gradingCompany: 'PSA', grade: 9,   url: null },
  { playerName: 'Michael Jordan',        year: '1986', set: 'Fleer',                     gradingCompany: 'PSA', grade: 7,   url: null },
  { playerName: 'Michael Jordan',        year: '1986', set: 'Fleer',                     gradingCompany: 'BGS', grade: 9.5, url: null },
  { playerName: 'Michael Jordan',        year: '1986', set: 'Fleer',                     gradingCompany: 'BGS', grade: 8.5, url: null },
  { playerName: 'Magic Johnson',         year: '1986', set: 'Fleer',                     gradingCompany: 'PSA', grade: 9,   url: null },
  { playerName: 'Magic Johnson',         year: '1986', set: 'Fleer',                     gradingCompany: 'PSA', grade: 7,   url: null },
  { playerName: 'Kobe Bryant',           year: '1996', set: 'Topps Chrome',              gradingCompany: 'PSA', grade: 10,  url: null },
  { playerName: 'Kobe Bryant',           year: '1996', set: 'Topps Chrome',              gradingCompany: 'PSA', grade: 8,   url: null },
  { playerName: 'Kobe Bryant',           year: '1996', set: 'Topps Chrome',              gradingCompany: 'BGS', grade: 9.5, url: null },
  { playerName: 'Kobe Bryant',           year: '1996', set: 'Topps Chrome',              gradingCompany: 'BGS', grade: 8.5, url: null },
  { playerName: 'LeBron James',          year: '2003', set: 'Topps',                     gradingCompany: 'PSA', grade: 10,  url: null },
  { playerName: 'LeBron James',          year: '2003', set: 'Topps',                     gradingCompany: 'PSA', grade: 8,   url: null },
  { playerName: 'LeBron James',          year: '2003', set: 'Upper Deck',                gradingCompany: 'PSA', grade: 10,  url: null },
  { playerName: 'LeBron James',          year: '2003', set: 'Upper Deck',                gradingCompany: 'PSA', grade: 8,   url: null },
  { playerName: 'Kevin Durant',          year: '2007', set: 'Topps Chrome',              gradingCompany: 'PSA', grade: 10,  url: null },
  { playerName: 'Kevin Durant',          year: '2007', set: 'Topps Chrome',              gradingCompany: 'PSA', grade: 8,   url: null },
  { playerName: 'Stephen Curry',         year: '2009', set: 'Panini Playoff Contenders', gradingCompany: 'PSA', grade: 10,  url: null },
  { playerName: 'Stephen Curry',         year: '2009', set: 'Panini Playoff Contenders', gradingCompany: 'PSA', grade: 8,   url: null },
  { playerName: 'Giannis Antetokounmpo', year: '2013', set: 'Panini Prizm',              gradingCompany: 'PSA', grade: 10,  url: null },
  { playerName: 'Giannis Antetokounmpo', year: '2013', set: 'Panini Prizm',              gradingCompany: 'PSA', grade: 8,   url: null },
  { playerName: 'Luka Doncic',           year: '2018', set: 'Panini Prizm',              gradingCompany: 'PSA', grade: 10,  url: null },
  { playerName: 'Luka Doncic',           year: '2018', set: 'Panini Prizm',              gradingCompany: 'PSA', grade: 8,   url: null },
  { playerName: 'Ja Morant',             year: '2019', set: 'Panini Prizm',              gradingCompany: 'PSA', grade: 10,  url: null },
  { playerName: 'Ja Morant',             year: '2019', set: 'Panini Prizm',              gradingCompany: 'PSA', grade: 8,   url: null },
  { playerName: 'Zion Williamson',       year: '2019', set: 'Panini Prizm',              gradingCompany: 'PSA', grade: 10,  url: null },
  { playerName: 'Zion Williamson',       year: '2019', set: 'Panini Prizm',              gradingCompany: 'PSA', grade: 8,   url: null },

  // ── FOOTBALL ────────────────────────────────────────────────────────────────
  { playerName: 'Jim Brown',       year: '1958', set: 'Topps',              gradingCompany: 'PSA', grade: 6,  url: null },
  { playerName: 'Jim Brown',       year: '1958', set: 'Topps',              gradingCompany: 'PSA', grade: 4,  url: null },
  { playerName: 'Joe Namath',      year: '1965', set: 'Topps',              gradingCompany: 'PSA', grade: 7,  url: null },
  { playerName: 'Joe Namath',      year: '1965', set: 'Topps',              gradingCompany: 'PSA', grade: 5,  url: null },
  { playerName: 'Dan Marino',      year: '1984', set: 'Topps',              gradingCompany: 'PSA', grade: 10, url: null },
  { playerName: 'Dan Marino',      year: '1984', set: 'Topps',              gradingCompany: 'PSA', grade: 8,  url: null },
  { playerName: 'John Elway',      year: '1984', set: 'Topps',              gradingCompany: 'PSA', grade: 10, url: null },
  { playerName: 'John Elway',      year: '1984', set: 'Topps',              gradingCompany: 'PSA', grade: 8,  url: null },
  { playerName: 'Jerry Rice',      year: '1986', set: 'Topps',              gradingCompany: 'PSA', grade: 10, url: null },
  { playerName: 'Jerry Rice',      year: '1986', set: 'Topps',              gradingCompany: 'PSA', grade: 8,  url: null },
  { playerName: 'Barry Sanders',   year: '1989', set: 'Score',              gradingCompany: 'PSA', grade: 10, url: null },
  { playerName: 'Barry Sanders',   year: '1989', set: 'Score',              gradingCompany: 'PSA', grade: 8,  url: null },
  { playerName: 'Tom Brady',       year: '2000', set: 'Playoff Contenders', gradingCompany: 'PSA', grade: 10, url: null },
  { playerName: 'Tom Brady',       year: '2000', set: 'Playoff Contenders', gradingCompany: 'PSA', grade: 8,  url: null },
  { playerName: 'Aaron Rodgers',   year: '2005', set: 'Topps',              gradingCompany: 'PSA', grade: 10, url: null },
  { playerName: 'Aaron Rodgers',   year: '2005', set: 'Topps',              gradingCompany: 'PSA', grade: 8,  url: null },
  { playerName: 'Patrick Mahomes', year: '2017', set: 'Panini Prizm',       gradingCompany: 'PSA', grade: 10, url: null },
  { playerName: 'Patrick Mahomes', year: '2017', set: 'Panini Prizm',       gradingCompany: 'PSA', grade: 8,  url: null },
  { playerName: 'Josh Allen',      year: '2018', set: 'Panini Prizm',       gradingCompany: 'PSA', grade: 10, url: null },
  { playerName: 'Josh Allen',      year: '2018', set: 'Panini Prizm',       gradingCompany: 'PSA', grade: 8,  url: null },

  // ── POKÉMON ─────────────────────────────────────────────────────────────────
  { playerName: 'Charizard', year: '1999', set: 'Pokemon Base Set 1st Edition',    gradingCompany: 'PSA', grade: 9,  url: null },
  { playerName: 'Charizard', year: '1999', set: 'Pokemon Base Set 1st Edition',    gradingCompany: 'PSA', grade: 7,  url: null },
  { playerName: 'Charizard', year: '1999', set: 'Pokemon Base Set Shadowless',     gradingCompany: 'PSA', grade: 9,  url: null },
  { playerName: 'Charizard', year: '1999', set: 'Pokemon Base Set Shadowless',     gradingCompany: 'PSA', grade: 7,  url: null },
  { playerName: 'Charizard', year: '1999', set: 'Pokemon Base Set',                gradingCompany: 'PSA', grade: 9,  url: null },
  { playerName: 'Charizard', year: '1999', set: 'Pokemon Base Set',                gradingCompany: 'PSA', grade: 7,  url: null },
  { playerName: 'Blastoise', year: '1999', set: 'Pokemon Base Set 1st Edition',    gradingCompany: 'PSA', grade: 9,  url: null },
  { playerName: 'Blastoise', year: '1999', set: 'Pokemon Base Set 1st Edition',    gradingCompany: 'PSA', grade: 7,  url: null },
  { playerName: 'Venusaur',  year: '1999', set: 'Pokemon Base Set 1st Edition',    gradingCompany: 'PSA', grade: 9,  url: null },
  { playerName: 'Venusaur',  year: '1999', set: 'Pokemon Base Set 1st Edition',    gradingCompany: 'PSA', grade: 7,  url: null },
  { playerName: 'Mewtwo',    year: '1999', set: 'Pokemon Base Set 1st Edition',    gradingCompany: 'PSA', grade: 9,  url: null },
  { playerName: 'Mewtwo',    year: '1999', set: 'Pokemon Base Set 1st Edition',    gradingCompany: 'PSA', grade: 7,  url: null },
  { playerName: 'Pikachu',   year: '1999', set: 'Pokemon Base Set',                gradingCompany: 'PSA', grade: 10, url: null },
  { playerName: 'Pikachu',   year: '1999', set: 'Pokemon Base Set',                gradingCompany: 'PSA', grade: 8,  url: null },
  { playerName: 'Lugia',     year: '2000', set: 'Pokemon Neo Genesis 1st Edition', gradingCompany: 'PSA', grade: 9,  url: null },
  { playerName: 'Lugia',     year: '2000', set: 'Pokemon Neo Genesis 1st Edition', gradingCompany: 'PSA', grade: 7,  url: null },
  { playerName: 'Charizard', year: '2002', set: 'Pokemon Legendary Collection',    gradingCompany: 'PSA', grade: 9,  url: null },
  { playerName: 'Charizard', year: '2002', set: 'Pokemon Legendary Collection',    gradingCompany: 'PSA', grade: 7,  url: null },
  { playerName: 'Pikachu',   year: '1998', set: 'Pokemon Japanese Base Set',       gradingCompany: 'PSA', grade: 10, url: null },
  { playerName: 'Pikachu',   year: '1998', set: 'Pokemon Japanese Base Set',       gradingCompany: 'PSA', grade: 8,  url: null },
]

// ── Match and update Firestore ────────────────────────────────────────────────
async function main() {
  const toSet = FANATICS_LISTINGS.filter(e => e.url !== null)
  if (toSet.length === 0) {
    console.log('\n⚠️   No URLs filled in yet — waiting on search results.')
    process.exit(0)
  }

  console.log(`\n📦  Loading cards from Firestore…`)
  const snapshot = await getDocs(collection(db, 'cards'))
  const cards    = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
  console.log(`✓   ${cards.length} cards loaded\n`)
  console.log(`🔗  Setting Fanatics URLs for ${toSet.length} entries...\n`)

  let updated = 0, notFound = 0

  for (const entry of toSet) {
    const match = cards.find(c =>
      c.playerName     === entry.playerName     &&
      c.year           === entry.year           &&
      c.set            === entry.set            &&
      c.gradingCompany === entry.gradingCompany &&
      parseFloat(c.grade) === parseFloat(entry.grade)
    )

    const label = `${entry.playerName}  ${entry.gradingCompany} ${entry.grade}`
    if (!match) {
      console.log(`  ⚠️  Not found in Firestore: ${label}`)
      notFound++
      continue
    }

    await updateDoc(doc(db, 'cards', match.id), { fanaticUrl: entry.url })
    console.log(`  ✓  ${label.padEnd(42)} → ${entry.url.slice(0, 60)}`)
    updated++
  }

  console.log(`\n✅  Done! ${updated} updated, ${notFound} not matched`)
  console.log('    Now run:  npm run enrich:fanatics\n')
  process.exit(0)
}

main().catch(err => {
  console.error('Fatal:', err.message)
  process.exit(1)
})
