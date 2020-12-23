# Android 免 Root 运行 core

安卓无 Root 权限运行 V2Ray-core 并配置全局代理

此方法适用于不经常更改配置且设备无 Root 权限的用户
___

[[toc]]
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

缺点：

由于文件存放在临时目录中，设备重启后文件会被删除，因此重启后需要重新设置

> 话说都 2020 年了不会还有人时常重启手机吧

## 编译

不可以使用[预编译](https://github.com/v2fly/v2ray-core/releases)中的 `linux-armXXX`，不然运行时会出现[这个问题](https://github.com/v2ray/discussion/issues/555)

Go 语言主要通过 `GOOS` 和 `GOARCH` 来控制编译的环境

### 环境变量

对于 ARM 架构默认是 ARM V8

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

## 资源存放

将 `v2ray` 和 `v2ctl` 已经你的配置文件、geo 资源等放入你的手机内部存储中

例如：手机U盘/V2Ray

## 运行 V2Ray

### 连接 ADB

用数据线连接电脑，打开设备的 USB 调试、开启 "仅充电"模式下允许 ADB 调试；USB连接模式改为 "文件传输"

打开终端输入以下命令

```bash
adb devices
```

若手机会提示 "是否允许xxxx计算机USB调试"则勾选 "一律允许"然后确认

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

将设备内部存储中的 V2Ray 程序复制到设备临时目录中，给予权限

```
cp /sdcard/V2Ray/* /data/local/tmp/
cd /data/local/tmp/
chmod 777 v2*
```

尝试运行一下；由于系统限制建议使用 `1000+` 以上的端口号

```
./v2ray
```

测试没问题后按下 `Ctrl+C` 结束进程，然后把 USB 传输模式改为 "仅充电"

然后再重新连接进入到 `/data/local/tmp` 目录

::: tip 注意
实测在 "传输文件" 模式下无论怎样只要断开就会挂掉后台，而仅充电模式下不会
:::

后台运行 V2Ray

```bash
nohup ./v2ray &
```

此时，打开任务管理器，找到名为 `adb` 的进程，然后结束它；Windows 如果有两个进程则结束第二个

这样就能躲过断开连接后程序挂掉的问题了

## 全局代理

打开你的 APN 设置，由于默认的 APN 不允许更改，所以需要新建一个，内容复制默认的就可以

然后在 "代理" 一栏中填入 `127.0.0.1`，端口号为你的端口号，保存即可

返回上层设置，选择这个 APN

至此，完毕

## 其他

实测非常省电，根本都感受不到 `core` 的存在；个人感觉响应速度比套壳的要快不少

对于游戏，实测不会影响打王者，当然可能和分流有关这里就不再重复了

### 测试版本

go version go1.15.6 windows/amd64

v2fly/v2ray-core master