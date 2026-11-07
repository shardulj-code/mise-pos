# Mise

Mise is a responsive, offline-first restaurant operations client. The current slice is an interactive product foundation for Counter, Kitchen, Main Admin, and Mise Guide.

## Target platforms

- Android phones and tablets: Capacitor project; release output is an APK/AAB after Android Studio signing.
- Windows laptops and computers: the shared client will be packaged in an Electron desktop shell in the desktop milestone.
- Browser: the responsive client is usable at phone, tablet, laptop, and desktop widths during development.

## Run locally

```bash
npm install
npm run dev
```

## Build the shared client

```bash
npm run build
```

## Native mobile setup

Install Android Studio with an Android SDK before creating an Android build.

```bash
npx cap add android
npm run mobile:sync
```

Native project folders are intentionally not committed until each platform’s toolchain is available and the app is tested on physical devices.
