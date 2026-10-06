# 文憑試加油小頁面

呢個係一個俾屋企人用嘅小網頁。入面有 2027 年文憑試筆試倒數、每日一句鼓勵、大學聯招重要日子、2026 年大學資訊日，同埋溫書小貼士。

網頁有密碼。冇密碼就只會見到一個輸入密碼嘅畫面，入面嘅內容係加密咗，唔會直接顯示。

網址：<https://lp21kin.github.io/jasmine-dse/>

密碼**唔會**寫喺呢個 repo。佢放喺 GitHub 嘅 secret，名為 `SITE_PASSWORD`。

## 第一次設定

1. 打開呢個 repo，撳上面 **Settings**。
2. 左邊撳 **Pages**。Build and deployment 嘅 Source 揀 **GitHub Actions**。
3. 左邊撳 **Secrets and variables**，再撳 **Actions**。
4. 撳 **New repository secret**。
   - Name 填：`SITE_PASSWORD`
   - Secret 填：你想用嘅密碼（建議至少 14 個字元）
5. 撳上面 **Actions**，左邊揀 **部署網頁**，右邊撳 **Run workflow**，再撳綠色個粒。
6. 等佢變成綠色剔。之後用手機打開上面個網址，輸入密碼。
7. 喺自己部手機，可以剔 **喺呢部手機記住密碼**，下次就唔使再打。

如果未設定 `SITE_PASSWORD`，部署會失敗，唔會放出冇密碼嘅網頁。

## 點樣改密碼

1. **Settings** → **Secrets and variables** → **Actions**。
2. 搵 `SITE_PASSWORD`，撳更新，輸入新密碼，儲存。
3. 改 secret **唔會**自動更新網頁。要再去 **Actions** → **部署網頁** → **Run workflow**。
4. 等綠色剔出現，就可以用新密碼。舊密碼會失效。如果部手機記住咗舊密碼，打唔入，可以喺網址最後加上 `#staticrypt_logout` 再打開一次，就會清除記住嘅密碼。

## 點樣改重要日子

所有日子都喺 [`data/events.json`](data/events.json)。

1. 喺 github.com 打開 `data/events.json`。
2. 撳右上角枝筆圖示（Edit this file）。
3. 改日期，或者照住前後嘅樣式加一項。
4. 拉到最底，撳 **Commit changes**。可以直接 commit 去 `main`。
5. 網頁會自己重新部署，等幾分鐘。

日期格式係 `2026-10-03`。時間格式係 `09:00`（24 小時制）。未公布嘅日子唔好自己估，留 `"start": null`，再加 `"unannounced": true`，網頁會顯示「未公布」。

加新項目時，上一項最後要有一個逗號 `,`。最後一項後面唔好加逗號。

## 點樣改溫書貼士同每日一句

- 貼士：[`data/tips.json`](data/tips.json)
- 每日一句：[`data/messages.json`](data/messages.json)

改法同上面一樣：打開檔案、撳枝筆、改完 commit。每日一句同今日小貼士會按**香港日期**輪流顯示，同一日永遠係同一句。

## 點樣改筆試首日

打開 [`data/config.json`](data/config.json)，只改 `examDate`，例如 `2027-04-06`。

而家考評局仍然將筆試期標明暫定，所以 `examDateTentative` 係 `true`。如果之後落實咗，把佢改做 `false`，網頁就唔會再顯示「暫定」。

## 網頁幾時會自己更新

- 有人 push 去 `main`（包括你喺網頁直接 commit）會更新。
- 每日香港時間凌晨 00:05 左右會再部署一次。
- 你亦可以喺 Actions 手動 Run workflow。

就算當日嘅自動部署遲咗，倒數、每日一句同「下一個日子」都會喺手機上按香港時間即時計算。

## 唔好改嘅檔案

`.staticrypt.json` 唔係密碼。佢令「記住密碼」喺每次更新網頁之後仍然有效。唔好當密碼改，亦唔好刪除。
