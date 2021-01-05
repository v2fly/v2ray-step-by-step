# Android 免 Root 运行 core

安卓无 Root 权限运行 V2Ray-core 并配置全局代理

此方法适用于不经常更改配置且设备无 Root 权限的用户
___

准备工具：

* 电脑
* adb 环境
* 数据线(用于设备与电脑连接)

必备技能：

* 了解 APN 设置
* 一些 Linux 实践经验
* 会[编译 V2Ray-core](https://www.v2fly.org/developer/intro/compile.html#%E5%A4%9A%E7%A7%8D%E6%9E%84%E5%BB%BA%E6%96%B9%E5%BC%8F)
* 会设置你所用的操作系统的环境变量

测试终端环境：

* Android 10
* ARM V8

::: warning 注意
由于 Golang 仅支持 Android 10+ 低版本 Android 可能无法通过此方法运行
:::

缺点：

* 设备重启后需要手动启动程序
* USB 使用 `文件传输` 模式时会自动结束所有通过此方法启动的进程

## 准备

::: tip 提示

此现象在 v4.34+ 版本已经处理，可以直接进行[编译](#编译)步骤

详情见[#572](https://github.com/v2fly/v2ray-core/pull/572)

若想自定义默认 DNS 仍然可以使用[解决方法](#解决方法)中修改源码的方案

:::

由于 Android 系统中没有 `/etc/resolv.conf` 加上没有 Root 权限也就无法创建，所以 Go 语言读取不到该文件就使用了默认设定的地址 `127.0.0.1:53` (但 Android 并不存在 53 的本地 DNS)，又因为系统限制不能监听低位端口号也就无法使用
V2Ray 来处理这个问题；因此直接运行 `core` 会由于 Go 语言(Android)的影响导致 DNS 解析出现问题

### 解决方法

克隆代码后，[修改这里](https://github.com/v2fly/v2ray-core/blob/master/infra/conf/dns_bootstrap_android.go#L10)即可；例如修改为 `1.1.1.1` DNS 则

```go
const bootstrapDNS = "1.1.1.1:53"
```
仅支持传统 UDP DNS

## 编译

Go 语言主要通过 `GOOS` 和 `GOARCH` 来控制编译环境

### 环境变量

使用 `arm64` 即为 ARM V8

```bash
SET GOOS=android
SET GOARCH=arm64
```

其他 ARM 架构，列如 V7

```bash
SET GOOS=android
SET GOARCH=arm
SET GOARM=7
```

进入 `v2ray-core` 目录，完整的命令如下(Windows)

```bash
SET CGO_ENABLED=0
SET GOOS=android
SET GOARCH=arm64
go build -o D:/v2ray -trimpath -ldflags "-s -w -buildid=" ./main
go build -o D:/v2ctl -trimpath -ldflags "-s -w -buildid=" -tags confonly ./infra/control/main
```

编译的程序放在 `D:/`

## 资源存放

将 `v2ray` 和 `v2ctl` 以及配置文件等资源放入你设备的内部存储中

例如 "手机内部存储/V2Ray" 文件夹

## 运行 V2Ray

### 连接 ADB

1. 使用数据线连接电脑
2. 打开设备的 USB 调试
3. 开启 "仅充电" 模式下允许 ADB 调试
4. 将 USB 连接模式改为 "文件传输"

### 检测设备

打开终端输入并以下命令

```bash
adb devices
```

若设备提示 "是否允许 USB 调试"，勾选 "始终允许..." 后确认

终端显示如下则表示为连接成功

```
List of devices attached
1234567C06011253        device
```

### 传输文件

继续输入以下命令，此时终端会变为手机的标识符

```bash
adb shell
```

将设备内部存储中的 V2Ray 程序复制到设备临时目录中并给予权限

```
cp /sdcard/V2Ray/* /data/local/tmp/
cd /data/local/tmp/
chmod 777 v2*
```

尝试运行一下；由于系统限制建议 Inbound 内的入站使用 `1024` 以上的端口号

```
./v2ray
```

测试无问题后按下 `Ctrl+C` 结束进程，然后把 USB 传输模式改为 "仅充电"

::: warning 注意
由于 Android 系统限制，"传输文件" 模式下无论怎样只要断开连接就会结束所有通过此方法运行的程序
:::

再次连接进入到 `/data/local/tmp` 目录

后台运行 V2Ray

```bash
nohup ./v2ray &
```

此时，打开任务管理器，找到名为 `adb` 的进程然后结束它；Windows 如果有两个进程则结束第二个

这样就能解决 adb 断开连接后进程被结束的问题

## 全局代理

此处使用系统 APN 来完成，Inbound 需要一个 HTTP 入站代理

由于默认的 APN 不允许更改，所以需要新建一个 APN；内容复制默认的就可以

设置中 "代理" 一栏中填入 `127.0.0.1`，端口号为你 HTTP 入站的端口号，保存即可

返回上层设置，选择这个 APN 即可

### 细节

HTTP 代理只在 HTTP 场景下才会使用，理论上来讲并不会影响游戏对局，但这里并没有实验

使用 APN 的代理方式大多数的应用程序都会有效，但如 Telegram 这类特殊的应用程序无效

::: tip 提示
此类程序应用内设置中通常都会提供设置代理的选项，手动设置一下即可
:::

由于此方法更新资源不方便，建议选择可靠的 DNS 路由使用 `IPOnDemand` 模式

## 其他

相比套壳 App，使用此方式启动的 `core` 长时间运行并不会导致设备发热和明显的电量消耗
