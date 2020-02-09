# 安裝

本節將說明如何安裝 V2Ray，內容包含服務器安裝和客戶端安裝。需要注意的是，與 Shadowsocks 不同，從軟件上 V2Ray 不區分服務器版和客戶端版，也就是說在服務器和客戶端運行的 V2Ray 是同一個軟件，區別只是配置文件的不同。因此 V2Ray 的安裝在服務器和客戶端上是一樣的，但是通常情況下 VPS 使用的是 Linux 而 PC 使用的是 Windows，因此本章默認服務器爲 Linux VPS，客戶端爲 Windows PC。如果你的 PC 使用的是 Linux 操作系統，那麼請參考本文的服務器安裝；VPS 使用的是 Windows，參考本文的客戶端安裝；如果你使用的是 MacOS ，請你自行研究怎麼安裝吧，安裝完了跳過本節繼續往下看。

本文中會有不少的命令以 sudo 開頭，代表着以管理員權限運行，如果你是用 root 賬戶執行文中的命令，就不用打 sudo。

-----

## 時間校準

對於 V2Ray，它的驗證方式包含時間，就算是配置沒有任何問題，如果時間不正確，也無法連接 V2Ray 服務器的，服務器會認爲你這是不合法的請求。所以系統時間一定要正確，只要保證時間誤差在**90秒**之內就沒問題。

對於 VPS(Linux) 可以執行命令 `date -R` 查看時間：
```
$ date -R
Sun, 22 Jan 2017 10:10:36 -0500
```
輸出結果中的 -0500 代表的是時區爲西 5 區，如果轉換成東 8 區時間則爲 `2017-01-22 23:10:36`。

如果時間不準確，可以使用 `date --set` 修改時間：

```
$ sudo date --set="2017-01-22 16:16:23"
Sun 22 Jan 16:16:23 GMT 2017
```
如果你的服務器架構是 OpenVZ，那麼使用上面的命令有可能修改不了時間，直接發工單聯繫 VPS 提供商的客服吧，就說你在 VPS 上運行的服務對時間有要求，要他們提供可行的修改系統時間的方法。

對 VPS 的時間校準之後接着是個人電腦，如何修改電腦上的時間我想不必我多說了。

無論是 VPS 還是個人電腦，時區是什麼無所謂，因爲 V2Ray 會自動轉換時區，但是時間一定要準確。

-----

## 服務器安裝

### 腳本安裝

在 Linux 操作系統， V2Ray 的安裝有腳本安裝、手動安裝、編譯安裝 3 種方式，選擇其中一種即可，本指南僅提供使用使用腳本安裝的方法，並僅推薦使用腳本安裝，該腳本由 V2Ray 官方提供。該腳本僅可以在 Debian 系列或者支持 Systemd 的 Linux 操作系統使用。

**除非你是大佬，或者能夠自行處理類似 command not found 的問題，否則請你使用 Debian 8.x 以上或者 Ubuntu 16.04 以上的 Linux 系統。**
本指南默認使用 Debian 8.7 系統作爲示範。

首先下載腳本：

```
$ wget https://install.direct/go.sh
--2018-03-17 22:49:09--  https://install.direct/go.sh
Resolving install.direct (install.direct)... 104.27.174.71, 104.27.175.71, 2400:cb00:2048:1::681b:af47, ...
Connecting to install.direct (install.direct)|104.27.174.71|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: unspecified [text/plain]
Saving to: ‘go.sh’

go.sh                             [ <=>                                                 ]  11.24K  --.-KB/s    in 0.001s  

2018-03-17 22:49:09 (17.2 MB/s) - ‘go.sh’ saved [11510]
```

然後執行腳本安裝 V2Ray:

```
$ sudo bash go.sh
Installing curl
Updating software repo
Installing curl
Selecting previously unselected package curl.
(Reading database ... 36028 files and directories currently installed.)
Preparing to unpack .../curl_7.38.0-4+deb8u5_amd64.deb ...
Unpacking curl (7.38.0-4+deb8u5) ...
Processing triggers for man-db (2.7.0.2-5) ...
Setting up curl (7.38.0-4+deb8u5) ...
Installing V2Ray v2.33 on x86_64
Donwloading V2Ray.
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   608    0   608    0     0   2403      0 --:--:-- --:--:-- --:--:--  2412
100 2583k  100 2583k    0     0  1229k      0  0:00:02  0:00:02 --:--:-- 1847k
Installing unzip
Installing unzip
Selecting previously unselected package unzip.
(Reading database ... 36035 files and directories currently installed.)
Preparing to unpack .../unzip_6.0-16+deb8u3_amd64.deb ...
Unpacking unzip (6.0-16+deb8u3) ...
Processing triggers for mime-support (3.58) ...
Processing triggers for man-db (2.7.0.2-5) ...
Setting up unzip (6.0-16+deb8u3) ...
Extracting V2Ray package to /tmp/v2ray.
Archive:  /tmp/v2ray/v2ray.zip
  inflating: /tmp/v2ray/v2ray-v2.33-linux-64/readme.md  
  inflating: /tmp/v2ray/v2ray-v2.33-linux-64/systemd/v2ray.service  
  inflating: /tmp/v2ray/v2ray-v2.33-linux-64/systemv/v2ray  
  inflating: /tmp/v2ray/v2ray-v2.33-linux-64/v2ray  
  inflating: /tmp/v2ray/v2ray-v2.33-linux-64/vpoint_socks_vmess.json  
  inflating: /tmp/v2ray/v2ray-v2.33-linux-64/vpoint_vmess_freedom.json  
PORT:40827
UUID:505f001d-4aa8-4519-9c54-6b65749ee3fb
Created symlink from /etc/systemd/system/multi-user.target.wants/v2ray.service to /lib/systemd/system/v2ray.service.
V2Ray v2.33 is installed.
```

看到類似於這樣的提示就算安裝成功了。如果安裝不成功腳本會有紅色的提示語句，這個時候你應當按照提示除錯，除錯後再重新執行一遍腳本安裝 V2Ray。對於錯誤提示如果看不懂，使用翻譯軟件翻譯一下就好。

在上面的提示中，有一行 "PORT:40827" 代表着端口號爲 40827，還有一行 "UUID:505f001d-4aa8-4519-9c54-6b65749ee3fb" 代表着 id 爲 505f001d-4aa8-4519-9c54-6b65749ee3fb。這兩個都是隨機生成的，不用擔心跟別人撞上了。

安裝完之後，使用以下命令啓動 V2Ray:

```
$ sudo systemctl start v2ray
```

在首次安裝完成之後，V2Ray 不會自動啓動，需要手動運行上述啓動命令。而在已經運行 V2Ray 的 VPS 上再次執行安裝腳本，安裝腳本會自動停止 V2Ray 進程，升級 V2Ray 程序，然後自動運行 V2Ray。在升級過程中，配置文件不會被修改。

對於安裝腳本，還有更多用法，在此不多說了，可以執行 `bash go.sh -h` 看幫助。

### 升級更新

在 VPS，重新執行一遍安裝腳本就可以更新了，在更新過程中會自動重啓 V2Ray，配置文件保持不變。

```
$ sudo bash go.sh
```

V2Ray 的更新策略是快速迭代，每週更新(無意外的情況下)。版本號的格式是 `vX.Y.Z`，如 `v2.44.0`。v是固定的字母v，version 的首字母；X、Y、Z都是數字，X是大版本號，每年更新一個大版本(現在是 v4.Y.Z，V2Ray 已經走到了第四個年頭)，Y 是小版本，每週五更新一個小版本。Z是區分正式版和測試版，Z是0代表着是正式版，不是0說明是測試版。例如，v4.7.0 是正式版，v4.7.1是測試版，建議只使用正式版，不手動指定的情況下V2Ray 的安裝腳本也只會安裝最新的正式版。

有些細心的朋友可能會注意到有時候週五 V2Ray 剛發佈了一個新版本，次日或過兩日又更新一個正式版。出現這種情況是因爲週五發佈的正式版出現了影響使用嚴重的 BUG，需要立馬發佈一個新版本。這種情況比較煩，但是爲了保證兼容性、性能優化等又需要保證版本不要太老舊。所以我比較建議在週四更新，選這麼一個日子是因爲有重大的 BUG 肯定在前面幾天就已經修復了，小問題(恐怕都不知道有)的話不會影響使用；而且版本號與最新版相比遲那麼一兩個也沒什麼關係。

## 客戶端安裝
點[這裏](https://github.com/v2ray/v2ray-core/releases)下載 V2Ray 的 Windows 壓縮包，如果是 32 位系統，下載 v2ray-windows-32.zip，如果是 64 位系統，下載 v2ray-windows-64.zip（下載速度慢或無法下載請考慮掛已有的翻牆軟件來下載）。下載並且解壓之後會有下面這些文件：
* `v2ray.exe` 運行 V2Ray 的程序文件
* `wv2ray.exe` 同 v2ray.exe，區別在於wv2ray.exe是後臺運行的，不像 v2ray.exe 會有類似於 cmd 控制檯的窗口。運行 V2Ray 時從 v2ray.exe 和 wv2ray.exe 中任選一個即可
* `config.json` V2Ray 的配置文件，後面我們對 V2Ray 進行配置其實就是修改這個文件
* `v2ctl.exe` V2Ray 的工具，有多種功能，除特殊用途外，一般由 v2ray.exe 來調用，用戶不用太關心
* `geosite.dat` 用於路由的域名文件
* `geoip.dat` 用於路由的 IP 文件
* `其它` 除上面的提到文件外，其他的不是運行 V2Ray 的必要文件。更詳細的說明可以看 doc 文件夾下的 readme.md 文件，可以通過記事本或其它的文本編輯器打開查看

實際上雙擊 v2ray.exe （或wv2ray.exe） 就可以運行 V2Ray 了，V2Ray 會讀取 config.json 中的配置與服務器連接。~~默認的配置文件包含 V2Ray 官方服務器的配置，也就是說你可以不自己搭建服務器而直接使用 V2Ray 提供的服務器科學上網。在不修改 config.json 的情況下，雙擊運行 v2ray.exe，可以直接科學上網~~（V2Ray 官方服務器已下線）。
![](../resource/images/v2rayrunnig.png)

V2Ray 將所有選擇權交給用戶，它不會自動設置系統代理，因此還需要在瀏覽器裏設置代理。以火狐（Firefox）爲例，點菜單 -> 選項 -> 高級 -> 設置 -> 手動代理設置，在 SOCKS Host 填上 127.0.0.1，後面的 Port 填 1080，再勾上使用 SOCKS v5 時代理 DNS (這個勾選項在舊的版本里叫做遠程 DNS)。

需要注意的是，有些客戶端的 SOCKS Port 並不是 1080，實際 Port 需要查看客戶端相關默認設置。

操作圖見下：

![](../resource/images/firefox_proxy_setting1.png)

![](../resource/images/firefox_proxy_setting2.png)

![](../resource/images/firefox_proxy_setting3.png)

![](../resource/images/firefox_proxy_setting4.png)

如果使用的是其它的瀏覽器，請自行在網上搜一下怎麼設置 SOCKS 代理。
