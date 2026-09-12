import { describe, it, expect, beforeEach, vi } from 'vitest';
import { nextTick } from 'vue';

const STORAGE_KEY = 'laptop-spec:favorites';

/** 最小 localStorage 假物件，vitest 預設跑在 node 環境沒有這個 API */
function stubStorage(initial = {}) {
  const store = { ...initial };
  globalThis.localStorage = {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
  };
  return store;
}

/** 每個 case 都要重新 import，因為收藏是模組層級單例 */
async function freshUseFavorites() {
  vi.resetModules();
  return (await import('../../src/hooks/useFavorites.js')).useFavorites();
}

describe('useFavorites', () => {
  beforeEach(() => stubStorage());

  it('一開始是空的', async () => {
    const { favorites } = await freshUseFavorites();
    expect(favorites.value).toEqual([]);
  });

  it('toggle 可以加入與移除', async () => {
    const { favorites, isFavorite, toggleFavorite } = await freshUseFavorites();

    toggleFavorite('HP ZBook');
    expect(isFavorite('HP ZBook')).toBe(true);
    expect(favorites.value).toEqual(['HP ZBook']);

    toggleFavorite('HP ZBook');
    expect(isFavorite('HP ZBook')).toBe(false);
    expect(favorites.value).toEqual([]);
  });

  it('收藏會寫回 localStorage', async () => {
    const store = stubStorage();
    const { toggleFavorite } = await freshUseFavorites();

    toggleFavorite('HP ZBook');
    await nextTick();  // Vue watcher 是非同步 flush

    expect(JSON.parse(store[STORAGE_KEY])).toEqual(['HP ZBook']);
  });

  it('從 localStorage 還原既有收藏', async () => {
    stubStorage({ [STORAGE_KEY]: JSON.stringify(['ASUS Zenbook']) });
    const { isFavorite } = await freshUseFavorites();
    expect(isFavorite('ASUS Zenbook')).toBe(true);
  });

  it('壞掉的 JSON 不會炸，回退成空清單', async () => {
    stubStorage({ [STORAGE_KEY]: '{ not json' });
    const { favorites } = await freshUseFavorites();
    expect(favorites.value).toEqual([]);
  });

  it('非陣列或非字串內容會被濾掉', async () => {
    stubStorage({ [STORAGE_KEY]: JSON.stringify(['ok', 123, null]) });
    const { favorites } = await freshUseFavorites();
    expect(favorites.value).toEqual(['ok']);
  });

  it('localStorage 不可用時不丟錯', async () => {
    globalThis.localStorage = {
      getItem: () => { throw new Error('blocked'); },
      setItem: () => { throw new Error('blocked'); },
    };
    const { favorites, toggleFavorite } = await freshUseFavorites();
    expect(favorites.value).toEqual([]);
    expect(() => toggleFavorite('X')).not.toThrow();
  });
});
