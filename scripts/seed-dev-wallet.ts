import { db } from '../lib/db'
import { walletMembers, wallets } from '../lib/schema'

async function main() {
  const [wallet] = await db.insert(wallets).values({ name: 'Dev wallet' }).returning()
  await db.insert(walletMembers).values({ walletId: wallet.id, userId: 'dev-user', role: 'owner' })
  console.log(wallet.id)
}

main().catch(console.error)
