# DNS服務

V2Ray 內置的 DNS 服務，其解析的IP往往先是用來匹配路由規則，如果配置不當，請求會在DNS請求上耗費一定時間。

路由routing的`"domainStrategy"`的幾種模式都跟DNS功能密切相關，所以在此專門說一下。

* `"AsIs"`，當終端請求一個域名時，進行路由裏面的domain進行匹配，不管是否能匹配，直接按路由規則走。
* `"IPIfNonMatch"`, 當終端請求一個域名時，進行路由裏面的domain進行匹配，若無法匹配到結果，則對這個域名進行DNS查詢，用結果的IP地址再重新進行IP路由匹配。
* `"IPOnDemand"`, 只要路由規則裏面存在IP路由匹配，所有請求的域名都先進行DNS解析，用IP地址進行IP路由匹配。

可見，`AsIs`是最快的，但是分路由的結果最不精確；而`IPOnDemand`是最精確的，但是速度是最慢的。

## DNS流程

![](../resource/images/dns_flowchart.svg)

## 基礎配置
```json
{
 "dns": {
   "servers": [
     "1.1.1.1",
     "localhost"
   ]
 }
}
```

DNS模塊的基礎使用並沒有什麼特別複雜的地方，就是指定一個或幾個DNS服務器，v2ray會依次使用（查詢失敗時候會查詢下一個）。其中"localhost"的意義是特殊的，作用是本地程序用系統的DNS去發請求，而不是V2ray直接跟DNS服務器通信，這個通信不收Routing等模塊的控制。

## 進階配置

雖然這是基本篇，但是不想在高級那邊再開一篇DNS了，就寫這。

### 客戶端分流配置

```json
{
 "dns": {
   "servers": [
     {
       "address": "119.29.29.29",
       "port": 53,
       "domains": [
         "geosite:cn"
       ],
       "expectIPs": [
         "geoip:cn"
       ]
     },
     {
       "address": "8.8.8.8",
       "port": 53,
       "domains": [
         "geosite:geolocation-!cn",
         "geosite:speedtest",
         "ext:h2y.dat:gfw"
       ]
     },
     "1.1.1.1",
     "localhost"
   ]
 }
}
```

DNS服務是可以用來分流的，大致思路是，”哪些域名要去哪個DNS服務器解析，並希望得到屬於那裏的IP地址“。
配置的規則跟路由模式中用的是相似的，詳細使用還需參考官方文檔。

上面的配置思路這裏解釋一下：國內域名匹配到domains裏面，使用119.29.29.29進行查詢，並期待得到國內的IP地址；如果得到的地址並不是國內的，則進行下一個DNS服務器進行查詢，並使用新的結果。不是國內的域名會匹配到第二個配置， 使用8.8.8.8進行查詢，這次不需要期待特別的IP了，可直接使用返回的；如果以上過程都有問題，則直接查詢1.1.1.1，再不行讓本地DNS試試吧。


### 服務器配置

```json
{
 "dns": {
   "servers": [
     "https+local://1.1.1.1/dns-query",
     "localhost"
   ]
 }
}
```

服務端的DNS一般無需複雜配置。如果配置了，應注意`freedom`的outbound應配置了`"domainStrategy"`爲`"UseIP" | "UseIPv4" | "UseIPv6"`幾種的時候纔會使用內置DNS，默認的`AsIs`是交給操作系統去解析和連接。

新版本4.22.0+後加入的DOH功能，部署在服務器端時候可以簡單使用。

## DNS over HTTPS

V2Ray 4.22.0 新加入的功能，也沒特殊配置的地方，就是上述配置裏面的DNS地址寫成DOH服務地址。一般只在服務端使用`https+local`模式，而牆內目前似乎沒有穩定的DOH提供商，只有`1.1.1.1`一家可用，而且效果並不穩定。

```json
{
 "dns": {
   "servers": [
     "https+local://1.1.1.1/dns-query",
     "localhost"
   ]
 }
}
```

DOH服務商不像傳統DNS那麼成熟，目前網上提供DOH的服務商可以參考[curl - DNS over HTTPS](https://github.com/curl/curl/wiki/DNS-over-HTTPS)

注意，多數服務商的DOH的tls證書是沒有對IP地址簽發認證的，必須寫實際的域名，cf的1.1.1.1是個特殊例外，可寫成`https://1.1.1.1/dns-query`。

DOH把DNS請求融入到常見的https流量當中，完全使用DOH可以避免出入口ISP知道你訪問的域名。
但需要注意，只有在客戶端、服務端都使用DOH協議(客戶端使用https模式，服務端使用https+local模式)時候，VPS出口上纔不會出現傳統的UDP DNS請求。

DOH的解析時間比傳統的UDP要高不少，把V2Ray的log level設置爲debug可以看到具體的域名解析耗時值。

```
2019/11/28 17:34:55 [Info] v2ray.com/core/app/dns: UDP:1.1.1.1:53 got answere: www.msn.com. TypeA -> [204.79.197.203] 8.9953ms
...
2019/11/28 17:42:50 [Info] v2ray.com/core/app/dns: DOH:1.1.1.1:443 got answere: lp-push-server-849.lastpass.com. TypeA -> [192.241.186.205] 182.1171ms
```

以下列出解析耗時參考值：

* 美國VPS UDP 1.1.1.1：1ms~5ms
* 美國VPS DOHL 1.1.1.1：10ms~100ms
* V2Ray客戶端 國內UDP 1.1.1.1：200ms~1s
* V2Ray客戶端 國內DOH 1.1.1.1：200ms~3s

但是實際中因爲網絡原因之類問題，也可能出現DOH耗時比UDP還小的。個人感覺這個耗時雖然有區別，但都是較小的間隙，實際使用很少有察覺。

大家按需選擇使用即可。

## 參考閱讀

詳見[《漫談各種黑科技式 DNS 技術在代理環境中的應用》](https://medium.com/@TachyonDevel/%E6%BC%AB%E8%B0%88%E5%90%84%E7%A7%8D%E9%BB%91%E7%A7%91%E6%8A%80%E5%BC%8F-dns-%E6%8A%80%E6%9C%AF%E5%9C%A8%E4%BB%A3%E7%90%86%E7%8E%AF%E5%A2%83%E4%B8%AD%E7%9A%84%E5%BA%94%E7%94%A8-62c50e58cbd0)，這篇文章爲 Kitsunebi 的作者所寫，很詳細地分析了 V2Ray 關於 DNS 的機制及一些獨有的騷操作，如果你有關於透明代理的需求，我認爲很值得一看。如果沒有那就隨意吧。


## DNS答疑

### 問：DOH是什麼？

答：DOH是DNS Over HTTPS的簡稱，作用是用https請求來完成DNS請求。V2ray-core 4.22.0後加入的功能。DOH在歷史上經歷過多個草案版本，V2ray支持的是RFC8484。


### 問：DOHL又是什麼？

答：DOHL不是個標準名稱，只是V2ray內的一個稱呼。V2ray有兩種DOH工作模式，DOHL是指配置中寫`https+local://1.1.1.1/dns-query`，程序直接發出而不經過routing規則；而寫成`https://1.1.1.1/dns-query`則會根據路由規則走。


### 問：DNS都要走HTTPS，那不是很慢？

答：對。傳統的UDP基本會在10ms級別響應，而DOH的響應時間一般都在100ms+。在DOHL模式下受益於http2的長鏈接，也能有數十ms的響應。不過個人來說，這些ms級別的延時是沒什麼感覺。


### 問：DOH走HTTPS可以防污染，傳統DNS走代理也不受污染，兩者有區別嗎？

答：效果沒區別。一定要說區別就是：DOH後出口ISP也不知道DNS查詢的內容了。DOH設計的主要目的是解決私隱問題，並不是什麼厲害的黑科技。


### 問：V2ray的DNS配置好像很複雜？

答：V2ray的DNS主要是兩個作用，用戶比較容易混淆：


* 一是在出口freedom協議的outbound處，就跟普通代理服務器一樣，代理的請求在此處終結，可稱爲“終結DNS”；
* 二是在匹配routing規則前需要對終端請求的域名進行解析成IP，再根據IP做routing規則匹配，可稱爲“匹配DNS”。


其中“終結DNS”可交給操作系統處理（freedom的`domainStrategy`:`AsIs`），也可使用內置DNS的結果。

而“匹配DNS”都由內置DNS處理。“匹配DNS”在整個代理過程中並不是必不可少的，當使用routing的"domainStrategy":AsIs時，甚至不會使用“匹配DNS”功能；即使是其他模式，也隻影響效率：如果內置DNS配置不正確，每個請求都會詢問一次錯誤的“匹配DNS”，直至超時後才轉發，但整個轉發過程數據是正常的。



### 問：DNS裏面還有"domians"..."expectIPs"...

答：理解“終結DNS”和“匹配DNS”兩大作用後，根據需要，按照文檔選用這些參數即可。



### 問：壓根沒寫DNS配置，好像也是正常的？

答：不寫dns配置，會默認一個`"localhost"`配置，作爲內置代理。在客戶端側，內置DNS的作用只有“匹配DNS”，即使本地DNS返回了個污染的結果，往往也不影響v2ray走代理的流程，所以“也正常”。



### 問：文檔推薦在服務器側使用DOHL，在牆內客戶端側使用DOHL模式可以嗎？

答：可以使用一些還未被牆或未乾擾的服務商，比如`https+local://1.1.1.1/dns-query`，`https+local://rubyfish.cn/dns-query`。但是如果這些服務被牆被禁，就只能走DOH模式，或者自建DOH服務。

自建DOH也不算複雜，V2ray也能使用非標準端口和自定義的路徑，甚至“隱藏”在一個個人網站後（類似tls+ws+web）模式。這些玩法有待大家去挖掘。


### 問：V2ray作爲DNS服務端時候算什麼模式？

答：V2ray可以通過dokodemo的inbound提供DNS服務迴應，使用內置DNS服務的配置。這個過程最終是以UDP形式發到出口的外部DNS請求的，不屬於上述的“終結DNS”和“匹配DNS”的過程。


### 問：在透明代理的作用中，DNS是怎樣工作的。

答：取決於透明代理的形式。有些是把DNS作爲普通流量直接轉發到代理，這不受V2ray的DNS機制影響；有些通過中間組件如redsocks，把子網內的DNS請求轉換成socks5請求，這也類似流量直走，不受V2ray的DNS機制影響；有些是使用V2ray作爲DNS服務端，受內置服務器的緩存和匹配影響。


------
#### 更新歷史

- 2019-12-30 QA。

- 2019-11-28 初版。

- 2019-11-29 增加描述。

- 2017-12-05 與 ToutyRater 原內容合併
