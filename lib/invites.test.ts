import { eq } from 'drizzle-orm'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { db } from './db'
import {
  acceptInvite,
  createInvite,
  getInvite,
  getWalletInvites,
  revokeInvite,
} from './invites'
import { users, walletInvites, wallets } from './schema'
import { createWallet } from './wallets'

const TEST_OWNER_ID = 'test-owner-invites'
const TEST_GUEST_ID = 'test-guest-invites'

let walletId: string

beforeEach(async () => {
  await db
    .insert(users)
    .values([
      { id: TEST_OWNER_ID, name: 'Owner' },
      { id: TEST_GUEST_ID, name: 'Guest' },
    ])
    .onConflictDoNothing()

  const wallet = await createWallet(TEST_OWNER_ID, 'Test Wallet')
  walletId = wallet.id
})

afterEach(async () => {
  await db.delete(walletInvites).where(eq(walletInvites.walletId, walletId))
  await db.delete(wallets).where(eq(wallets.id, walletId))
  await db.delete(users).where(eq(users.id, TEST_OWNER_ID))
  await db.delete(users).where(eq(users.id, TEST_GUEST_ID))
})

describe('createInvite', () => {
  it('возвращает token при создании', async () => {
    const token = await createInvite(TEST_OWNER_ID, walletId)
    expect(typeof token).toBe('string')
    expect(token.length).toBeGreaterThan(0)
  })

  it('бросает ошибку если юзер не участник кошелька', async () => {
    await expect(createInvite('stranger', walletId)).rejects.toThrow(
      'Access denied',
    )
  })

  it('сохраняет email если передан', async () => {
    const token = await createInvite(
      TEST_OWNER_ID,
      walletId,
      'guest@example.com',
    )
    const invite = await getInvite(token)
    expect(invite?.email).toBe('guest@example.com')
  })
})

describe('getInvite', () => {
  it('возвращает данные инвайта с именем кошелька', async () => {
    const token = await createInvite(TEST_OWNER_ID, walletId)
    const invite = await getInvite(token)

    expect(invite?.walletId).toBe(walletId)
    expect(invite?.walletName).toBe('Test Wallet')
    expect(invite?.invitedByName).toBe('Owner')
    expect(invite?.acceptedAt).toBeNull()
  })

  it('возвращает null для несуществующего токена', async () => {
    const result = await getInvite('00000000-0000-0000-0000-000000000000')
    expect(result).toBeNull()
  })
})

describe('getWalletInvites', () => {
  it('возвращает только непринятые инвайты', async () => {
    const token1 = await createInvite(TEST_OWNER_ID, walletId)
    const token2 = await createInvite(TEST_OWNER_ID, walletId)
    await acceptInvite(TEST_GUEST_ID, token1)

    const pending = await getWalletInvites(TEST_OWNER_ID, walletId)

    expect(pending).toHaveLength(1)
    expect(pending[0].token).toBe(token2)
  })

  it('бросает ошибку если юзер не участник', async () => {
    await expect(getWalletInvites('stranger', walletId)).rejects.toThrow(
      'Access denied',
    )
  })
})

describe('acceptInvite', () => {
  it('даёт гостю доступ к кошельку', async () => {
    const token = await createInvite(TEST_OWNER_ID, walletId)
    const returnedWalletId = await acceptInvite(TEST_GUEST_ID, token)

    expect(returnedWalletId).toBe(walletId)

    // гость теперь видит кошелёк через getWalletInvites
    const pending = await getWalletInvites(TEST_OWNER_ID, walletId)
    expect(pending).toHaveLength(0)
  })

  it('помечает инвайт как принятый', async () => {
    const token = await createInvite(TEST_OWNER_ID, walletId)
    await acceptInvite(TEST_GUEST_ID, token)

    const invite = await getInvite(token)
    expect(invite?.acceptedAt).not.toBeNull()
  })

  it('бросает ошибку если инвайт уже принят', async () => {
    const token = await createInvite(TEST_OWNER_ID, walletId)
    await acceptInvite(TEST_GUEST_ID, token)

    await expect(acceptInvite(TEST_GUEST_ID, token)).rejects.toThrow(
      'Invite already accepted',
    )
  })

  it('бросает ошибку для несуществующего токена', async () => {
    await expect(
      acceptInvite(TEST_GUEST_ID, '00000000-0000-0000-0000-000000000000'),
    ).rejects.toThrow('Invite not found')
  })
})

describe('revokeInvite', () => {
  it('удаляет инвайт', async () => {
    const token = await createInvite(TEST_OWNER_ID, walletId)
    await revokeInvite(TEST_OWNER_ID, token)

    const invite = await getInvite(token)
    expect(invite).toBeNull()
  })

  it('бросает ошибку если юзер не участник кошелька', async () => {
    const token = await createInvite(TEST_OWNER_ID, walletId)
    await expect(revokeInvite('stranger', token)).rejects.toThrow(
      'Access denied',
    )
  })

  it('бросает ошибку для несуществующего токена', async () => {
    await expect(
      revokeInvite(TEST_OWNER_ID, '00000000-0000-0000-0000-000000000000'),
    ).rejects.toThrow('Invite not found')
  })
})
