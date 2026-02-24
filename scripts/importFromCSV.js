/**
 * scripts/importFromCSV.js
 *
 * Reads fanatics_psa_cards_500_final.csv and matches each row to a Firestore
 * card document, writing back:
 *   • certNumber    — PSA cert number
 *   • price         — sale price (parsed from "$X,XXX" format)
 *   • fanaticUrl    — Fanatics Collect listing URL
 *   • images.front  — Fanatics vault CDN image URL (stable, no auth required)
 *   • updatedAt     — timestamp
 *
 * Matching: playerName + year + gradingCompany + grade (numeric).
 * Set name differences between CSV and Firestore are handled by fuzzy matching.
 * When multiple CSV rows match one Firestore card, the first (newest) is used.
 *
 * Usage:
 *   node scripts/importFromCSV.js [path-to-csv]
 *   npm run import:csv
 */

import { initializeApp }                                                from 'firebase/app'
import { getFirestore, collection, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore'
import { readFileSync }                                                  from 'fs'

// ── Load .env ─────────────────────────────────────────────────────────────────
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

// ── Firebase ──────────────────────────────────────────────────────────────────
const app = initializeApp({
  apiKey:            'AIzaSyCiBThAWaijrNQYwPDJW6qVWpLGKMxM0Hs',
  authDomain:        'grade-it-3054b.firebaseapp.com',
  projectId:         'grade-it-3054b',
  storageBucket:     'grade-it-3054b.firebasestorage.app',
  messagingSenderId: '579296815791',
  appId:             '1:579296815791:web:6907fd657c4d2d2535425a',
})
const db = getFirestore(app)

// ── CSV parsing ───────────────────────────────────────────────────────────────
// Handles quoted fields that may contain commas (e.g. "$1,200")
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

// Parse "PSA 9 MINT" → { company: 'PSA', grade: 9 }
// Returns null for non-numeric grades (e.g. "PSA Authentic")
function parseGrade(gradeStr) {
  const parts = gradeStr.trim().split(/\s+/)
  if (parts.length < 2) return null
  const company = parts[0].toUpperCase()
  const grade   = parseFloat(parts[1])
  if (isNaN(grade)) return null
  return { company, grade }
}

// Parse "$34,000" → 34000
function parsePrice(priceStr) {
  const n = parseFloat(priceStr.replace(/[$,]/g, ''))
  return isNaN(n) ? null : n
}

// Fuzzy set match — returns true if the CSV set name is "close enough" to the
// Firestore set name. Handles common abbreviations and partial overlaps.
function setsMatch(csvSet, fsSet) {
  const a = csvSet.toLowerCase().trim()
  const b = fsSet.toLowerCase().trim()
  if (a === b) return true
  // Check if one contains the other (handles "Topps" matching "Topps Update")
  if (a.includes(b) || b.includes(a)) return true
  // "Panini Prizm" matches "Panini Prizm" variants
  const firstWordA = a.split(/\s+/)[0]
  const firstWordB = b.split(/\s+/)[0]
  // For our catalog, same first word + same year + same player is usually enough
  // (e.g. "Panini" in CSV vs "Panini Prizm" in Firestore)
  return firstWordA === firstWordB
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const csvPath = process.argv[2] ?? '/Users/jessefriedman/Downloads/fanatics_psa_cards_500_final.csv'

  console.log(`📄  Reading CSV: ${csvPath}`)
  const lines  = readFileSync(csvPath, 'utf8').trim().split('\n')
  const header = parseCSVLine(lines[0])
  console.log(`    Columns: ${header.join(' | ')}`)

  const csvRows = lines.slice(1).map(line => {
    const f = parseCSVLine(line)
    return {
      certNumber: f[0]?.replace(/\D/g, '') || null,
      gradeStr:   f[1] ?? '',
      player:     f[2] ?? '',
      set:        f[3] ?? '',
      year:       f[4] ?? '',
      cardNum:    f[5] ?? '',
      price:      parsePrice(f[6]),
      fanaticUrl: f[7] ?? null,
      imageUrl:   f[8] ?? null,
    }
  }).filter(r => {
    const g = parseGrade(r.gradeStr)
    return g !== null && r.player && r.year && r.certNumber
  })

  console.log(`    ${csvRows.length} usable rows (numeric grade, has cert number)\n`)

  console.log('📦  Loading cards from Firestore…')
  const snapshot = await getDocs(collection(db, 'cards'))
  const fsCards  = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
  console.log(`✓   ${fsCards.length} Firestore cards loaded\n`)

  let updated = 0, skipped = 0

  for (const card of fsCards) {
    const label = `${card.playerName}  ${card.gradingCompany} ${card.grade}`

    // Find matching CSV rows: same player, year, company, grade
    const matches = csvRows.filter(r => {
      const g = parseGrade(r.gradeStr)
      return (
        r.player.toLowerCase().includes(card.playerName.toLowerCase()) &&
        r.year === String(card.year) &&
        g.company === (card.gradingCompany ?? '').toUpperCase() &&
        g.grade === parseFloat(card.grade)
      )
    })

    if (matches.length === 0) {
      console.log(`  —  ${label.padEnd(42)} no CSV match`)
      skipped++
      continue
    }

    // Among matches, prefer those where set names are closer
    const ranked = matches.sort((a, b) => {
      const aMatch = setsMatch(a.set, card.set ?? '') ? 0 : 1
      const bMatch = setsMatch(b.set, card.set ?? '') ? 0 : 1
      return aMatch - bMatch
    })

    const best = ranked[0]

    await updateDoc(doc(db, 'cards', card.id), {
      certNumber:     best.certNumber,
      price:          best.price,
      fanaticUrl:     best.fanaticUrl,
      'images.front': best.imageUrl,
      updatedAt:      Timestamp.now(),
    })

    console.log(`  ✓  ${label.padEnd(42)} cert #${best.certNumber}  $${best.price?.toLocaleString()}`)
    updated++
  }

  console.log(`\n✅  Done! ${updated} updated, ${skipped} no CSV match`)
  console.log(`    Cards without a match need another data source (baseball/football/Pokémon).`)
  process.exit(0)
}

main().catch(err => {
  console.error('Fatal:', err.message)
  process.exit(1)
})
