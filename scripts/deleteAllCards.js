/**
 * scripts/deleteAllCards.js
 *
 * Deletes every document in the 'cards' collection so you can start fresh.
 * Run before re-seeding to avoid duplicates.
 *
 * Usage:
 *   node scripts/deleteAllCards.js
 */

import { initializeApp }                              from 'firebase/app'
import { getFirestore, collection, getDocs, writeBatch, doc } from 'firebase/firestore'
import { readFileSync }                               from 'fs'

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

async function deleteAll() {
  console.log('🗑   Loading cards collection…')
  const snap = await getDocs(collection(db, 'cards'))
  console.log(`    ${snap.docs.length} documents to delete`)

  // Firestore batch max = 500 ops
  const chunks = []
  for (let i = 0; i < snap.docs.length; i += 500) {
    chunks.push(snap.docs.slice(i, i + 500))
  }

  for (const chunk of chunks) {
    const batch = writeBatch(db)
    chunk.forEach(d => batch.delete(doc(db, 'cards', d.id)))
    await batch.commit()
  }

  console.log('✅  All cards deleted.')
  process.exit(0)
}

deleteAll().catch(err => {
  console.error('Fatal:', err.message)
  process.exit(1)
})
