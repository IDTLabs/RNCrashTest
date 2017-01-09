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
