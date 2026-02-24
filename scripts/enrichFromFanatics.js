/**
 * scripts/enrichFromFanatics.js
 *
 * For every card in Firestore that has a fanaticUrl set, fetches the
 * Fanatics Collect premier listing page and writes back:
 *   • certNumber    — PSA/BGS cert number (from psacard.com/cert link on the page)
 *   • price         — final sale price
 *   • fanaticUrl    — the listing URL (already stored, confirmed live)
 *   • updatedAt     — timestamp
 *
 * Images are NOT sourced here — run enrichFromPSA.js after this to pull
 * official PSA cert images using the cert numbers this script writes.
 *
 * ── SETUP ─────────────────────────────────────────────────────────────────────
 *
 *  1. Populate Firestore with Fanatics listing URLs:
 *       npm run set-fanatics
 *
 *  2. Run this script:
 *       npm run enrich:fanatics          (all cards with fanaticUrl)
 *       npm run enrich:fanatics:test     (first 6 only)
 *
 *  3. Then pull PSA images:
 *       npm run enrich                   (enrichFromPSA.js)
 */

import { initializeApp }                                                from 'firebase/app'
import { getFirestore, collection, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore'
import { readFileSync }                                                  from 'fs'

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

const LIMIT = process.env.TEST_LIMIT ? parseInt(process.env.TEST_LIMIT) : Infinity

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
}

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

// ── Scrape a Fanatics Collect premier page ────────────────────────────────────
async function scrapeFanaticsPage(url) {
  const res = await fetch(url, { headers: HEADERS })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const html = await res.text()

  // Cert number — appears as a link to psacard.com/cert/{number} or beckett.com
  const psaCertMatch  = html.match(/psacard\.com\/cert\/(\d+)/i)
  const bgsInUrl      = url.toLowerCase().includes('bgs')
  // BGS cert numbers can appear as: beckett.com/grading/cert/XXXXXXXX
  const bgsCertMatch  = html.match(/beckett\.com\/grading\/cert\/(\d+)/i)
  const certNumber    = psaCertMatch?.[1] ?? bgsCertMatch?.[1] ?? null

  // Price + name from JSON-LD
  let price = null
  let name  = null
  const jsonLdMatch = html.match(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i)
  if (jsonLdMatch) {
    try {
      const data = JSON.parse(jsonLdMatch[1])
      price = data?.offers?.price ? parseFloat(data.offers.price) : null
      name  = data?.name ?? null
    } catch { /* malformed JSON-LD — skip */ }
  }

  return { certNumber, price, name }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('📦  Loading cards from Firestore…')
  const snapshot    = await getDocs(collection(db, 'cards'))
  const all         = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
  const withUrl     = all.filter(c => c.fanaticUrl)
  const toProcess   = LIMIT < Infinity ? withUrl.slice(0, LIMIT) : withUrl

  console.log(`✓   ${all.length} cards total`)
  console.log(`    ${withUrl.length} have Fanatics URLs — processing ${toProcess.length}`)
  console.log(`    ${all.length - withUrl.length} missing Fanatics URLs — run npm run set-fanatics first\n`)

  let updated = 0, failed = 0

  for (const card of toProcess) {
    const label = `${card.playerName}  ${card.gradingCompany} ${card.grade}`
    process.stdout.write(`  ${label.padEnd(40)} `)

    try {
      const { certNumber, price, name } = await scrapeFanaticsPage(card.fanaticUrl)

      const update = { updatedAt: Timestamp.now() }
      if (certNumber) update.certNumber = certNumber
      if (price)      update.price      = price

      await updateDoc(doc(db, 'cards', card.id), update)

      const certStr  = certNumber ? `cert #${certNumber}` : 'no cert'
      const priceStr = price ? `$${price.toLocaleString()}` : 'no price'
      console.log(`${certStr}  ${priceStr}  ✓`)
      updated++
    } catch (err) {
      console.log(`— ${err.message}`)
      failed++
    }

    await new Promise(r => setTimeout(r, 600))
  }

  console.log(`\n✅  Done! ${updated} updated, ${failed} failed`)
  if (updated > 0) console.log('    Now run: npm run enrich   (to pull PSA cert images)')
  process.exit(0)
}

main().catch(err => {
  console.error('Fatal:', err.message)
  process.exit(1)
})
