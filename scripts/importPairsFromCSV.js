/**
 * scripts/importPairsFromCSV.js
 *
 * Reads the Fanatics CSV and writes ONLY valid pairs to Firestore.
 * A valid pair = same physical card (player+set+year+number+company)
 * graded at two different levels with a gap of 1–3.
 *
 * When multiple rows share the same player+set+year+number+company+grade,
 * the one with the highest price is used (most recent / best condition).
 *
 * Usage:
 *   node scripts/importPairsFromCSV.js [path-to-csv]
 *   npm run import:pairs
 */

import { initializeApp }                                          from 'firebase/app'
import { getFirestore, collection, writeBatch, doc, Timestamp }  from 'firebase/firestore'
import { readFileSync }                                           from 'fs'

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

// ── CSV helpers ───────────────────────────────────────────────────────────────

function parseCSVLine(line) {
  const fields = []
  let current = ''
  let inQuotes = false
  for (const ch of line) {
    if (ch === '"') { inQuotes = !inQuotes }
    else if (ch === ',' && !inQuotes) { fields.push(current.trim()); current = '' }
    else { current += ch }
  }
  fields.push(current.trim())
  return fields
}

// "PSA 9 MINT" → { company: 'PSA', grade: 9 }
function parseGrade(str) {
  const parts = str.trim().split(/\s+/)
  if (parts.length < 2) return null
  const company = parts[0].toUpperCase()
  const grade   = parseFloat(parts[1])
  if (isNaN(grade)) return null
  return { company, grade }
}

// "$34,000" → 34000
function parsePrice(str) {
  const n = parseFloat(str.replace(/[$,]/g, ''))
  return isNaN(n) ? null : n
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const csvPath = process.argv[2] ?? '/Users/jessefriedman/Downloads/fanatics_psa_cards_500_final.csv'
  console.log(`📄  Reading: ${csvPath}`)

  const lines  = readFileSync(csvPath, 'utf8').trim().split('\n')
  const header = parseCSVLine(lines[0])
  console.log(`    Columns: ${header.join(' | ')}\n`)

  // Parse every row into a structured object
  const rows = lines.slice(1).flatMap(line => {
    const f = parseCSVLine(line)
    const gradeInfo = parseGrade(f[1] ?? '')
    if (!gradeInfo) return []
    const price = parsePrice(f[6] ?? '')
    const imageUrl = f[8]?.trim() || null
    if (!imageUrl) return []
    return [{
      certNumber:  f[0]?.replace(/\D/g, '') || null,
      company:     gradeInfo.company,
      grade:       gradeInfo.grade,
      playerName:  f[2]?.trim() ?? '',
      set:         f[3]?.trim() ?? '',
      year:        f[4]?.trim() ?? '',
      number:      f[5]?.trim() ?? '',
      price,
      fanaticUrl:  f[7]?.trim() || null,
      imageUrl,
    }]
  })

  console.log(`    ${rows.length} usable rows (numeric grade + image URL)\n`)

  // Group by the "same physical card" key
  const groups = {}
  for (const row of rows) {
    const key = `${row.playerName}__${row.set}__${row.year}__${row.number}__${row.company}`
    if (!groups[key]) groups[key] = []
    groups[key].push(row)
  }

  // Within each group, keep one card per grade (highest price wins on ties),
  // then find all pairs with a grade gap of 1–3.
  const pairs = []

  for (const [, group] of Object.entries(groups)) {
    // Deduplicate by grade: keep highest-price row for each grade
    const byGrade = {}
    for (const row of group) {
      const existing = byGrade[row.grade]
      if (!existing || (row.price ?? 0) > (existing.price ?? 0)) {
        byGrade[row.grade] = row
      }
    }

    const cards = Object.values(byGrade)
    for (let i = 0; i < cards.length; i++) {
      for (let j = i + 1; j < cards.length; j++) {
        const gap = Math.abs(cards[i].grade - cards[j].grade)
        if (gap >= 1 && gap <= 3) {
          pairs.push([cards[i], cards[j]])
        }
      }
    }
  }

  console.log(`🔗  Found ${pairs.length} valid pairs\n`)

  if (pairs.length === 0) {
    console.log('No pairs found — check that the CSV has multiple grades for the same card.')
    process.exit(0)
  }

  // Write to Firestore in batches of 500
  const cardsRef = collection(db, 'cards')
  const allDocs  = []

  for (const [a, b] of pairs) {
    for (const card of [a, b]) {
      allDocs.push({
        playerName:    card.playerName,
        year:          card.year,
        set:           card.set,
        number:        card.number,
        gradingCompany: card.company,
        grade:         card.grade,
        price:         card.price,
        certNumber:    card.certNumber,
        fanaticUrl:    card.fanaticUrl,
        images:        { front: card.imageUrl, back: null, label: null },
        updatedAt:     Timestamp.now(),
      })
    }
  }

  // Deduplicate: same card (same cert or same key+grade) may appear in
  // multiple pairs — only write it once.
  const seen = new Set()
  const unique = allDocs.filter(d => {
    const key = d.certNumber
      ?? `${d.playerName}__${d.set}__${d.year}__${d.number}__${d.gradingCompany}__${d.grade}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  console.log(`📦  Writing ${unique.length} unique card documents…`)

  for (let i = 0; i < unique.length; i += 500) {
    const batch = writeBatch(db)
    unique.slice(i, i + 500).forEach(data => batch.set(doc(cardsRef), data))
    await batch.commit()
    console.log(`    batch ${Math.floor(i / 500) + 1} committed (${Math.min(i + 500, unique.length)}/${unique.length})`)
  }

  console.log(`\n✅  Done! ${pairs.length} pairs (${unique.length} cards) imported.`)
  process.exit(0)
}

main().catch(err => {
  console.error('Fatal:', err.message)
  process.exit(1)
})
