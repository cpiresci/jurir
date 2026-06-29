#!/bin/bash
# ============================================================
# JURIR — Script de correção do APK (aplica no Termux)
# Repositório: ~/jurir (cpiresci/jurir)
# ============================================================
set -e

REPO="$HOME/jurir"
cd "$REPO"

echo "=== [1/6] Removendo AndroidManifest.xml INCORRETO em res/ ==="
# Existe um AndroidManifest.xml dentro de android/app/src/main/res/
# Isso causa merge conflict no Gradle — o Manifest correto fica em src/main/
rm -f android/app/src/main/res/AndroidManifest.xml
echo "✅ Removido android/app/src/main/res/AndroidManifest.xml"

echo ""
echo "=== [2/6] Corrigindo AndroidManifest.xml principal ==="
# O manifest em src/main/ está com usesCleartextTraffic="false"
# mas o network_security_config já gerencia isso; manter false é correto
# porém falta o atributo android:exported no provider (obrigatório API 31+)
# e o splash screen meta-data necessário para Capacitor SplashScreen
cat > android/app/src/main/AndroidManifest.xml << 'MANIFEST'
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32"/>
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="29"/>
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:label="@string/app_name"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="false"
        android:networkSecurityConfig="@xml/network_security_config">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:label="@string/title_activity_main"
            android:launchMode="singleTask"
            android:theme="@style/AppTheme.NoActionBarLaunch">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="${applicationId}.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths" />
        </provider>
    </application>
</manifest>
MANIFEST
echo "✅ AndroidManifest.xml corrigido"

echo ""
echo "=== [3/6] Criando proguard-rules.pro (arquivo faltando) ==="
cat > android/app/proguard-rules.pro << 'PROGUARD'
# Capacitor
-keep class com.getcapacitor.** { *; }
-keep class com.jurir.app.** { *; }

# Reflection
-keepattributes *Annotation*
-keepattributes SourceFile,LineNumberTable

# WebView JS Interface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# OkHttp (usado internamente pelo Capacitor)
-dontwarn okhttp3.**
-dontwarn okio.**
PROGUARD
echo "✅ proguard-rules.pro criado"

echo ""
echo "=== [4/6] Corrigindo build.gradle (versões e splash screen) ==="
cat > android/app/build.gradle << 'BUILDGRADLE'
apply plugin: 'com.android.application'

android {
    namespace 'com.jurir.app'
    compileSdk 36
    defaultConfig {
        applicationId "com.jurir.app"
        minSdk 24
        targetSdk 36
        versionCode 1
        versionName "1.0.0"
    }
    buildTypes {
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
            signingConfig signingConfigs.debug
        }
        debug {
            debuggable true
        }
    }
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
}

dependencies {
    implementation fileTree(dir: 'libs', include: ['*.jar'])
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'androidx.core:core-splashscreen:1.0.1'
    implementation project(':capacitor-android')
    implementation project(':capacitor-splash-screen')
}
BUILDGRADLE
echo "✅ build.gradle corrigido"

echo ""
echo "=== [5/6] Corrigindo variables.gradle (alinhar versão splash screen) ==="
cat > android/variables.gradle << 'VARIABLES'
ext {
    minSdkVersion = 24
    compileSdkVersion = 36
    targetSdkVersion = 36
    androidxAppCompatVersion = '1.6.1'
    androidxCoreVersion = '1.12.0'
    androidxSplashScreenVersion = '1.0.1'
}
VARIABLES
echo "✅ variables.gradle alinhado com build.gradle"

echo ""
echo "=== [6/6] Corrigindo workflow GitHub Actions ==="
# Problemas no workflow:
# 1. O step de versioning usa sed mas o build.gradle agora tem signingConfig debug no release
#    (necessário pois a assinatura é injetada via -P flags)
# 2. O deploy-play-store usa whatsNewDirectory que provavelmente não existe
# 3. Gradle version 8.11.1 + AGP 8.9.1 — compatível, ok

cat > .github/workflows/android-apk.yml << 'WORKFLOW'
name: Build Android APK — Jurir

on:
  push:
    branches: [main]
    paths:
      - 'src/**'
      - 'public/**'
      - 'capacitor.config.json'
      - 'package.json'
      - 'android/**'
      - '.github/workflows/android-apk.yml'
  workflow_dispatch:
    inputs:
      release_track:
        description: 'Play Store track'
        required: true
        default: 'internal'
        type: choice
        options: [internal, alpha, beta, production]

env:
  JAVA_VERSION: '17'
  NODE_VERSION: '22'

jobs:
  build-web:
    name: Build React
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: web-dist
          path: dist/
          retention-days: 1

  build-android:
    name: Build Android APK
    runs-on: ubuntu-latest
    needs: build-web
    outputs:
      version_code: ${{ steps.versioning.outputs.version_code }}
      version_name: ${{ steps.versioning.outputs.version_name }}
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: npm

      - uses: actions/setup-java@v4
        with:
          java-version: ${{ env.JAVA_VERSION }}
          distribution: temurin

      - run: npm ci

      - name: Set version from package.json + run number
        id: versioning
        run: |
          VERSION_NAME=$(node -p "require('./package.json').version")
          VERSION_CODE=${{ github.run_number }}
          echo "version_name=$VERSION_NAME" >> $GITHUB_OUTPUT
          echo "version_code=$VERSION_CODE" >> $GITHUB_OUTPUT
          echo "VERSION_NAME=$VERSION_NAME" >> $GITHUB_ENV
          echo "VERSION_CODE=$VERSION_CODE" >> $GITHUB_ENV
          sed -i "s/versionCode [0-9]*/versionCode $VERSION_CODE/" android/app/build.gradle
          sed -i "s/versionName \".*\"/versionName \"$VERSION_NAME\"/" android/app/build.gradle
          echo "✅ versionCode=$VERSION_CODE  versionName=$VERSION_NAME"

      - uses: actions/download-artifact@v4
        with:
          name: web-dist
          path: dist/

      - run: npm install -g @capacitor/cli
      - run: npx cap sync android

      - uses: android-actions/setup-android@v3

      - run: sdkmanager "build-tools;34.0.0" "platforms;android-36"

      - name: Decode Keystore
        env:
          KEYSTORE_BASE64: ${{ secrets.KEYSTORE_BASE64 }}
        run: echo "$KEYSTORE_BASE64" | base64 --decode > android/app/jurir-release-key.jks

      - run: chmod +x android/gradlew

      - name: Build Release APK
        working-directory: android
        env:
          KEY_ALIAS: ${{ secrets.KEY_ALIAS }}
          KEY_PASSWORD: ${{ secrets.KEY_PASSWORD }}
          STORE_PASSWORD: ${{ secrets.STORE_PASSWORD }}
        run: |
          ./gradlew assembleRelease \
            -Pandroid.injected.signing.store.file=$GITHUB_WORKSPACE/android/app/jurir-release-key.jks \
            -Pandroid.injected.signing.store.password=$STORE_PASSWORD \
            -Pandroid.injected.signing.key.alias=$KEY_ALIAS \
            -Pandroid.injected.signing.key.password=$KEY_PASSWORD \
            --no-daemon --stacktrace

      - name: Build Release AAB
        working-directory: android
        env:
          KEY_ALIAS: ${{ secrets.KEY_ALIAS }}
          KEY_PASSWORD: ${{ secrets.KEY_PASSWORD }}
          STORE_PASSWORD: ${{ secrets.STORE_PASSWORD }}
        run: |
          ./gradlew bundleRelease \
            -Pandroid.injected.signing.store.file=$GITHUB_WORKSPACE/android/app/jurir-release-key.jks \
            -Pandroid.injected.signing.store.password=$STORE_PASSWORD \
            -Pandroid.injected.signing.key.alias=$KEY_ALIAS \
            -Pandroid.injected.signing.key.password=$KEY_PASSWORD \
            --no-daemon --stacktrace

      - name: Rename artifacts with version
        run: |
          cp android/app/build/outputs/apk/release/app-release.apk \
             android/app/build/outputs/apk/release/jurir-v${{ env.VERSION_NAME }}-build${{ env.VERSION_CODE }}.apk
          cp android/app/build/outputs/bundle/release/app-release.aab \
             android/app/build/outputs/bundle/release/jurir-v${{ env.VERSION_NAME }}-build${{ env.VERSION_CODE }}.aab

      - uses: actions/upload-artifact@v4
        with:
          name: jurir-release-apk-v${{ env.VERSION_NAME }}-build${{ env.VERSION_CODE }}
          path: android/app/build/outputs/apk/release/jurir-v${{ env.VERSION_NAME }}-build${{ env.VERSION_CODE }}.apk
          retention-days: 30

      - uses: actions/upload-artifact@v4
        with:
          name: jurir-release-aab-v${{ env.VERSION_NAME }}-build${{ env.VERSION_CODE }}
          path: android/app/build/outputs/bundle/release/jurir-v${{ env.VERSION_NAME }}-build${{ env.VERSION_CODE }}.aab
          retention-days: 30

  deploy-play-store:
    name: Deploy Play Store
    runs-on: ubuntu-latest
    needs: build-android
    continue-on-error: true
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: jurir-release-aab-v${{ needs.build-android.outputs.version_name }}-build${{ needs.build-android.outputs.version_code }}
          path: .

      - name: Find AAB file
        id: find_aab
        run: |
          AAB_FILE=$(find . -name "*.aab" | head -1)
          echo "aab_file=$AAB_FILE" >> $GITHUB_OUTPUT
          echo "✅ AAB encontrado: $AAB_FILE"

      - name: Create whatsnew directory
        run: |
          mkdir -p whatsnew
          echo "Melhorias de estabilidade e performance." > whatsnew/whatsnew-pt-BR

      - uses: r0adkll/upload-google-play@v1.1.3
        continue-on-error: true
        with:
          serviceAccountJsonPlainText: ${{ secrets.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON }}
          packageName: com.jurir.app
          releaseFiles: ${{ steps.find_aab.outputs.aab_file }}
          track: ${{ github.event.inputs.release_track || 'internal' }}
          status: completed
          whatsNewDirectory: whatsnew/
WORKFLOW
echo "✅ Workflow corrigido"

echo ""
echo "=== Commitando tudo ==="
git add -A
git status
git commit -m "fix(android): corrige 6 erros que bloqueavam build do APK

- Remove AndroidManifest.xml duplicado em res/ (causava merge conflict)
- Cria proguard-rules.pro ausente (build.gradle referenciava mas arquivo não existia)
- Alinha versão core-splashscreen entre build.gradle e variables.gradle (1.0.1)
- Adiciona --stacktrace ao gradlew para diagnóstico mais claro em falhas futuras
- Corrige workflow: cria whatsnew/ automaticamente antes do deploy Play Store
- Remove ACTIONS_ALLOW_USE_UNSECURE_NODE_VERSION desnecessário"

echo ""
echo "=== Push ==="
git push origin main

echo ""
echo "🚀 Pronto! Acesse https://github.com/cpiresci/jurir/actions para acompanhar o build."
