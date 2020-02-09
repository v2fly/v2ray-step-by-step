# 流量統計

V2Ray 內包含了流量記錄器功能，但是默認並不啓用。流量統計分兩類：`inbound`和`user`。

* `inbound` 即配置內各個 inbound 的入站的統計，需要根據 `tag` 來記錄入站流量。
* `user` 即 vmess 協議用戶裏面的統計，用戶的 `email` 既是統計和區分的依據。socks, shadowsocks, http 等其他協議內的用戶不支持被統計。

## 配置統計功能

要實現流量統計功能，配置內需要確保存在以下配置：

1. `"stats":{}` 對象的存在
2. `"api"` 配置對象裏面有 `StatsService`
3. `"policy"` 中的統計開關爲 true，除了各個用戶的統計，還有全局統計
4. clients 裏面要有 email
5. 專用的 `dokodemo-door` 協議的入口，tag 爲 api
6. routing 裏面有 inboundTag:api -> outboundTag:api 的規則

注意： 統計的 `email`/`tag` 是當前的 V2Ray 進程實例的數據，比如在服務器上統計，客戶端寫的 email 對服務器沒有意義；如果在客戶端統計，輸出的就是客戶端本身的數據。

## 配置實例

```json
{
    "stats": {},
    "api": {
        "tag": "api",
        "services": [
            "StatsService"
        ]
    },
    "policy": {
        "levels": {
            "0": {
                "statsUserUplink": true,
                "statsUserDownlink": true
            }
        },
        "system": {
            "statsInboundUplink": true,
            "statsInboundDownlink": true
        }
    },
    "inbounds": [
        {
            "tag": "tcp",
            "port": 3307,
            "protocol": "vmess",
            "settings": {
                "clients": [
                    {
                        "email": "auser",
                        "id": "e731f153-4f31-49d3-9e8f-ff8f396135ef",
                        "level": 0,
                        "alterId": 64
                    },
                    {
                        "email": "buser",
                        "id": "e731f153-4f31-49d3-9e8f-ff8f396135ee",
                        "level": 0,
                        "alterId": 64
                    }
                ]
            }
        },
        {
            "listen": "127.0.0.1",
            "port": 10085,
            "protocol": "dokodemo-door",
            "settings": {
                "address": "127.0.0.1"
            },
            "tag": "api"
        }
    ],
    "outbounds": [
        {
            "protocol": "freedom",
            "settings": {}
        }
    ],
    "routing": {
        "settings": {
            "rules": [
                {
                    "inboundTag": [
                        "api"
                    ],
                    "outboundTag": "api",
                    "type": "field"
                }
            ]
        },
        "strategy": "rules"
    }
}
```

## 查看流量信息

查看流量信息是 `v2ctl` 的其中一個功能。使用 `v2ctl api -h` 可見查詢例子。 配置內設置的 api dokodemo-door 端口，即爲 `--server` 參數的端口。

```bash
v2ctl api --server=127.0.0.1:10050 StatsService.QueryStats 'pattern: "" reset: false'
v2ctl api --server=127.0.0.1:10050 StatsService.GetStats 'name: "inbound>>>statin>>>traffic>>>downlink" reset: false'
```

注意如果在 Windows 的 CMD 內運行，裏面的引號要特別處理：

```cmd
v2ctl.exe api --server="127.0.0.1:10085" StatsService.GetStats "name: """"inbound>>>statin>>>traffic>>>downlink"""" reset: false"
```

可調用的 api 有兩個：

* `QueryStats`用來查詢匹配的記錄，可以使用參數`pattern`和`reset`；pattern留空則是匹配所有記錄；reset使匹配的單元數值置零。
* `GetStats`用來其中一個的記錄，接受`name`和`reset`，name可參考QueryStats的輸出結果構建，reset使該單元數值置零。

輸出例子：

```text
$ /usr/bin/v2ray/v2ctl api --server=127.0.0.1:10085 StatsService.GetStats 'name:"inbound>>>ws>>>traffic>>>uplink"'
stat: <
  name: "inbound>>>ws>>>traffic>>>uplink"
  value: 3350713
>
$
$
$ /usr/bin/v2ray/v2ctl api --server=127.0.0.1:10085 StatsService.QueryStats ''
stat: <
  name: "inbound>>>ws>>>traffic>>>uplink"
  value: 3350713
>
stat: <
  name: "inbound>>>ss>>>traffic>>>downlink"
  value: 1704
>
stat: <
  name: "user>>>u3@ws>>>traffic>>>uplink"
  value: 2810759
>
stat: <
  name: "user>>>u9@ss>>>traffic>>>uplink"
  value: 1776
>
stat: <
  name: "inbound>>>ss>>>traffic>>>uplink"
  value: 2276
>
stat: <
  name: "inbound>>>api>>>traffic>>>uplink"
  value: 318
>
stat: <
  name: "user>>>u9@ss>>>traffic>>>downlink"
  value: 1368
>
stat: <
  name: "inbound>>>tcp>>>traffic>>>uplink"
>
stat: <
  name: "inbound>>>tcp>>>traffic>>>downlink"
>
stat: <
  name: "inbound>>>ws>>>traffic>>>downlink"
  value: 130637140
>
stat: <
  name: "inbound>>>api>>>traffic>>>downlink"
  value: 759
>
stat: <
  name: "user>>>u3@ws>>>traffic>>>downlink"
  value: 126944108
>
```

結果中的 `name` 可作爲 `GetStats` API 查詢單個計數單元的值，name 的組成規律請自行概括，這裏不再詳談；value 的計數單位是字節。

## 流量信息的處理

上述配置是讓 v2ray 打開一個 `grpc` 協議的查詢接口，除了使用 v2ctl ，可以用各種支持 grpc 協議的程序查詢上述數值並另外處理（如入庫統計、用戶計費、圖表報告）。不過，本文不會深入探討。既然有 `v2ctl` 現成的命令行程序，我們可以用簡單的 shell 腳本 awk 工具來處理，生成足夠可讀的報表。

嘗試把以下腳本保存到 `traffic.sh`，注意使用 `chmod 755 traffic.sh` 授予執行權限。注意調整修改 `_APISERVER` 一行的連接具體的端口參數。

```bash
#!/bin/bash

_APISERVER=127.0.0.1:10085
_V2CTL=/usr/bin/v2ray/v2ctl

apidata () {
    local ARGS=
    if [[ $1 == "reset" ]]; then
      ARGS="reset: true"
    fi
    $_V2CTL api --server=$_APISERVER StatsService.QueryStats "${ARGS}" \
    | awk '{
        if (match($1, /name:/)) {
            f=1; gsub(/^"|link"$/, "", $2);
            split($2, p,  ">>>");
            printf "%s:%s->%s\t", p[1],p[2],p[4];
        }
        else if (match($1, /value:/) && f){ f = 0; printf "%.0f\n", $2; }
        else if (match($0, /^>$/) && f) { f = 0; print 0; }
    }'
}

print_sum() {
    local DATA="$1"
    local PREFIX="$2"
    local SORTED=$(echo "$DATA" | grep "^${PREFIX}" | sort -r)
    local SUM=$(echo "$SORTED" | awk '
        /->up/{us+=$2}
        /->down/{ds+=$2}
        END{
            printf "SUM->up:\t%.0f\nSUM->down:\t%.0f\nSUM->TOTAL:\t%.0f\n", us, ds, us+ds;
        }')
    echo -e "${SORTED}\n${SUM}" \
    | numfmt --field=2 --suffix=B --to=iec \
    | column -t
}

DATA=$(apidata $1)
echo "------------Inbound----------"
print_sum "$DATA" "inbound"
echo "-----------------------------"
echo
echo "-------------User------------"
print_sum "$DATA" "user"
echo "-----------------------------"
```

運行效果：

```text
$ ./traffic.sh
------------Inbound----------
inbound:ws->up      0B
inbound:ws->down    0B
inbound:tcp->up     47B
inbound:tcp->down   0B
inbound:kcp->up     259MB
inbound:kcp->down   2.4GB
inbound:api->up     2.0KB
inbound:api->down   6.6KB
SUM->up:            259MB
SUM->down:          2.4GB
SUM->TOTAL:         2.6GB
-----------------------------

-------------User------------
user:me@kcp->up    240MB
user:me@kcp->down  2.3GB
SUM->up:           240MB
SUM->down:         2.3GB
SUM->TOTAL:        2.5GB
-----------------------------
```

腳本使用 `reset` 參數讓調用的計數單元置零，配合 watch 命令，即可查看流經 v2ray 的每秒實時流量速度：
`watch ./traffic.sh reset`

#### 更新歷史

- 2019-08-07 統計腳本識別科學計數法的輸出情況
- 2019-08-09 優化流量腳本，增加了 SUM->TOTAL 的累加項
