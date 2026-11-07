import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import forge from 'node-forge';
import { ApkSigner, SigningKey } from 'apk_sign_ts';

async function updateAndSignApk() {
  const rootDir = process.cwd();
  const apkPath = path.join(rootDir, 'MISE complete', 'Mise-POS-Android-App.apk');
  const publicDir = path.join(rootDir, 'android', 'app', 'src', 'main', 'assets', 'public');
  
  console.log('Reading APK from:', apkPath);
  const apkBuffer = fs.readFileSync(apkPath);
  
  const zip = await JSZip.loadAsync(apkBuffer);
  
  // 1. Remove all existing files under assets/public/
  const filesToDelete = [];
  zip.forEach((relativePath) => {
    if (relativePath.startsWith('assets/public/')) {
      filesToDelete.push(relativePath);
    }
    if (relativePath.startsWith('META-INF/') && (relativePath.endsWith('.SF') || relativePath.endsWith('.RSA') || relativePath.endsWith('.DSA') || relativePath.endsWith('MANIFEST.MF'))) {
      filesToDelete.push(relativePath);
    }
  });
  
  for (const f of filesToDelete) {
    zip.remove(f);
  }
  console.log(`Removed ${filesToDelete.length} old entries from APK.`);
  
  // 2. Add all new files from publicDir into assets/public/
  function addDirToZip(currentDir, zipPrefix) {
    const items = fs.readdirSync(currentDir);
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      const zipPath = zipPrefix + '/' + item;
      if (stat.isDirectory()) {
        addDirToZip(fullPath, zipPath);
      } else {
        const content = fs.readFileSync(fullPath);
        zip.file(zipPath, content);
        console.log(`Added to APK: ${zipPath} (${content.length} bytes)`);
      }
    }
  }
  
  addDirToZip(publicDir, 'assets/public');
  
  const capConfigPath = path.join(rootDir, 'android', 'app', 'src', 'main', 'assets', 'capacitor.config.json');
  if (fs.existsSync(capConfigPath)) {
    zip.file('assets/capacitor.config.json', fs.readFileSync(capConfigPath));
  }
  
  console.log('Packing updated ZIP archive...');
  const unsignedZipBuffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });
  
  console.log('Unsigned APK size:', unsignedZipBuffer.length);
  
  // 3. Generate Android debug key & cert in PKCS#8 format
  console.log('Generating RSA-2048 Android Debug signing key (PKCS#8)...');
  const keys = forge.pki.rsa.generateKeyPair(2048);
  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = '01';
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 30);
  
  const attrs = [
    { name: 'commonName', value: 'Android Debug' },
    { name: 'organizationName', value: 'Android' },
    { name: 'countryName', value: 'US' }
  ];
  cert.setSubject(attrs);
  cert.setIssuer(attrs);
  cert.sign(keys.privateKey, forge.md.sha256.create());
  
  // Wrap into PKCS#8 PrivateKeyInfo
  const rsaPrivateKeyAsn1 = forge.pki.privateKeyToAsn1(keys.privateKey);
  const privateKeyInfo = forge.pki.wrapRsaPrivateKey(rsaPrivateKeyAsn1);
  const privateKeyPem = forge.pki.privateKeyInfoToPem(privateKeyInfo);
  const certPem = forge.pki.certificateToPem(cert);
  
  console.log('Signing APK with v1 + v2 schemes...');
  const signingKey = SigningKey.fromPEM(privateKeyPem, certPem);
  const signer = new ApkSigner({
    signingKey: signingKey,
    digestAlgorithm: 'SHA-256'
  });
  
  const result = await signer.sign(new Uint8Array(unsignedZipBuffer));
  const signedBuffer = Buffer.from(result.signedApk);
  
  fs.writeFileSync(apkPath, signedBuffer);
  
  const now = new Date();
  fs.utimesSync(apkPath, now, now);
  
  console.log(`SUCCESS! Rebuilt and signed ${apkPath}`);
  console.log(`New APK file size: ${signedBuffer.length} bytes`);
  console.log(`Timestamp updated to: ${now.toISOString()}`);
}

updateAndSignApk().catch(err => {
  console.error('Error during APK rebuild:', err);
  process.exit(1);
});
