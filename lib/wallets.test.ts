import { eq } from 'drizzle-orm'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { db } from './db'
import { transactions, users, walletMembers, wallets } from './schema'
import { createTransaction } from './transactions'
import {
  addWalletMember,
  createWallet,
  deleteWallet,
  getFirstWallet,
  getWallet,
  getWalletMembers,
  getWallets,
  removeWalletMember,
  renameWallet,
} from './wallets'

const TEST_USER_ID = 'test-user-wallets'
const TEST_GUEST_ID = 'test-guest-wallets'

beforeEach(async () => {
  await db
    .insert(users)
    .values([
      { id: TEST_USER_ID, name: 'Test Owner' },
      { id: TEST_GUEST_ID, name: 'Test Guest' },
    ])
    .onConflictDoNothing()
})

afterEach(async () => {
  const members = await db
    .select({ walletId: walletMembers.walletId })
    .from(walletMembers)
    .where(eq(walletMembers.userId, TEST_USER_ID))

  for (const { walletId } of members) {
    await db.delete(wallets).where(eq(wallets.id, walletId))
  }

  await db.delete(users).where(eq(users.id, TEST_USER_ID))
  await db.delete(users).where(eq(users.id, TEST_GUEST_ID))
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

describe('getWallets', () => {
  it('возвращает пустой массив если кошельков нет', async () => {
    const result = await getWallets(TEST_USER_ID)
    expect(result).toEqual([])
  })

  it('возвращает все кошельки юзера', async () => {
    await createWallet(TEST_USER_ID, 'А')
    await createWallet(TEST_USER_ID, 'Б')
    const result = await getWallets(TEST_USER_ID)
    expect(result).toHaveLength(2)
    expect(result.map((w) => w.name)).toEqual(['А', 'Б'])
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

describe('deleteWallet', () => {
  it('owner удаляет кошелёк вместе с участниками и транзакциями (каскад)', async () => {
    const wallet = await createWallet(TEST_USER_ID, 'На удаление')
    await addWalletMember(wallet.id, TEST_GUEST_ID)
    await createTransaction(TEST_USER_ID, wallet.id, {
      amount: 100,
      currency: 'RSD',
      type: 'expense',
      date: '2024-01-15',
    })

    await deleteWallet(TEST_USER_ID, wallet.id)

    const [w] = await db.select().from(wallets).where(eq(wallets.id, wallet.id))
    expect(w).toBeUndefined()

    const members = await db
      .select()
      .from(walletMembers)
      .where(eq(walletMembers.walletId, wallet.id))
    expect(members).toHaveLength(0)

    const txs = await db
      .select()
      .from(transactions)
      .where(eq(transactions.walletId, wallet.id))
    expect(txs).toHaveLength(0)
  })

  it('бросает ошибку если вызывает не owner', async () => {
    const wallet = await createWallet(TEST_USER_ID, 'Чужой')
    await addWalletMember(wallet.id, TEST_GUEST_ID)
    await expect(deleteWallet(TEST_GUEST_ID, wallet.id)).rejects.toThrow(
      'Only owner can delete wallet',
    )
  })
})

describe('getWalletMembers', () => {
  it('возвращает участников с именем и email', async () => {
    const wallet = await createWallet(TEST_USER_ID, 'Общий')
    await addWalletMember(wallet.id, TEST_GUEST_ID)

    const members = await getWalletMembers(TEST_USER_ID, wallet.id)

    expect(members).toHaveLength(2)
    expect(members.find((m) => m.role === 'owner')?.userId).toBe(TEST_USER_ID)
    expect(members.find((m) => m.role === 'member')?.userId).toBe(TEST_GUEST_ID)
  })

  it('бросает ошибку если юзер не участник', async () => {
    const wallet = await createWallet(TEST_USER_ID, 'Чужой')
    await expect(getWalletMembers('stranger', wallet.id)).rejects.toThrow(
      'Access denied',
    )
  })
})

describe('addWalletMember', () => {
  it('добавляет гостя как member', async () => {
    const wallet = await createWallet(TEST_USER_ID, 'Общий')
    await addWalletMember(wallet.id, TEST_GUEST_ID)

    const result = await getWallet(TEST_GUEST_ID, wallet.id)
    expect(result?.id).toBe(wallet.id)
  })

  it('идемпотентен — повторный вызов не бросает ошибку', async () => {
    const wallet = await createWallet(TEST_USER_ID, 'Общий')
    await addWalletMember(wallet.id, TEST_GUEST_ID)
    await expect(
      addWalletMember(wallet.id, TEST_GUEST_ID),
    ).resolves.toBeUndefined()
  })
})

describe('removeWalletMember', () => {
  it('owner удаляет гостя', async () => {
    const wallet = await createWallet(TEST_USER_ID, 'Общий')
    await addWalletMember(wallet.id, TEST_GUEST_ID)

    await removeWalletMember(TEST_USER_ID, wallet.id, TEST_GUEST_ID)

    const result = await getWallet(TEST_GUEST_ID, wallet.id)
    expect(result).toBeNull()
  })

  it('бросает ошибку если вызывает не owner', async () => {
    const wallet = await createWallet(TEST_USER_ID, 'Общий')
    await addWalletMember(wallet.id, TEST_GUEST_ID)

    await expect(
      removeWalletMember(TEST_GUEST_ID, wallet.id, TEST_USER_ID),
    ).rejects.toThrow('Only owner can remove members')
  })

  it('бросает ошибку если owner пытается удалить себя', async () => {
    const wallet = await createWallet(TEST_USER_ID, 'Мой')
    await expect(
      removeWalletMember(TEST_USER_ID, wallet.id, TEST_USER_ID),
    ).rejects.toThrow('Owner cannot remove themselves')
  })
})
