// 테스트 발송: npm i web-push 후
// VAPID_PUBLIC_KEY=... VAPID_PRIVATE_KEY=... node tools/send.js '<구독 JSON>' '제목' '내용' ['https://링크']
const webpush = require('web-push');
const [sub, title = '테스트', body = '', url = ''] = process.argv.slice(2);
const { VAPID_PUBLIC_KEY: pub, VAPID_PRIVATE_KEY: priv, VAPID_SUBJECT: subj = 'mailto:you@example.com' } = process.env;
if (!sub || !pub || !priv) { console.error('구독 JSON 인자와 VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY 환경변수가 필요합니다.'); process.exit(1); }
webpush.setVapidDetails(subj, pub, priv);
webpush.sendNotification(JSON.parse(sub), JSON.stringify({ title, body, url }))
  .then(r => console.log('전송됨', r.statusCode)).catch(e => console.error('실패', e.statusCode, e.body));
