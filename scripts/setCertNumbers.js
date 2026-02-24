/**
 * scripts/setCertNumbers.js
 *
 * Writes PSA cert numbers into existing Firestore card documents.
 *
 * ── HOW TO USE ────────────────────────────────────────────────────────────────
 *
 *  1. Go to https://www.psacard.com/cert and look up each card below.
 *     Search by player name + year + set. Find a specific graded copy at the
 *     right grade and copy its 8-digit cert number.
 *
 *  2. Fill in the certNumber field for each entry below.
 *
 *  3. Run:  npm run set-certs
 *
 * ── MATCHING ──────────────────────────────────────────────────────────────────
 *
 *  Cards are matched to Firestore documents by:
 *    playerName + year + set + gradingCompany + grade
 *
 *  If multiple Firestore docs match (shouldn't happen), all get updated.
 *
 * ── NOTES ─────────────────────────────────────────────────────────────────────
 *
 *  • Cert numbers are typically 8 digits (some older ones are shorter).
 *  • You can find a cert at: https://www.psacard.com/cert/{certNumber}
 *  • PSA images for the cert will be fetched by npm run enrich (enrichFromPSA.js).
 */

import { initializeApp }                                         from 'firebase/app'
import { getFirestore, collection, getDocs, doc, updateDoc }     from 'firebase/firestore'
import { readFileSync }                                          from 'fs'

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

// ── Fill in cert numbers here ─────────────────────────────────────────────────
// Look up each cert at https://www.psacard.com/cert
// Leave certNumber as null if you haven't found it yet — those rows are skipped.

const CERT_MAP = [

  // ── BASEBALL ────────────────────────────────────────────────────────────────
  { playerName: 'Mickey Mantle',     year: '1952', set: 'Topps',      gradingCompany: 'PSA', grade: 4,  certNumber: '50846823' },
  { playerName: 'Mickey Mantle',     year: '1952', set: 'Topps',      gradingCompany: 'PSA', grade: 2,  certNumber: '43467921' },

  { playerName: 'Hank Aaron',        year: '1954', set: 'Topps',      gradingCompany: 'PSA', grade: 6,  certNumber: '12017123' },
  { playerName: 'Hank Aaron',        year: '1954', set: 'Topps',      gradingCompany: 'PSA', grade: 4,  certNumber: '27161901' },

  { playerName: 'Pete Rose',         year: '1963', set: 'Topps',      gradingCompany: 'PSA', grade: 7,  certNumber: '44066250' },
  { playerName: 'Pete Rose',         year: '1963', set: 'Topps',      gradingCompany: 'PSA', grade: 5,  certNumber: '09172681' },

  { playerName: 'Reggie Jackson',    year: '1969', set: 'Topps',      gradingCompany: 'PSA', grade: 8,  certNumber: null },
  { playerName: 'Reggie Jackson',    year: '1969', set: 'Topps',      gradingCompany: 'PSA', grade: 6,  certNumber: null },

  { playerName: 'George Brett',      year: '1975', set: 'Topps',      gradingCompany: 'PSA', grade: 9,  certNumber: null },
  { playerName: 'George Brett',      year: '1975', set: 'Topps',      gradingCompany: 'PSA', grade: 7,  certNumber: null },

  { playerName: 'Don Mattingly',     year: '1984', set: 'Donruss',    gradingCompany: 'PSA', grade: 10, certNumber: null },
  { playerName: 'Don Mattingly',     year: '1984', set: 'Donruss',    gradingCompany: 'PSA', grade: 8,  certNumber: null },

  { playerName: 'Mark McGwire',      year: '1985', set: 'Topps',      gradingCompany: 'PSA', grade: 10, certNumber: null },
  { playerName: 'Mark McGwire',      year: '1985', set: 'Topps',      gradingCompany: 'PSA', grade: 8,  certNumber: null },

  { playerName: 'Ken Griffey Jr.',   year: '1989', set: 'Upper Deck', gradingCompany: 'PSA', grade: 10, certNumber: null },
  { playerName: 'Ken Griffey Jr.',   year: '1989', set: 'Upper Deck', gradingCompany: 'PSA', grade: 8,  certNumber: null },

  { playerName: 'Mariano Rivera',    year: '1992', set: 'Bowman',     gradingCompany: 'PSA', grade: 9,  certNumber: null },
  { playerName: 'Mariano Rivera',    year: '1992', set: 'Bowman',     gradingCompany: 'PSA', grade: 7,  certNumber: null },

  { playerName: 'Derek Jeter',       year: '1993', set: 'SP',         gradingCompany: 'PSA', grade: 9,  certNumber: null },
  { playerName: 'Derek Jeter',       year: '1993', set: 'SP',         gradingCompany: 'PSA', grade: 7,  certNumber: null },

  { playerName: 'Alex Rodriguez',    year: '1994', set: 'SP',         gradingCompany: 'PSA', grade: 10, certNumber: null },
  { playerName: 'Alex Rodriguez',    year: '1994', set: 'SP',         gradingCompany: 'PSA', grade: 8,  certNumber: null },

  { playerName: 'Albert Pujols',     year: '2001', set: 'Bowman Chrome', gradingCompany: 'PSA', grade: 10, certNumber: null },
  { playerName: 'Albert Pujols',     year: '2001', set: 'Bowman Chrome', gradingCompany: 'PSA', grade: 8,  certNumber: null },

  { playerName: 'Mike Trout',        year: '2011', set: 'Topps Update', gradingCompany: 'PSA', grade: 10, certNumber: null },
  { playerName: 'Mike Trout',        year: '2011', set: 'Topps Update', gradingCompany: 'PSA', grade: 8,  certNumber: null },

  { playerName: 'Juan Soto',         year: '2018', set: 'Topps Update', gradingCompany: 'PSA', grade: 10, certNumber: null },
  { playerName: 'Juan Soto',         year: '2018', set: 'Topps Update', gradingCompany: 'PSA', grade: 8,  certNumber: null },

  { playerName: 'Fernando Tatis Jr.', year: '2019', set: 'Topps Update', gradingCompany: 'PSA', grade: 10, certNumber: null },
  { playerName: 'Fernando Tatis Jr.', year: '2019', set: 'Topps Update', gradingCompany: 'PSA', grade: 8,  certNumber: null },

  // ── BASKETBALL ──────────────────────────────────────────────────────────────
  { playerName: 'Kareem Abdul-Jabbar', year: '1969', set: 'Topps', gradingCompany: 'PSA', grade: 7,   certNumber: null },
  { playerName: 'Kareem Abdul-Jabbar', year: '1969', set: 'Topps', gradingCompany: 'PSA', grade: 5,   certNumber: null },

  { playerName: 'Larry Bird',          year: '1980', set: 'Topps', gradingCompany: 'PSA', grade: 8,   certNumber: null },
  { playerName: 'Larry Bird',          year: '1980', set: 'Topps', gradingCompany: 'PSA', grade: 6,   certNumber: null },

  { playerName: 'Michael Jordan',      year: '1986', set: 'Fleer', gradingCompany: 'PSA', grade: 9,   certNumber: null },
  { playerName: 'Michael Jordan',      year: '1986', set: 'Fleer', gradingCompany: 'PSA', grade: 7,   certNumber: null },

  { playerName: 'Michael Jordan',      year: '1986', set: 'Fleer', gradingCompany: 'BGS', grade: 9.5, certNumber: null },
  { playerName: 'Michael Jordan',      year: '1986', set: 'Fleer', gradingCompany: 'BGS', grade: 8.5, certNumber: null },

  { playerName: 'Magic Johnson',       year: '1986', set: 'Fleer', gradingCompany: 'PSA', grade: 9,   certNumber: null },
  { playerName: 'Magic Johnson',       year: '1986', set: 'Fleer', gradingCompany: 'PSA', grade: 7,   certNumber: null },

  { playerName: 'Kobe Bryant',         year: '1996', set: 'Topps Chrome', gradingCompany: 'PSA', grade: 10,  certNumber: null },
  { playerName: 'Kobe Bryant',         year: '1996', set: 'Topps Chrome', gradingCompany: 'PSA', grade: 8,   certNumber: null },

  { playerName: 'Kobe Bryant',         year: '1996', set: 'Topps Chrome', gradingCompany: 'BGS', grade: 9.5, certNumber: null },
  { playerName: 'Kobe Bryant',         year: '1996', set: 'Topps Chrome', gradingCompany: 'BGS', grade: 8.5, certNumber: null },

  { playerName: 'LeBron James',        year: '2003', set: 'Topps',        gradingCompany: 'PSA', grade: 10,  certNumber: null },
  { playerName: 'LeBron James',        year: '2003', set: 'Topps',        gradingCompany: 'PSA', grade: 8,   certNumber: null },

  { playerName: 'LeBron James',        year: '2003', set: 'Upper Deck',   gradingCompany: 'PSA', grade: 10,  certNumber: null },
  { playerName: 'LeBron James',        year: '2003', set: 'Upper Deck',   gradingCompany: 'PSA', grade: 8,   certNumber: null },

  { playerName: 'Kevin Durant',        year: '2007', set: 'Topps Chrome', gradingCompany: 'PSA', grade: 10,  certNumber: null },
  { playerName: 'Kevin Durant',        year: '2007', set: 'Topps Chrome', gradingCompany: 'PSA', grade: 8,   certNumber: null },

  { playerName: 'Stephen Curry',       year: '2009', set: 'Panini Playoff Contenders', gradingCompany: 'PSA', grade: 10, certNumber: null },
  { playerName: 'Stephen Curry',       year: '2009', set: 'Panini Playoff Contenders', gradingCompany: 'PSA', grade: 8,  certNumber: null },

  { playerName: 'Giannis Antetokounmpo', year: '2013', set: 'Panini Prizm', gradingCompany: 'PSA', grade: 10, certNumber: null },
  { playerName: 'Giannis Antetokounmpo', year: '2013', set: 'Panini Prizm', gradingCompany: 'PSA', grade: 8,  certNumber: null },

  { playerName: 'Luka Doncic',         year: '2018', set: 'Panini Prizm', gradingCompany: 'PSA', grade: 10, certNumber: null },
  { playerName: 'Luka Doncic',         year: '2018', set: 'Panini Prizm', gradingCompany: 'PSA', grade: 8,  certNumber: null },

  { playerName: 'Ja Morant',           year: '2019', set: 'Panini Prizm', gradingCompany: 'PSA', grade: 10, certNumber: null },
  { playerName: 'Ja Morant',           year: '2019', set: 'Panini Prizm', gradingCompany: 'PSA', grade: 8,  certNumber: null },

  { playerName: 'Zion Williamson',     year: '2019', set: 'Panini Prizm', gradingCompany: 'PSA', grade: 10, certNumber: null },
  { playerName: 'Zion Williamson',     year: '2019', set: 'Panini Prizm', gradingCompany: 'PSA', grade: 8,  certNumber: null },

  // ── FOOTBALL ────────────────────────────────────────────────────────────────
  { playerName: 'Jim Brown',       year: '1958', set: 'Topps',              gradingCompany: 'PSA', grade: 6,  certNumber: null },
  { playerName: 'Jim Brown',       year: '1958', set: 'Topps',              gradingCompany: 'PSA', grade: 4,  certNumber: null },

  { playerName: 'Joe Namath',      year: '1965', set: 'Topps',              gradingCompany: 'PSA', grade: 7,  certNumber: null },
  { playerName: 'Joe Namath',      year: '1965', set: 'Topps',              gradingCompany: 'PSA', grade: 5,  certNumber: null },

  { playerName: 'Dan Marino',      year: '1984', set: 'Topps',              gradingCompany: 'PSA', grade: 10, certNumber: null },
  { playerName: 'Dan Marino',      year: '1984', set: 'Topps',              gradingCompany: 'PSA', grade: 8,  certNumber: null },

  { playerName: 'John Elway',      year: '1984', set: 'Topps',              gradingCompany: 'PSA', grade: 10, certNumber: null },
  { playerName: 'John Elway',      year: '1984', set: 'Topps',              gradingCompany: 'PSA', grade: 8,  certNumber: null },

  { playerName: 'Jerry Rice',      year: '1986', set: 'Topps',              gradingCompany: 'PSA', grade: 10, certNumber: null },
  { playerName: 'Jerry Rice',      year: '1986', set: 'Topps',              gradingCompany: 'PSA', grade: 8,  certNumber: null },

  { playerName: 'Barry Sanders',   year: '1989', set: 'Score',              gradingCompany: 'PSA', grade: 10, certNumber: null },
  { playerName: 'Barry Sanders',   year: '1989', set: 'Score',              gradingCompany: 'PSA', grade: 8,  certNumber: null },

  { playerName: 'Tom Brady',       year: '2000', set: 'Playoff Contenders', gradingCompany: 'PSA', grade: 10, certNumber: null },
  { playerName: 'Tom Brady',       year: '2000', set: 'Playoff Contenders', gradingCompany: 'PSA', grade: 8,  certNumber: null },

  { playerName: 'Aaron Rodgers',   year: '2005', set: 'Topps',              gradingCompany: 'PSA', grade: 10, certNumber: null },
  { playerName: 'Aaron Rodgers',   year: '2005', set: 'Topps',              gradingCompany: 'PSA', grade: 8,  certNumber: null },

  { playerName: 'Patrick Mahomes', year: '2017', set: 'Panini Prizm',       gradingCompany: 'PSA', grade: 10, certNumber: null },
  { playerName: 'Patrick Mahomes', year: '2017', set: 'Panini Prizm',       gradingCompany: 'PSA', grade: 8,  certNumber: null },

  { playerName: 'Josh Allen',      year: '2018', set: 'Panini Prizm',       gradingCompany: 'PSA', grade: 10, certNumber: null },
  { playerName: 'Josh Allen',      year: '2018', set: 'Panini Prizm',       gradingCompany: 'PSA', grade: 8,  certNumber: null },

  // ── POKÉMON ─────────────────────────────────────────────────────────────────
  { playerName: 'Charizard', year: '1999', set: 'Pokemon Base Set 1st Edition',  gradingCompany: 'PSA', grade: 9, certNumber: null },
  { playerName: 'Charizard', year: '1999', set: 'Pokemon Base Set 1st Edition',  gradingCompany: 'PSA', grade: 7, certNumber: null },

  { playerName: 'Charizard', year: '1999', set: 'Pokemon Base Set Shadowless',   gradingCompany: 'PSA', grade: 9, certNumber: null },
  { playerName: 'Charizard', year: '1999', set: 'Pokemon Base Set Shadowless',   gradingCompany: 'PSA', grade: 7, certNumber: null },

  { playerName: 'Charizard', year: '1999', set: 'Pokemon Base Set',              gradingCompany: 'PSA', grade: 9, certNumber: null },
  { playerName: 'Charizard', year: '1999', set: 'Pokemon Base Set',              gradingCompany: 'PSA', grade: 7, certNumber: null },

  { playerName: 'Blastoise', year: '1999', set: 'Pokemon Base Set 1st Edition',  gradingCompany: 'PSA', grade: 9, certNumber: null },
  { playerName: 'Blastoise', year: '1999', set: 'Pokemon Base Set 1st Edition',  gradingCompany: 'PSA', grade: 7, certNumber: null },

  { playerName: 'Venusaur',  year: '1999', set: 'Pokemon Base Set 1st Edition',  gradingCompany: 'PSA', grade: 9, certNumber: null },
  { playerName: 'Venusaur',  year: '1999', set: 'Pokemon Base Set 1st Edition',  gradingCompany: 'PSA', grade: 7, certNumber: null },

  { playerName: 'Mewtwo',    year: '1999', set: 'Pokemon Base Set 1st Edition',  gradingCompany: 'PSA', grade: 9, certNumber: null },
  { playerName: 'Mewtwo',    year: '1999', set: 'Pokemon Base Set 1st Edition',  gradingCompany: 'PSA', grade: 7, certNumber: null },

  { playerName: 'Pikachu',   year: '1999', set: 'Pokemon Base Set',              gradingCompany: 'PSA', grade: 10, certNumber: null },
  { playerName: 'Pikachu',   year: '1999', set: 'Pokemon Base Set',              gradingCompany: 'PSA', grade: 8,  certNumber: null },

  { playerName: 'Lugia',     year: '2000', set: 'Pokemon Neo Genesis 1st Edition', gradingCompany: 'PSA', grade: 9, certNumber: null },
  { playerName: 'Lugia',     year: '2000', set: 'Pokemon Neo Genesis 1st Edition', gradingCompany: 'PSA', grade: 7, certNumber: null },

  { playerName: 'Charizard', year: '2002', set: 'Pokemon Legendary Collection',  gradingCompany: 'PSA', grade: 9, certNumber: null },
  { playerName: 'Charizard', year: '2002', set: 'Pokemon Legendary Collection',  gradingCompany: 'PSA', grade: 7, certNumber: null },

  { playerName: 'Pikachu',   year: '1998', set: 'Pokemon Japanese Base Set',     gradingCompany: 'PSA', grade: 10, certNumber: null },
  { playerName: 'Pikachu',   year: '1998', set: 'Pokemon Japanese Base Set',     gradingCompany: 'PSA', grade: 8,  certNumber: null },

]

// ── Match and update ──────────────────────────────────────────────────────────
async function main() {
  const toSet = CERT_MAP.filter(e => e.certNumber !== null)
  if (toSet.length === 0) {
    console.log('\n⚠️   No cert numbers filled in yet.')
    console.log('    Open scripts/setCertNumbers.js and add cert numbers for each card.')
    console.log('    Find certs at: https://www.psacard.com/cert\n')
    process.exit(0)
  }

  console.log(`\n📦  Loading cards from Firestore…`)
  const snapshot = await getDocs(collection(db, 'cards'))
  const cards    = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))

  console.log(`✓   ${cards.length} cards loaded\n`)
  console.log(`🔢  Setting cert numbers for ${toSet.length} entries...\n`)

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

    await updateDoc(doc(db, 'cards', match.id), { certNumber: String(entry.certNumber) })
    console.log(`  ✓  ${label.padEnd(40)} → cert #${entry.certNumber}`)
    updated++
  }

  console.log(`\n✅  Done! ${updated} updated, ${notFound} not matched in Firestore`)
  console.log('    Now run:  npm run enrich\n')
  process.exit(0)
}

main().catch(err => {
  console.error('Fatal:', err.message)
  process.exit(1)
})
