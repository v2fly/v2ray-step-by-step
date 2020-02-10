# 在部署之前

本節將說明在部署 V2Ray 的過程中需要注意的一些細節，看似無關緊要，但有些許差錯可能就會造成部署失敗。所以請大家請仔細閱讀，在部署的過程如果遇到問題了，也請檢查一下是不是哪些地方做得不到位。

## 你的閱讀方式是否高效

無論是在網絡上，還是現實生活中，不少人很喜歡跳躍式看文章／書／教程，自以為只看關鍵的東西就足夠了，似乎這樣子非常高效。實際上這樣子做，大多會花更多的時間才能達到同樣的效果。

如果你對此感到困惑，筆者在此向各位推薦一些相關資料：

* [《如何閱讀一本書》——書評及內容綱要 @ 編程隨想的博客](https://program-think.blogspot.com/2013/04/how-to-read-book.html)
* [如何【系統性學習】——從“媒介形態”聊到“DIKW 模型” @ 編程隨想的博客](https://program-think.blogspot.com/2019/10/Systematic-Learning.html)

如果你現在對此沒有什麼困惑了，並且剛接觸 V2Ray，又不太會使用，建議按照本指南的順序並看完。

## 本指南中命令組成要素指北

本指南當中，所有命令都以 `$` 或 `#` 開頭，`$` 表示非 root 用戶，`#` 表示 root 用戶，在實際輸入命令時，不需要將 `$` 或 `#` 輸進去。

## 為服務器選擇 Linux 發行版的問題

感謝 Golang 編程語言提供的特性和 V2Ray 原作者的精心設計，V2Ray 可以不依賴其它軟件（庫）而運行，並且提供了跨平臺支持（Windows，Mac OS，Linux，BSD 等）。但是，由於新手在學習使用的過程中可能會遇到各種問題，卻缺乏相應解決問題的能力，因此在 VPS 上建議使用 Debian，Ubuntu，CentOS 等 Linux 發行版，要注意的是，儘可能選擇一個較新的發佈版本。請不要盲目相信像是 Debian 7，Debian 8，Ubuntu 14.04，CentOS 5，CentOS 6 這樣過於老舊的版本。

筆者在此特別向各位推薦 Debian，並提供一些可以幫助到你的相關信息。

* Debian 參考手冊：
    * 簡體：
        * HTML：[https://www.debian.org/doc/manuals/debian-reference/index.zh-cn.html](https://www.debian.org/doc/manuals/debian-reference/index.zh-cn.html)
        * 純文字：[https://www.debian.org/doc/manuals/debian-reference/debian-reference.zh-cn.txt](https://www.debian.org/doc/manuals/debian-reference/debian-reference.zh-cn.txt)
        * PDF：[https://www.debian.org/doc/manuals/debian-reference/debian-reference.zh-cn.pdf](https://www.debian.org/doc/manuals/debian-reference/debian-reference.zh-cn.pdf)
    * 繁體：
        * HTML：[https://www.debian.org/doc/manuals/debian-reference/index.zh-tw.html](https://www.debian.org/doc/manuals/debian-reference/index.zh-tw.html)
        * 純文字：[https://www.debian.org/doc/manuals/debian-reference/debian-reference.zh-tw.txt](https://www.debian.org/doc/manuals/debian-reference/debian-reference.zh-tw.txt)
        * PDF：[https://www.debian.org/doc/manuals/debian-reference/debian-reference.zh-tw.pdf](https://www.debian.org/doc/manuals/debian-reference/debian-reference.zh-tw.pdf)
* Debian 中文社區：[https://www.debiancn.org/](https://www.debiancn.org/)
* Debian 中文論壇：[https://forums.debiancn.org/](https://forums.debiancn.org/)
* Debian Telegram 中文群組：[https://telegram.debiancn.org/](https://telegram.debiancn.org/)

## 防火牆問題

一些 Linux 發行版，VPS 商家，以及某些雲計算平臺默認提供並運行了防火牆／安全組等功能，因此正確部署了 V2Ray 之後因為錯誤的防火牆／安全組設置，會導致 V2Ray 無法連接成功。這時候你就要檢查一下是否可能是防火牆的問題。具體情況你可以發工單問客服或 Google 一下。

## V2Ray 配置文件的格式問題

因為 V2Ray 的配置文件比較長，層級也多，導致編輯時很容易出錯，也難檢查。如果使用在線的 JSON 工具（當然也有離線的），可以檢查文件格式是否正確。這種在線工具一搜一大把，就不打廣告了。

## 服務端的 V2Ray 啟用／啟動問題

使用官方腳本安裝 V2Ray 後已經啟用，但不會自動啟動，而是要自己手動啟動。另外，如果修改了配置文件，重新啟動 V2Ray 後新的配置才會生效。

## 代理設置問題

在指南中使用的 Firefox 瀏覽器，設置的是 Socks 代理。但是有的朋友喜歡用其它瀏覽器，那麼提示一下，客戶端的 inbound 可以使用 HTTP 協議，並在 IE 選項中設置代理。或者也可以使用瀏覽器插件，如 SwitchyOmega 等。

## 絕技！最終解決問題

很遺憾，我們沒有能力預測所有可能出現的問題。但是，一般來說，你遇到的所有問題都有人早就遇到了，並且還給出了相應的解決辦法（除非你是該行業的頂尖人才，遇到的是需要調用浩瀚的資源才有希望解決的問題）。

所以，如果遇到問題，可以通過搜索引擎搜索解決，到社區裡提問是迫不得已的辦法。在部署 V2Ray 的過程中，有 90% 以上的問題可以通過使用搜索引擎或查看相關文檔解決的，要社區提問才能解決的不足 5%。

如果不能自行解決問題這 90% 以上的問題，那麼只能說明，你的綜合能力還需提高（比如查閱資料的能力、閱讀理解的能力）。

當然，我們並不反對到社區提問，而是希望提問的內容能夠更有意義，誰也不願意自己就像個復讀機一樣天天回答網友們千篇一律的問題。

如果有提問的需要，強烈建議先認真學習一下：

* 提問的智慧：「[繁體](https://github.com/ryanhanwu/How-To-Ask-Questions-The-Smart-Way/blob/master/README.md)」、「[簡體](https://github.com/ryanhanwu/How-To-Ask-Questions-The-Smart-Way/blob/master/README-zh_CN.md)」。
