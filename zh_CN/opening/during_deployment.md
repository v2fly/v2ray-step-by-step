# 部署進行時

本節將說明如何部署 V2Ray，內容包含服務端和客戶端。

需要注意的是，與 Shadowsocks 不同，從軟件上 V2Ray 不區分服務器版本和客戶端版本，也就是說，在服務端和客戶端運行的 V2Ray 是同一個軟件，區別只是配置文件的不同。

因此，V2Ray 的安裝在服務端和客戶端上是一樣的，但通常情況下，VPS 使用的是 Linux，而 PC 使用的是 Windows，因此本章默認服務端系統為 Linux，客戶端系統為 Windows。

如果 PC 使用的是 Linux 發行版，最好的方法是從該發行版的軟件源安裝，如果該發行版及其社區不提供支援，那麼請參考本文的服務端安裝。

如果服務端使用的是 Windows，請參考本文的客戶端安裝。

如果 PC 使用的是 Mac OS，請先自行研究怎麼安裝吧，安裝完了繼續往下看。

## 檢查時鐘是否相對準確

很多人認為 V2Ray 對於時鐘有比較嚴格的要求，但筆者認為，僅僅是要求服務端和客戶端的時鐘差絕對值不能超過 2 分鐘，不能算是嚴格的，但最好還是要保證時鐘相對，甚至是足夠準確。

V2Ray 並不要求時區一致。比如說自個兒電腦上的時區是東 8 區，為北京時間，並假設當前時鐘為 2017-07-31 12:08:31，而 VPS 上的時區是東 9 區，為東京時間，那麼，VPS 上的時鐘應該是 2017-07-31 13:06:31 到 2017-07-31 13:10:31 之間，而這依然可以正常使用 V2Ray。當然，也可以自行改成自己想要的時區。

### 時鐘同步方案

事實上，保證時鐘準確並不困難，我們可以使用 [NTP（網絡時鐘協議）](https://zh.wikipedia.org/wiki/%E7%B6%B2%E8%B7%AF%E6%99%82%E9%96%93%E5%8D%94%E5%AE%9A)來解決這個問題。

#### systemd-timesyncd

無論是服務端還是客戶端，目前大多 Linux 發行版已經用上了 systemd，而如果沒有特殊需求的話，直接用 systemd 提供的 systemd-timesyncd，一個用於跨網絡同步系統時鐘的守護服務，就能解決哦。

##### 啟用 systemd-timesyncd 服務

只需執行一次哦，即便是重啟系統也會自動啟動了呢。

```shell
# timedatectl set-ntp true
```

##### 查看 systemd-timesyncd 服務狀態

```shell
$ timedatectl
# timedatectl timesync-status
# timedatectl show-timesync --all
```

##### 關於 systemd-timesyncd 服務的一些其它操作

如果只是想要試一試，不希望系統啟動後自動啟動該服務的話，可以僅僅是啟動 systemd-timesyncd 服務：

```shell
# timedatectl set-ntp start
```

如果只是想暫時關閉一下 systemd-timesyncd 服務（無論啟用／啟動）：

```shell
# timedatectl set-ntp stop
```

如果希望不再使用該服務的話，就可以禁用 systemd-timesyncd 服務：

```shell
# timedatectl set-ntp false
```

## 服務端安裝 V2Ray

在 Linux 發行版，V2Ray 的安裝方式有：

* 該發行版提供支援的軟件源安裝。
* 官方腳本安裝。
* 非官方腳本安裝。
* 手動安裝已編譯版本。
* 手動安裝未編譯版本。
* 部署 Docker 容器安裝。

選擇以上其中一種即可，本節提供使用官方腳本安裝的方法，該腳本可在使用 systemd 的 Debian 系列發行版，CentOS 發行版，或者其它支持 systemd 的 Linux 發行版使用。

本指南默認使用 Debian 8.7 系統作為示範。

### 官方腳本安裝

使用 cURL：

```shell
# curl -o- https://install.direct/go.sh | bash
```

使用 Wget：

```shell
# wget -qO- https://install.direct/go.sh | bash
```

如果安裝不成功，腳本會有紅色的提示語句，這個時候你應當按照提示除錯，除錯後再重新執行一遍。

對於錯誤提示，如果看不懂的話，使用 Google 翻譯一類翻譯一下就好。

安裝完 V2Ray 之後，部署就算是完成一半啦，但我們還沒有修改配置呢，具體請在閱讀完「開篇」後，繼續閱讀「基本篇」。

在使用官方腳本安裝後，V2Ray 已經啟用，但不會自動啟動，需要手動執行啟動命令：

```shell
# systemctl start v2ray.service
```

而在已經運行 V2Ray 的服務端上再次執行官方安裝腳本，會停止當前 V2Ray 進程，並升級 V2Ray 版本，然後重新啟動 V2Ray。在升級過程中，配置文件不會被修改。

### 更新策略

V2Ray 的更新策略是快速迭代，每週更新（無意外的情況下）。版本號的格式是 vX.Y.Z，如 v2.44.0。

字母 v 是固定的，是 version 的首字母。

X，Y，Z 都是數字，X 是大版本號，每年更新一個大版本（現在是 v4.Y.Z，V2Ray 已經走到了第四個年頭），Y 是小版本，每週五更新一個小版本，Z 是區分正式版和測試版，為 0 說明是正式版，不為 0 說明是測試版。例如，v4.7.0 是正式版，v4.7.1 是測試版，建議只使用正式版，不手動指定的情況下，V2Ray 的官方安裝腳本也只會安裝最新的正式版。

有些細心的朋友可能會注意到，有時候週五，V2Ray 剛發佈了一個新版本，次日或過兩日又更新一個正式版。出現這種情況是因為週五發佈的正式版出現了影響使用的嚴重 BUG，需要立即發佈一個新版本。

這種情況比較煩，但是為了保證兼容性，性能優化等，又需要保證版本不要太老舊，所以比較建議在週四更新，選這麼一個日子是因為，如果出現嚴重的 BUG，大機率在前面幾天就已經修復了，小問題（恐怕都不知道有）的話不會影響使用，而且版本號與最新版相比遲那麼一兩個也沒什麼關係。

## 客戶端安裝 V2Ray

點 [這裡](https://github.com/v2ray/v2ray-core/releases) 下載 V2Ray 的 Windows 壓縮包，如果是 32 位系統，下載 v2ray-windows-32.zip，如果是 64 位系統，下載 v2ray-windows-64.zip（下載速度慢或無法下載請考慮使用已有的翻牆軟件來下載）。下載並且解壓後會有下面這些文件：


* `v2ray.exe`：運行 V2Ray 的程序文件。
* `wv2ray.exe`：同 v2ray.exe，區別在於 wv2ray.exe 是後臺運行的，不像 v2ray.exe 會有類似於 cmd 控制檯的窗口。運行 V2Ray 時從 v2ray.exe 和 wv2ray.exe 中任選一個即可。
* `config.json`：V2Ray 的配置文件，後面我們對 V2Ray 修改配置其實就是修改這個文件。
* `v2ctl.exe`：V2Ray 的工具，有多種功能，除特殊用途外，一般由 v2ray.exe 來調用，用戶不用太關心。
* `geosite.dat`：用於路由功能的域名文件。
* `geoip.dat`：用於路由功能的 IP 文件。
* 其它：除上面提到的文件外，其它的不是運行 V2Ray 的必要文件。更詳細的說明可以看 doc 文件夾下的 README.md 文件，可以通過記事本或其它的文本編輯器打開查看。

實際上，雙擊 v2ray.exe（或wv2ray.exe）就可以運行 V2Ray 了，V2Ray 會讀取 config.json 中的配置來與服務器連接。

~~默認的配置文件包含 V2Ray 官方服務器的配置，也就是說，你可以不搭建自己的服務端而直接使用 V2Ray 官方提供的服務端來翻牆~（紀念已下線 V2Ray 官方服務器）。

![](../resource/images/v2rayrunnig.png)

V2Ray 將選擇權交給用戶，它不會自動設置系統代理，因此還需要在瀏覽器裡設置代理。以火狐（Firefox）為例，點菜單 -> 選項 -> 高級 -> 設置 -> 手動代理設置，在 SOCKS Host 填上 127.0.0.1，後面的 Port 填 1080，再勾上使用 SOCKS v5 時代理 DNS (這個勾選項在舊的版本里叫做遠程 DNS)。

需要注意的是，實際 Port 視 V2Ray 配置而定。

操作圖見下：

![](../resource/images/firefox_proxy_setting1.png)

![](../resource/images/firefox_proxy_setting2.png)

![](../resource/images/firefox_proxy_setting3.png)

![](../resource/images/firefox_proxy_setting4.png)

如果使用的是其它的瀏覽器，請自行在網上搜一下怎麼設置 Socks 代理。

## V2Ray 配置文件

V2Ray 的配置文件為 JSON 格式，Shadowsocks 的配置文件同為 JSON 格式，但 V2Ray 由於支持許多功能，不可避免的導致配置相對複雜一些，因此在實際配置前還是建議瞭解一下 [配置文件·Project V 官方網站](https://www.v2ray.com/chapter_02/)，裡面的說明簡單明瞭。
