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

Disadvantages:

Since the files are stored in the temporary directory, the files will be deleted after the device restarts, so you need to reset the settings after restarting

> By the way, in 2020, no one will restart the phone from time to time, right?

## Preparation

Since there is no `/etc/resolv.conf` in the Android system and no Root permission, it cannot be created;

Because the file cannot be read, the Go language uses the default address `127.0.0.1:53` (but Android does not have a local DNS for 53), but it cannot be used because of system restrictions that cannot monitor the lower port number
V2Ray handles this problem; therefore, running `core` directly will cause DNS resolution problems due to the influence of the Go language (Android)

The solution is as follows:

You only need to modify one line of code, find the installation location of the Go language, and edit `src/net/dnsconfig_unix.go`, at line 19 (go version go1.15.6)

```vim
defaultNS = []string{"127.0.0.1:53", "[::1]:53"}
```

Here is changed to Alibaba’s DNS, or it can be changed to other

Examples are as follows:

```vim
defaultNS = []string{"223.5.5.5:53", "[2400:3200::1]:53"}
```

Just save, and then you can start [compile](#compile), and then change back to

## Compile

You cannot use the `linux-armXXX` in [precompilation](https://github.com/v2fly/v2ray-core/releases), otherwise [this problem](https://github.com/ v2ray/discussion/issues/555)

Go language mainly uses `GOOS` and `GOARCH` to control the compilation environment

### Environment variable

For ARM architecture, the default is ARM V8

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

## Resource storage

Put `v2ray` and `v2ctl` and your configuration files, geo resources, etc. into the internal storage of your phone

For example, "mobile phone internal storage/V2Ray" folder

## Run V2Ray

### Connect to ADB

Connect the computer with a data cable, turn on the USB debugging of the device, and enable ADB debugging in the "charge only" mode; change the USB connection mode to "file transfer"

Open the terminal and enter the following command

```bash
adb devices
```

If the phone prompts "Whether to allow USB debugging", check "Always allow..." and confirm

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

Try to run it; due to system limitations, it is recommended to use port numbers above `1024`

```
./v2ray
```

After the test is no problem, press `Ctrl+C` to end the process, and then change the USB transfer mode to "charge only"

Then reconnect to the `/data/local/tmp` directory

::: tip Note
It is measured that in the "transfer file" mode, the background will hang up as long as you disconnect it, but not in the charging mode.
:::

Run V2Ray in the background

```bash
nohup ./v2ray &
```

At this point, open the task manager, find the process named `adb`, and end it; if there are two processes in Windows, end the second one

This way, you can avoid the problem of program hanging after disconnection

## Global proxy

Open your APN settings. Since the default APN cannot be changed, you need to create a new one. Just copy the default one.

Then fill in `127.0.0.1` in the "Proxy" column, the port number is your port number, save it

Go back to the upper setting and select this APN

All done.

## other

The actual measurement is very power-saving, and I can’t feel the existence of `core` at all; I personally feel that the response speed is much faster than that of the shell

For the game, the actual measurement will not affect the champion, of course it may be related to the diversion, so I won’t repeat it here.

### test version

go version go1.15.6 windows/amd64

v2fly/v2ray-core master
