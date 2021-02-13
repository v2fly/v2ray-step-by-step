# Android Root-free running core

Android runs V2Ray-core without Root permission and configures global proxy

This method is suitable for users who do not frequently change the configuration and the device does not have root permissions
___

Preparation tools:

* computer
* adb environment
* Data cable (used to connect the device to the computer)

Required skills:

* Learn about APN settings
* Some practical Linux experience
* Able to [compile V2Ray-core] (https://www.v2fly.org/developer/intro/compile.html#%E5%A4%9A%E7%A7%8D%E6%9E%84%E5%BB%BA%E6%96%B9%E5%BC%8F)
* Able to set the environment variables of the operating system you are using

Tested terminal environment:

* Android 10
* ARM V8

::: warning note
Since Golang only supports Android 10+, lower versions of Android may not be able to run through this method
:::

Disadvantages:

* You need to manually start the program after the device restarts
* USB will automatically end all processes started by this method when using the `file transfer` mode

## Preparation

::: tip

This phenomenon has been dealt with in v4.34+ version, you can directly proceed to the [compile](#compile) step

See [#572](https://github.com/v2fly/v2ray-core/pull/572) for details

If you want to customize the default DNS, you can still use the solution to modify the source code in [Solution](#Solution)

:::

Since there is no `/etc/resolv.conf` in the Android system and it cannot be created without Root permission, the Go language cannot read the file and uses the default address `127.0.0.1:53` (but Android There is no local DNS of 53), and because of the system limitation, it cannot monitor the lower port number and cannot be used
V2Ray handles this problem; therefore, running `core` directly will cause DNS resolution problems due to the influence of the Go language (Android)

### Solution

After cloning the code, [modify here](https://github.com/v2fly/v2ray-core/blob/master/infra/conf/dns_bootstrap_android.go#L10); for example, modify DNS to `1.1.1.1`

```go
const bootstrapDNS = "1.1.1.1:53"
```
Only supports traditional UDP DNS

## Compile

Go language mainly controls the compilation environment through `GOOS` and `GOARCH`

### Environment variable

Using `arm64` is ARM V8

```bash
SET GOOS=android
SET GOARCH=arm64
```

Other ARM architectures, such as V7

```bash
SET GOOS=android
SET GOARCH=arm
SET GOARM=7
```

Enter the `v2ray-core` directory, the complete command is as follows (Windows)

```bash
SET CGO_ENABLED=0
SET GOOS=android
SET GOARCH=arm64
go build -o D:/v2ray -trimpath -ldflags "-s -w -buildid=" ./main
go build -o D:/v2ctl -trimpath -ldflags "-s -w -buildid=" -tags confonly ./infra/control/main
```

The compiled program is placed in `D:/`

## Resource storage

Put `v2ray` and `v2ctl` and configuration files and other resources into the internal storage of your device

For example, "Mobile phone internal storage/V2Ray" folder

## Run V2Ray

### Connect to ADB

1. Use the data cable to connect to the computer
2. Turn on USB debugging of the device
3. Enable ADB debugging in "Charge Only" mode
4. Change the USB connection mode to "File Transfer"

### Testing Equipment

Open the terminal and enter the following command

```bash
adb devices
```

If the device prompts "Whether to allow USB debugging", check "Always allow..." and confirm

If the terminal displays as follows, the connection is successful

```
List of devices attached
1234567C06011253        device
```

### Transfer files

Continue to enter the following command, the terminal will become the identifier of the mobile phone at this time

```bash
adb shell
```

Copy the V2Ray program in the internal storage of the device to the temporary directory of the device and give permission

```
cp /sdcard/V2Ray/* /data/local/tmp/
cd /data/local/tmp/
chmod 777 v2*
```

Try to run it; due to system limitations, it is recommended to use port numbers above `1024` for inbound in Inbound

```
./v2ray
```

After the test is no problem, press `Ctrl+C` to end the process, and then change the USB transfer mode to "charge only"

::: warning note
Due to Android system limitations, all programs running through this method will be terminated when the connection is disconnected in the "transfer file" mode.
:::

Connect again to the `/data/local/tmp` directory

Run V2Ray in the background

```bash
nohup ./v2ray &
```

At this point, open the task manager, find the process named `adb` and end it; if there are two processes in Windows, end the second one

This can solve the problem that the process is terminated after adb is disconnected

## Global proxy

The system APN is used here to complete. Inbound requires an HTTP inbound proxy

Since the default APN is not allowed to be changed, it is necessary to create a new APN; copy the default content.

In the settings, fill in `127.0.0.1` in the "Proxy" column, the port number is your HTTP inbound port number, save it

Go back to the upper setting and select this APN

### detail

HTTP proxy is only used in HTTP scenarios. In theory, it will not affect the game match, but there is no experiment here.

Most applications using APN's proxy method will work, but special applications such as Telegram will not work

::: tip
The in-app settings of such programs usually provide the option to set the proxy, you can set it manually
:::

Because this method is inconvenient to update resources, it is recommended to use the `IPOnDemand` mode for reliable DNS routing

## other

Compared with shell apps, long-running of the `core` started in this way will not cause the device to heat up and cause significant power consumption
