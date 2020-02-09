# 內存優化

爲了更好能夠提供更好的性能，V2Ray 有一個緩存機制，在上下游網絡速率有差異時會緩存一部分數據。舉個實際的例子，假如你在下載小姐姐，網站到你的 VPS 的速度有 500 Mbps，而 VPS 到家裏寬帶只有 50 Mbps，V2Ray 在 VPS 會以比較高的速率把小姐姐先下好再慢慢傳到電腦裏。默認情況下 V2Ray 對每個連接的緩存大小是 10 MBytes （現在默認緩存最大爲 512 KBytes），也就是說如果下載小姐姐開了 32 線程，那麼 V2Ray 最高會緩存 320 MBytes 的數據。這樣一來那些內存只有 256 MBytes 甚至是 128 MBytes 的 VPS 壓力就會比較大。所幸的是緩存的大小我們是可以修改的，減小緩存的大小可以降低對內存的佔用，會對小內存機器比較友好。

## 修改緩存

### 利用環境變量修改

(**注：經過多個版本的迭代優化，V2Ray 的內存佔用已經大幅度減少，默認的緩存大小最大也只有 512 KBytes，通過環境變量修改緩存參數已經不適用**)

VPS 中編輯 /etc/systemd/system/v2ray.service 文件，將 `ExecStart=/usr/bin/v2ray/v2ray -config /etc/v2ray/config.json` 修改成 `ExecStart=/usr/bin/env v2ray.ray.buffer.size=1 /usr/bin/v2ray/v2ray -config /etc/v2ray/config.json`，保存；然後執行下面的命令生效。
```
$ sudo systemctl daemon-reload && sudo systemctl restart v2ray.service
```
上面的 v2ray.ray.buffer.size 就是緩存的變量，設爲 1 也沒多大影響（主觀感覺，沒實際測試對比過），內存不太夠用的朋友可以試一下。

### 在配置文件中修改

在上面的通過環境變量修改緩存大小中，有一個問題是 v2ray.ray.buffer.size 的單位是 Mbytes，最小隻能改成 1 Mbytes，如果改成 0 的話就意味着緩存無限制。不過在配置文件中也可以修改緩存大小，單位是 Kbytes，在配置中設成 0 的話表示禁用緩存，需要將緩存設得更小的朋友可以參考 V2Ray 官方文檔的本地策略一節，配置比較簡單，這裏就不詳述了。

#### 更新歷史

- 2018-05-01 初版
- 2018-08-02 添加配置文件修改緩存
- 2018-11-11 v2ray.ray.buffer.size 廢棄
