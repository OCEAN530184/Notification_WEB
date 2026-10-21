// slots/N/sw.js 가 불러오는 공용 로직. 슬롯 번호 N = 등록된 사이트 하나(= VAPID 키 하나)
importScripts('../../db.js');
const slot = +new URL(registration.scope).pathname.split('/').filter(Boolean).pop();
const base = new URL('../../', registration.scope).href;
const bc = new BroadcastChannel('inbox');
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = { body: e.data ? e.data.text() : '' }; }
  const msg = { slot, title: d.title || '새 알림', body: d.body || '', url: d.url || '', time: Date.now(), read: false };
  e.waitUntil((async () => {
    const site = await DB.site(slot);
    await DB.add(msg); bc.postMessage('refresh');
    await self.registration.showNotification(site ? `[${site.name}] ${msg.title}` : msg.title,
      { body: msg.body, tag: d.tag, icon: base + 'icon-192.png' });
  })());
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil((async () => {
    const list = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    const mine = list.find(c => c.url.startsWith(base));
    if (mine) { bc.postMessage('open:' + slot); return mine.focus(); }
    return clients.openWindow(base + '#' + slot);
  })());
});
