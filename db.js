// 페이지와 서비스 워커가 공유하는 IndexedDB (msgs: 받은 알림, sites: 등록한 사이트)
const DB = (() => {
  const open = () => new Promise((res, rej) => {
    const r = indexedDB.open('push-inbox', 2);
    r.onupgradeneeded = () => {
      if (!r.result.objectStoreNames.contains('msgs')) r.result.createObjectStore('msgs', { keyPath: 'id', autoIncrement: true });
      if (!r.result.objectStoreNames.contains('sites')) r.result.createObjectStore('sites', { keyPath: 'slot' });
    };
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
  const tx = async (store, mode, fn) => {
    const db = await open();
    return new Promise((res, rej) => {
      const t = db.transaction(store, mode), out = fn(t.objectStore(store));
      t.oncomplete = () => res(out && out.result); t.onerror = () => rej(t.error);
    });
  };
  return {
    add: m => tx('msgs', 'readwrite', s => s.add(m)), all: () => tx('msgs', 'readonly', s => s.getAll()),
    put: m => tx('msgs', 'readwrite', s => s.put(m)), del: id => tx('msgs', 'readwrite', s => s.delete(id)),
    clear: () => tx('msgs', 'readwrite', s => s.clear()),
    async delBySlot(slot) { for (const m of await this.all()) if (m.slot === slot) await this.del(m.id); },
    sites: () => tx('sites', 'readonly', s => s.getAll()), site: slot => tx('sites', 'readonly', s => s.get(slot)),
    putSite: s => tx('sites', 'readwrite', x => x.put(s)), delSite: slot => tx('sites', 'readwrite', s => s.delete(slot)),
  };
})();
