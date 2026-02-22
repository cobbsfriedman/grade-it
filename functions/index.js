/**
 * Firebase Cloud Functions — Grade It backend
 *
 * functions/index.js
 *
 * To deploy:
 *   cd functions
 *   npm install
 *   firebase deploy --only functions
 */

// const { onSchedule } = require('firebase-functions/v2/scheduler')
// const { initializeApp } = require('firebase-admin/app')
// const { getFirestore } = require('firebase-admin/firestore')
// const axios = require('axios')

// initializeApp()

/**
 * dailyEbayRefresh — runs every day at 3 AM UTC
 *
 * For each card in the `cards` Firestore collection:
 *   1. Search eBay's Finding API for recent sold listings matching
 *      the card's player, year, set, and grade
 *   2. Parse the most recent sold price
 *   3. Update the card's `price`, `ebayUrl`, and `updatedAt` fields
 *
 * eBay API docs: https://developer.ebay.com/api-docs/buy/browse/overview.html
 *
 * TODO: Set EBAY_API_KEY in Firebase environment config:
 *   firebase functions:config:set ebay.api_key="YOUR_KEY"
 */

/*
exports.dailyEbayRefresh = onSchedule('every day 03:00', async (event) => {
  const db = getFirestore()
  const cardsRef = db.collection('cards')
  const snap = await cardsRef.get()

  const updates = snap.docs.map(async (doc) => {
    const card = doc.data()
    const query = buildEbayQuery(card)

    try {
      const result = await searchEbaySoldListings(query)
      if (result) {
        await doc.ref.update({
          price: result.price,
          ebayUrl: result.url,
          updatedAt: new Date(),
        })
      }
    } catch (err) {
      console.error(`Failed to update card ${doc.id}:`, err.message)
    }
  })

  await Promise.allSettled(updates)
  console.log(`Refreshed ${snap.size} cards`)
})

function buildEbayQuery(card) {
  // e.g. "2011 Topps Update Mike Trout US175 PSA 9"
  return `${card.year} ${card.set} ${card.playerName} ${card.number} ${card.gradingCompany} ${card.grade}`
}

async function searchEbaySoldListings(query) {
  // TODO: call eBay Finding API (findCompletedItems)
  // Return { price: number, url: string } or null
  return null
}
*/

// Export placeholder so the functions file is valid JS
exports.placeholder = null
