// POST /api/claim  { email, consent, result, src, website }
// 存 email 到 D1，回傳優惠碼。優惠碼放在環境變數 COUPON_CODE，不寫在網頁原始碼裡。
// 名單表 game_leads 和其他小遊戲共用（同一個 email 一筆）；遊玩紀錄 game_plays 每款遊戲各一筆。
// 測驗沒有分數，score 存測出來的顏色編號（1 招財黃、2 戀愛粉、3 健康綠、4 炭錢黑、5 純淨白、6 清水灰）。

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: '資料格式錯誤，請重新整理再試一次' }, 400);
  }

  // 隱藏欄位有填 = 機器人
  if (body.website) return json({ ok: false, error: '送出失敗，請再試一次' }, 400);

  const email = String(body.email || '').trim().toLowerCase();
  if (email.length > 254 || !EMAIL_RE.test(email)) return json({ ok: false, error: '請輸入正確的 Email' }, 400);
  if (body.consent !== true) return json({ ok: false, error: '請勾選同意，才能寄送優惠給你' }, 400);

  const result = Math.max(0, Math.min(6, Math.floor(Number(body.result) || 0)));
  const src = String(body.src || '').slice(0, 60);
  const now = Date.now();

  const row = await env.DB.prepare(
    `INSERT INTO game_leads (email, game, score, src, consent, created_at, updated_at)
     VALUES (?1, 'color', ?2, ?3, 1, ?4, ?4)
     ON CONFLICT(email) DO UPDATE SET updated_at = excluded.updated_at
     RETURNING created_at`
  )
    .bind(email, result, src, now)
    .first();

  // 遊玩紀錄：「已經領過」只看這款遊戲；表還沒建也不擋領券
  let isNew = row.created_at === now;
  try {
    const play = await env.DB.prepare(
      `INSERT INTO game_plays (email, game, score, created_at, updated_at) VALUES (?1, 'color', ?2, ?3, ?3)
       ON CONFLICT(email, game) DO UPDATE SET score = excluded.score, updated_at = excluded.updated_at
       RETURNING created_at`
    )
      .bind(email, result, now)
      .first();
    isNew = play.created_at === now;
  } catch (e) {
    console.error('game_plays failed', e);
  }

  return json({ ok: true, code: env.COUPON_CODE || 'NIYAN95', isNew });
}
