/**
 * scripts/enrichFromPSA.js
 *
 * For every card in Firestore that has a certNumber field, calls the PSA
 * public cert API and writes back:
 *   • images.front  — PSA's official front-of-card photo (no slab label)
 *   • images.back   — PSA's official back-of-card photo
 *   • grade         — confirmed grade from PSA (authoritative)
 *   • psaUrl        — direct link to the cert on psacard.com
 *   • updatedAt     — timestamp
 *
 * Cards without a certNumber are skipped with a warning.
 * Use scripts/setCertNumbers.js to load cert numbers into Firestore first.
 *
 * ── SETUP ─────────────────────────────────────────────────────────────────────
 *
 *  1. Create a free PSA account at https://www.psacard.com
 *     Then go to https://www.psacard.com/api to read the docs.
 *
 *  2. Add your PSA login credentials to .env:
 *       PSA_EMAIL=your_psa_email@example.com
 *       PSA_PASSWORD=your_psa_password
 *
 *     The script uses OAuth2 password grant to get a Bearer token automatically.
 *     Credentials stay in .env — never exposed in the browser.
 *     Free accounts: 100 API calls/day (enough for the full 100-card catalog).
 *
 *  3. Load cert numbers into Firestore:
 *       npm run set-certs
 *
 *  4. Run enrichment:
 *       npm run enrich              (all cards with cert numbers)
 *       npm run enrich:test         (first 6 only)
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

const PSA_EMAIL    = process.env.PSA_EMAIL
const PSA_PASSWORD = process.env.PSA_PASSWORD
const LIMIT        = process.env.TEST_LIMIT ? parseInt(process.env.TEST_LIMIT) : Infinity

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

// ── PSA OAuth2 — password grant ───────────────────────────────────────────────
// PSA uses OAuth2 password grant: exchange email + password for a Bearer token.
// Token is fetched once per script run and reused for all cert lookups.
async function getPSAToken() {
  const res = await fetch('https://api.psacard.com/publicapi/auth/accesstoken', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ username: PSA_EMAIL, password: PSA_PASSWORD }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`PSA auth failed (${res.status}): ${text.slice(0, 200)}`)
  }
  const data = await res.json()
  // PSA returns the token in different shapes — handle both
  const token = data.access_token ?? data.Token ?? data.token
  if (!token) throw new Error(`PSA auth: no token in response — ${JSON.stringify(data).slice(0, 200)}`)
  return token
}

// ── PSA cert lookup ───────────────────────────────────────────────────────────
async function getPSACert(token, certNumber) {
  const res = await fetch(
    `https://api.psacard.com/publicapi/cert/GetByCertNumber/${certNumber}`,
    { headers: { 'Authorization': `bearer ${token}` } }
  )
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`PSA API ${res.status}: ${text.slice(0, 120)}`)
  }
  const data = await res.json()
  return data.PSACert ?? null
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  if (!PSA_EMAIL || !PSA_PASSWORD) {
    console.error('\n❌  PSA_EMAIL and PSA_PASSWORD must be set in .env')
    console.error('    Use your psacard.com login credentials.\n')
    process.exit(1)
  }

  console.log('🔑  Getting PSA access token…')
  const token = await getPSAToken()
  console.log('✓   Token received\n')

  console.log('📦  Loading cards from Firestore…')
  const snapshot  = await getDocs(collection(db, 'cards'))
  const all       = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
  const withCert  = all.filter(c => c.certNumber)
  const noCert    = all.filter(c => !c.certNumber)
  const toProcess = LIMIT < Infinity ? withCert.slice(0, LIMIT) : withCert

  console.log(`✓   ${all.length} cards total`)
  console.log(`    ${withCert.length} have cert numbers — processing ${toProcess.length}`)
  if (noCert.length > 0) {
    console.log(`    ${noCert.length} missing cert numbers — run npm run set-certs first`)
  }
  console.log()

  let updated = 0, failed = 0

  for (const card of toProcess) {
    const label = `${card.playerName}  ${card.gradingCompany} ${card.grade}`
    process.stdout.write(`  ${label.padEnd(40)} cert #${card.certNumber}  `)

    try {
      const cert = await getPSACert(token, card.certNumber)

      if (!cert) {
        console.log('— cert not found')
        failed++
        continue
      }

      const frontImage = cert.PlayerImgFront ?? cert.ImageFront ?? null
      const backImage  = cert.PlayerImgBack  ?? cert.ImageBack  ?? null
      const grade      = cert.CardGrade ?? cert.Grade ?? card.grade
      const psaUrl     = `https://www.psacard.com/cert/${card.certNumber}`

      await updateDoc(doc(db, 'cards', card.id), {
        'images.front': frontImage,
        'images.back':  backImage,
        grade:          parseFloat(grade) || grade,
        psaUrl,
        updatedAt:      Timestamp.now(),
      })

      console.log(`grade ${grade}  ✓`)
      updated++
    } catch (err) {
      console.log(`— error: ${err.message}`)
      failed++
    }

    // Respect PSA rate limits — free tier allows ~3 requests/second
    await new Promise(r => setTimeout(r, 400))
  }

  console.log(`\n✅  Done! ${updated} updated, ${failed} failed`)
  if (failed > 0) console.log('    Check cert numbers in Firestore — some may be incorrect.')
  process.exit(0)
}

main().catch(err => {
  console.error('Fatal:', err.message)
  process.exit(1)
})
