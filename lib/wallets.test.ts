import { eq } from 'drizzle-orm'
import { afterEach, describe, expect, it } from 'vitest'

import { db } from './db'
import { walletMembers, wallets } from './schema'
import {
  createWallet,
  getFirstWallet,
  getWallet,
  renameWallet,
} from './wallets'

const TEST_USER_ID = 'test-user-wallets'

afterEach(async () => {
  const members = await db
    .select({ walletId: walletMembers.walletId })
    .from(walletMembers)
    .where(eq(walletMembers.userId, TEST_USER_ID))

  for (const { walletId } of members) {
    await db.delete(walletMembers).where(eq(walletMembers.walletId, walletId))
    await db.delete(wallets).where(eq(wallets.id, walletId))
  }
})

describe('getFirstWallet', () => {
  it('возвращает null если кошельков нет', async () => {
    const result = await getFirstWallet(TEST_USER_ID)
    expect(result).toBeNull()
  })

  it('возвращает кошелёк если он есть', async () => {
    await createWallet(TEST_USER_ID, 'Тест')
    const result = await getFirstWallet(TEST_USER_ID)
    expect(result).not.toBeNull()
    expect(result!.name).toBe('Тест')
  })
})

describe('getWallet', () => {
  it('возвращает null если кошелёк не принадлежит юзеру', async () => {
    const wallet = await createWallet(TEST_USER_ID, 'Чужой')
    const result = await getWallet('other-user', wallet.id)
    expect(result).toBeNull()
  })

  it('возвращает кошелёк если юзер — участник', async () => {
    const wallet = await createWallet(TEST_USER_ID, 'Мой')
    const result = await getWallet(TEST_USER_ID, wallet.id)
    expect(result?.id).toBe(wallet.id)
  })
})

describe('renameWallet', () => {
  it('переименовывает кошелёк', async () => {
    const wallet = await createWallet(TEST_USER_ID, 'Старое имя')
    await renameWallet(TEST_USER_ID, wallet.id, 'Новое имя')
    const updated = await getWallet(TEST_USER_ID, wallet.id)
    expect(updated?.name).toBe('Новое имя')
  })

  it('бросает ошибку если юзер не участник', async () => {
    const wallet = await createWallet(TEST_USER_ID, 'Чужой')
    await expect(
      renameWallet('other-user', wallet.id, 'Взлом'),
    ).rejects.toThrow()
  })
})

describe('createWallet', () => {
  it('создаёт кошелёк и добавляет юзера как owner', async () => {
    const wallet = await createWallet(TEST_USER_ID, 'Мой кошелёк')

    expect(wallet.name).toBe('Мой кошелёк')
    expect(wallet.id).toBeDefined()

    const [member] = await db
      .select()
      .from(walletMembers)
      .where(eq(walletMembers.walletId, wallet.id))

    expect(member.userId).toBe(TEST_USER_ID)
    expect(member.role).toBe('owner')
  })
})
