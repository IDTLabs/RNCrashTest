Example application to show React Native crash on Android
====================

This application triggers some internal JS VM problems on Android's port of the React Native, causing it to crash.

How to run:

- clone repo
- `yarn`
- `react-native run-android` (consult RN documentation on how to run it on your device)
- run `adb logcat` or `adb logcat *:S ReactNativeJS` to see the output and eventually crash log
- wait

Sometimes app doesnt crash right away, though it always does malfunction.

Tested setup: Samsung Galaxy S7, Android 6.0.1, RN 0.39 and 0.40, MobX 2.6.5 & 2.7.0.

### How it works

The application creates large (>1000 elements) array and puts it to the MobX `@observable`, then reads some fields from it. This is repeated every 2 seconds. The mere array read through MobX observable array do crash the JS VM.

Following 2 lines should be repeated to the output every 2 seconds:

```
'APEEK1', { b: [Getter/Setter] }, { b: [Getter/Setter] }, { b: [Getter/Setter] }
'APEEK2', { b: [Getter/Setter] }, { b: [Getter/Setter] }, { b: [Getter/Setter] }
```

They should always be identical. However, after 10-12 seconds usually second line is starting to display some junk like

```
'APEEK1', { b: [Getter/Setter] }, { b: [Getter/Setter] }, { b: [Getter/Setter] }
'APEEK2', undefined, { b: [Getter/Setter] }, { b: [Getter/Setter] }
```

or

```
'APEEK1', { b: [Getter/Setter] }, { b: [Getter/Setter] }, { b: [Getter/Setter] }
'APEEK2', [ '\'APEEK2\'', 'undefined', '{ b: [Getter/Setter] }', '{ b: [Getter/Setter] }' ], { b: [Getter/Setter] }, { b: [Getter/Setter] }
```

### Internals

Mobx creates `ObservableArray` class and defines a bunch of array getters on its prototype (basically getter+setter for property `"0"`, then for property `"1"`, etc.). This is apparently most performant approach to wrap all array access in order to instrument it. MobX does it in smart way, starting with 1000 getters and then increasing their amount when it notices larger array. That way in most cases the cost is negligible, and when it comes, it is paid only once.

The JS VM (from mid-2014 version of Webkit, namely r174650) used in React Native has some problems with JIT (I think), so when the getters are called, they do receive junk in their arguments (sometimes just weird number, sometimes some array, sometimes object, instead of simple index). MobX handles that as much as it can, but occasionally when code is doing stuff like `myArray[ 1000 ]` the 1000th getter is not called at all, but app freezes or crashes.

The behaviour is not observable when remotely debugging Android app - apparently newer Chrome handles this properly.

Interestingly, first 1000 getters usually work fine. In most cases only the subsequent ones do fail.

See more at [https://github.com/mobxjs/mobx/issues/734]

### Example stacktrace from crash

```
01-09 10:01:02.264 27214 27256 F libc    : Fatal signal 11 (SIGSEGV), code 1, fault addr 0xbbadbeef in tid 27256 (mqt_js)
01-09 10:01:02.324  4894  4894 F DEBUG   : *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** ***
01-09 10:01:02.324  4894  4894 F DEBUG   : Build fingerprint: 'samsung/hero2ltexx/hero2lte:6.0.1/MMB29K/G935FXXU1BPLB:user/release-keys'
01-09 10:01:02.324  4894  4894 F DEBUG   : Revision: '9'
01-09 10:01:02.324  4894  4894 F DEBUG   : ABI: 'arm'
01-09 10:01:02.324  4894  4894 F DEBUG   : pid: 27214, tid: 27256, name: mqt_js  >>> com.rncrasher <<<
01-09 10:01:02.324  4894  4894 F DEBUG   : signal 11 (SIGSEGV), code 1 (SEGV_MAPERR), fault addr 0xbbadbeef
01-09 10:01:02.374  4894  4894 F DEBUG   :     r0 da2799ac  r1 fffffffe  r2 bbadbeef  r3 00000000
01-09 10:01:02.374  4894  4894 F DEBUG   :     r4 d7cab390  r5 fffffffb  r6 da279b48  r7 d7cab420
01-09 10:01:02.374  4894  4894 F DEBUG   :     r8 da279c08  r9 da279a58  sl d9f35000  fp da279ff4
01-09 10:01:02.374  4894  4894 F DEBUG   :     ip d9865900  sp da279a30  lr eeb28d67  pc eeb28d9c  cpsr 40070030
01-09 10:01:02.374  4894  4894 F DEBUG   :
01-09 10:01:02.374  4894  4894 F DEBUG   : backtrace:
01-09 10:01:02.374  4894  4894 F DEBUG   :     #00 pc 00182d9c  /data/app/com.rncrasher-1/lib/arm/libjsc.so (WTFCrash+19)
01-09 10:01:02.374  4894  4894 F DEBUG   :     #01 pc 0010770f  /data/app/com.rncrasher-1/lib/arm/libjsc.so
01-09 10:01:02.374  4894  4894 F DEBUG   :     #02 pc 0010777d  /data/app/com.rncrasher-1/lib/arm/libjsc.so
01-09 10:01:02.374  4894  4894 F DEBUG   :     #03 pc 0014274f  /data/app/com.rncrasher-1/lib/arm/libjsc.so (_ZNK3JSC12PropertySlot14functionGetterEPNS_9ExecStateE+32)
01-09 10:01:02.374  4894  4894 F DEBUG   :     #04 pc 000ac18b  /data/app/com.rncrasher-1/lib/arm/libjsc.so
01-09 10:01:02.384  4894  4894 F DEBUG   :     #05 pc 000ac62b  /data/app/com.rncrasher-1/lib/arm/libjsc.so
01-09 10:01:02.384  4894  4894 F DEBUG   :     #06 pc 000b0eb3  /data/app/com.rncrasher-1/lib/arm/libjsc.so
01-09 10:01:02.834  4894  4894 F DEBUG   :
01-09 10:01:02.834  4894  4894 F DEBUG   : Tombstone written to: /data/tombstones/tombstone_02
01-09 10:01:02.834  4894  4894 E DEBUG   : AM write failed: Broken pipe
01-09 10:01:02.834  4894  4894 E         : ro.product_ship = true
01-09 10:01:02.834  4894  4894 E         : ro.debug_level = 0x4f4c
01-09 10:01:02.834  4894  4894 E         : sys.mobilecare.preload = false
01-09 10:01:02.834  7783  7783 E audit   : type=1701 msg=audit(1483952462.834:1883): auid=4294967295 uid=10229 gid=10229 ses=4294967295 subj=u:r:untrusted_app:s0:c512,c768 pid=27256 comm="mqt_js" exe="/system/bin/app_process32" sig=11
```