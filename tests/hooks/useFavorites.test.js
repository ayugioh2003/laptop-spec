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
  const mod = await import('../../src/hooks/useFavorites.js');
  return { ...mod.useFavorites(), resolveFavorites: mod.resolveFavorites };
}

const laptop = (name, price = 30000) => ({
  name,
  property: { price, brand: 'DELL', size: 13, ramMax: 32, weight: 1.2 },
});

describe('useFavorites', () => {
  beforeEach(() => stubStorage());

  it('一開始是空的', async () => {
    const { favorites } = await freshUseFavorites();
    expect(favorites.value).toEqual([]);
  });

  it('toggle 可以加入與移除', async () => {
    const { favorites, isFavorite, toggleFavorite } = await freshUseFavorites();

    toggleFavorite(laptop('HP ZBook'));
    expect(isFavorite('HP ZBook')).toBe(true);
    expect(favorites.value.map((f) => f.name)).toEqual(['HP ZBook']);

    toggleFavorite(laptop('HP ZBook'));
    expect(isFavorite('HP ZBook')).toBe(false);
    expect(favorites.value).toEqual([]);
  });

  it('收藏會寫回 localStorage', async () => {
    const store = stubStorage();
    const { toggleFavorite } = await freshUseFavorites();

    toggleFavorite(laptop('HP ZBook', 42000));
    await nextTick();  // Vue watcher 是非同步 flush

    const saved = JSON.parse(store[STORAGE_KEY]);
    expect(saved).toHaveLength(1);
    expect(saved[0].name).toBe('HP ZBook');
    // 存的是整筆快照，下架後才有東西可以顯示
    expect(saved[0].property.price).toBe(42000);
  });

  it('從 localStorage 還原既有收藏', async () => {
    stubStorage({ [STORAGE_KEY]: JSON.stringify([laptop('ASUS Zenbook')]) });
    const { isFavorite } = await freshUseFavorites();
    expect(isFavorite('ASUS Zenbook')).toBe(true);
  });

  it('相容舊格式（只存字串名稱）', async () => {
    stubStorage({ [STORAGE_KEY]: JSON.stringify(['ASUS Zenbook']) });
    const { favorites, isFavorite } = await freshUseFavorites();
    expect(isFavorite('ASUS Zenbook')).toBe(true);
    expect(favorites.value).toEqual([{ name: 'ASUS Zenbook' }]);
  });

  it('壞掉的 JSON 不會炸，回退成空清單', async () => {
    stubStorage({ [STORAGE_KEY]: '{ not json' });
    const { favorites } = await freshUseFavorites();
    expect(favorites.value).toEqual([]);
  });

  it('壞掉的項目會被濾掉', async () => {
    stubStorage({ [STORAGE_KEY]: JSON.stringify([laptop('ok'), 123, null, {}]) });
    const { favorites } = await freshUseFavorites();
    expect(favorites.value.map((f) => f.name)).toEqual(['ok']);
  });

  it('localStorage 不可用時不丟錯', async () => {
    globalThis.localStorage = {
      getItem: () => { throw new Error('blocked'); },
      setItem: () => { throw new Error('blocked'); },
    };
    const { favorites, toggleFavorite } = await freshUseFavorites();
    expect(favorites.value).toEqual([]);
    expect(() => toggleFavorite(laptop('X'))).not.toThrow();
  });

  describe('resolveFavorites', () => {
    it('還在清單上的用最新資料，價格會更新', async () => {
      const { resolveFavorites } = await freshUseFavorites();
      const saved = [laptop('HP ZBook', 42000)];
      const live = [laptop('HP ZBook', 38000)];

      const result = resolveFavorites(saved, live);

      expect(result).toHaveLength(1);
      expect(result[0].discontinued).toBe(false);
      expect(result[0].property.price).toBe(38000);
    });

    it('已下架的仍然出現，標記 discontinued 並保留收藏當下的快照', async () => {
      const { resolveFavorites } = await freshUseFavorites();
      const saved = [laptop('HP ZBook', 42000)];

      const result = resolveFavorites(saved, []);

      expect(result).toHaveLength(1);
      expect(result[0].discontinued).toBe(true);
      expect(result[0].property.price).toBe(42000);
    });

    it('舊格式沒有快照又已下架的，無法顯示所以略過', async () => {
      const { resolveFavorites } = await freshUseFavorites();

      expect(resolveFavorites([{ name: '早就沒了' }], [])).toEqual([]);
    });

    it('保留收藏的順序', async () => {
      const { resolveFavorites } = await freshUseFavorites();
      const saved = [laptop('A'), laptop('B'), laptop('C')];

      const result = resolveFavorites(saved, [laptop('B')]);

      expect(result.map((r) => r.name)).toEqual(['A', 'B', 'C']);
      expect(result.map((r) => r.discontinued)).toEqual([true, false, true]);
    });
  });
});
