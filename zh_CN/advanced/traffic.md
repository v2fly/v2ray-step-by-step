# 流量统计

v2ray 内包含了流量记录器功能，但是默认并不启用。流量统计分两类：`inbound`和`user`。

* `inbound` 即配置内各个inbound的入站的统计，需要根据`tag`来记录入站流量。
* `user` 即vmess协议用户里面的统计，用户的`email`既是统计和区分的依据。socks, shadowsocks, http等其他协议内的用户不支持被统计。

## 配置统计功能

要实现流量统计功能，配置内需要确保存在以下配置：

1. `"stats":{}`对象的存在
2. `"api"`配置对象里面有`StatsService`
3. `"policy"`中的统计开关为true，除了各个用户的统计，还有全局统计
4. clients里面要有email
5. 专用的`dokodemo-door`协议的入口，tag为api
6. routing里面有inboundTag:api -> outboundTag:api的规则

注意： 统计的`email`/`tag`是当前的v2ray进程实例的数据，比如在服务器上统计，客户端写的email对服务器没有意义；如果在客户端统计，输出的就是客户端本身的数据。

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

查看流量信息是`v2ctl`的其中一个功能。使用`v2ctl api -h`可见查询例子。 配置内设置的api dokodemo-door端口，即为`--server`参数的端口。

```bash
v2ctl api --server=127.0.0.1:10050 StatsService.QueryStats 'pattern: "" reset: false'
v2ctl api --server=127.0.0.1:10050 StatsService.GetStats 'name: "inbound>>>statin>>>traffic>>>downlink" reset: false'
```

注意如果在windows的cmd内运行，里面的引号要特别处理：

```cmd
v2ctl.exe api --server="127.0.0.1:10085" StatsService.GetStats "name: """"inbound>>>statin>>>traffic>>>downlink"""" reset: false"
```

可调用的api有两个：

* `QueryStats`用来查询匹配的记录，可以使用参数`pattern`和`reset`；pattern留空则是匹配所有记录；reset使匹配的单元数值置零。
* `GetStats`用来其中一个的记录，接受`name`和`reset`，name可参考QueryStats的输出结果构建，reset使该单元数值置零。

输出例子：

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

结果中的`name`可作为`GetStats`API查询单个计数单元的值，name的组成规律请自行概括，这里不再详谈；value的计数单位是字节。

## 流量信息的处理

上述配置是让v2ray打开一个`grpc`协议的查询接口，除了使用v2ctl，可以用各种支持grpc协议的程序查询上述数值并另外处理（如入库统计、用户计费、图表报告）。不过，本文不会深入探讨。既然有`v2ctl`现成的命令行程序，我们可以用简单的shell脚本生成足够可读的报表。

尝试把以下脚本保存到`traffic.sh`，注意使用`chmod 755 traffic.sh`授予执行权限。注意调整修改`_APISERVER`一行的连接具体的端口参数。

```bash
#!/bin/bash

_APISERVER=127.0.0.1:10085
_V2CTL=/usr/bin/v2ray/v2ctl

v2_query_all () {
    local ARGS=
    if [[ $1 == "reset" ]];  then
      ARGS="reset: true"
    fi
    local DATA=$($_V2CTL api --server=$_APISERVER StatsService.QueryStats "${ARGS}" | api2column)
    echo -e "\n------------Inbound----------"
    print_sum "$DATA" "inbound"
    echo "-----------------------------"
    echo -e "\n-------------User------------"
    print_sum "$DATA" "user"
    echo "-----------------------------"
}

api2column() {
    cat | awk '{
        if (match($1, /name:/)){ 
            f=1; gsub(/^"|"$/, "", $2); split($2, p,  ">>>");
            print p[1]":"p[2]"->"p[4];
        }
        else if (match($1, /value:/)){ f=0; print $2}
        else if (match($0, /^>$/) && f == 1) print "0"
        else {}
    }'  | sed '$!N;s/\n/ /; s/link//'
}

print_sum() {
    local DATA="$1"
    local PREFIX="$2"
    local UDATA=$(echo "$DATA" | grep "^${PREFIX}" | sort -r)
    local UPSUM=$(echo "$UDATA" | awk '/->up/{sum+=$2;}END{print sum;}')
    local DOWNSUM=$(echo "$UDATA" | awk '/->down/{sum+=$2;}END{print sum;}')
    UDATA="${UDATA}\nTOTAL->up ${UPSUM}\nTOTAL->down ${DOWNSUM}"
    echo -e "$UDATA" | numfmt --field=2 --suffix=B --to=iec | column -t
}

v2_query_all $1
```

运行效果：

```text
$ ./traffic.sh

------------Inbound----------
inbound:ws->up      2.7KB
inbound:ws->down    3.1KB
inbound:api->up     161B
inbound:api->down   724B
TOTAL->up           2.9KB
TOTAL->down         3.8KB
-----------------------------

-------------User------------
user:u3@ws->up    2.4KB
user:u3@ws->down  2.7KB
TOTAL->up         2.4KB
TOTAL->down       2.7KB
-----------------------------
```

脚本使用`reset`参数让调用的计数单元置零，配合watch命令，即可查看流经v2ray的每秒实时流量速度：
`watch ./traffic.sh reset`
