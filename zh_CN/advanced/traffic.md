# 流量统计

V2Ray 内包含了流量记录器功能，但是默认并不启用。流量统计分三类：`inbound`，`user`和`outbound`（4.26.0+）。

* `inbound` 即配置内各个 inbound 的入站的统计，需要根据 `tag` 来记录入站流量。
* `user` 即 vmess 协议用户里面的统计，用户的 `email` 既是统计和区分的依据。socks, shadowsocks, http 等其他协议内的用户不支持被统计。
* `outbound` 即配置内各个 outbound 的出站的统计，4.26.0 起新增，需要根据 `tag` 来记录出站流量。

## 配置统计功能

要实现流量统计功能，配置内需要确保存在以下配置：

1. `"stats", "api", "policy", "routing"` 对象的存在；
2. `"policy"` 中的统计开关为 true。全局统计的开关在 `"system"` 下，用户统计的开关在 `"levels"` 下；
3. 全局统计在相应的入站出站要有 tag；
4. 用户统计在 `"clients"` 里面要有 email；

要使用 api 查询流量，配置内需要确保存在以下配置：

1. `"api"` 配置对象里面有 `StatsService`；
2. 专用的 `dokodemo-door` 协议的入口，tag 为 api；
3. routing 里面有 inboundTag:api -> outboundTag:api 的规则；

注意： 统计的 `email` / `tag` 是当前的 V2Ray 进程实例的数据，比如在服务器上统计，客户端写的 email 对服务器没有意义；如果在客户端统计，输出的就是客户端本身的数据。

## 配置实例

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
      "statsInboundDownlink": true,
      "statsOutboundUplink": true,
      "statsOutboundDownlink": true
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
            "email": "userA",
            "id": "e731f153-4f31-49d3-9e8f-ff8f396135ef",
            "level": 0,
            "alterId": 0
          },
          {
            "email": "userB",
            "id": "e731f153-4f31-49d3-9e8f-ff8f396135ee",
            "level": 0,
            "alterId": 0
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
      "tag": "direct",
      "protocol": "freedom",
      "settings": {}
    }
  ],
  "routing": {
    "rules": [
      {
        "inboundTag": [
          "api"
        ],
        "outboundTag": "api",
        "type": "field"
      }
    ],
    "domainStrategy": "AsIs"
  }
}
```

## 查看流量信息

查看流量信息是 `v2ctl` 的其中一个功能。使用 `v2ctl api -h` 可见查询例子。 配置内设置的 api dokodemo-door 端口，即为 `--server` 参数的端口。

可调用的 api 有两个：

* `QueryStats` 用来查询匹配的记录，可以使用参数 `pattern` 和 `reset`；pattern 留空则是匹配所有记录；reset 使匹配的单元数值置零。
* `GetStats` 用来其中一个的记录，接受 `name` 和 `reset`，name 可参考 QueryStats 的输出结果构建，reset 使该单元数值置零。

```bash
v2ctl api --server=127.0.0.1:10085 StatsService.QueryStats 'pattern: "" reset: false'
```

```bash
v2ctl api --server=127.0.0.1:10085 StatsService.GetStats 'name: "inbound>>>api>>>traffic>>>downlink" reset: false'
```

*注：GetStats 参数 name 需做修改，可选值为 QueryStats 的结果。*

注意如果在 Windows 的 CMD 内运行，里面的引号要特别处理：

```cmd
v2ctl.exe api --server="127.0.0.1:10085" StatsService.GetStats "name: """"inbound>>>statin>>>traffic>>>downlink"""" reset: false"
```

输出例子：

```text
$ /usr/local/bin/v2ctl api --server=127.0.0.1:10085 StatsService.QueryStats ''
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
...
$
$ /usr/local/bin/v2ctl api --server=127.0.0.1:10085 StatsService.GetStats 'name:"inbound>>>ws>>>traffic>>>uplink"'
stat: <
  name: "inbound>>>ws>>>traffic>>>uplink"
  value: 3350713
>
```

结果中的 `name` 可作为 `GetStats` API 查询单个计数单元的值，name 的组成规律请自行概括，这里不再详谈；value 的计数单位是字节。

## 流量信息的处理

上述配置是让 v2ray 打开一个 `grpc` 协议的查询接口，除了使用 v2ctl ，可以用各种支持 grpc 协议的程序查询上述数值并另外处理（如入库统计、用户计费、图表报告）。不过，本文不会深入探讨。既然有 `v2ctl` 现成的命令行程序，我们可以用简单的 shell 脚本 awk 工具来处理，生成足够可读的报表。

尝试把以下脚本保存到 `traffic.sh`，注意使用 `chmod 755 traffic.sh` 授予执行权限。注意调整修改 `_APISERVER` 一行的连接具体的端口参数。

```bash
#!/bin/bash

_APISERVER=127.0.0.1:10085
_V2CTL=/usr/local/bin/v2ctl

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
echo "------------Outbound----------"
print_sum "$DATA" "outbound"
echo "-----------------------------"
echo
echo "-------------User------------"
print_sum "$DATA" "user"
echo "-----------------------------"
```

运行效果：

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

脚本使用 `reset` 参数让调用的计数单元置零，配合 watch 命令，即可查看流经 v2ray 的每秒实时流量速度：
`watch ./traffic.sh reset`
