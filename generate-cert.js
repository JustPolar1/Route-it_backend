const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Intenta usar openssl del sistema
try {
    console.log('Generando certificado autofirmado con información personalizada...');
    const command = `openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/O=Equipo 5/CN=equipo5.local" -addext "subjectAltName=DNS:equipo5.local,DNS:route-it.local,IP:10.1.124.25"`;
    execSync(command, { cwd: __dirname });
    console.log('✓ Certificado generado exitosamente');
    console.log('✓ Archivos: cert.pem y key.pem');
} catch (error) {
    console.log('OpenSSL no disponible. Usando generador alternativo...');
    
    // Usar el módulo forge como alternativa
    try {
        const forge = require('node-forge');
        
        // Crear certificado autofirmado
        const pki = forge.pki;
        const keys = pki.rsa.generateKeyPair(2048);
        
        const cert = pki.createCertificate();
        cert.publicKey = keys.publicKey;
        cert.serialNumber = '01';
        cert.validity.notBefore = new Date();
        cert.validity.notAfter = new Date();
        cert.validity.notAfter.setFullYear(cert.validity.notAfter.getFullYear() + 1);
        
        const attrs = [{
            name: 'commonName',
            value: 'equipo5.local'
        }, {
            name: 'organizationName',
            value: 'Equipo 5'
        }, {
            name: 'countryName',
            value: 'MX'
        }];
        
        cert.setSubject(attrs);
        cert.setIssuer(attrs);
        cert.setExtensions([{
            name: 'basicConstraints',
            cA: true
        }, {
            name: 'keyUsage',
            keyCertSign: true,
            digitalSignature: true,
            nonRepudiation: true,
            keyEncipherment: true,
            dataEncipherment: true
        }, {
            name: 'subjectAltName',
            altNames: [
                {
                    type: 2,
                    value: 'equipo5.local'
                },
                {
                    type: 2,
                    value: 'route-it.local'
                },
                {
                    type: 7,
                    ip: '10.1.124.25'
                },
                {
                    type: 7,
                    ip: '1.1.1.1'
                },
                {
                    type: 7,
                    ip: '1.0.0.1'
                }
            ]
        }]);
        
        // Firmar el certificado
        cert.sign(keys.privateKey, forge.md.sha256.create());
        
        // Guardar archivos en formato PEM
        const certPem = pki.certificateToPem(cert);
        const keyPem = pki.privateKeyToPem(keys.privateKey);
        
        fs.writeFileSync(path.join(__dirname, 'cert.pem'), certPem);
        fs.writeFileSync(path.join(__dirname, 'key.pem'), keyPem);
        
        console.log('✓ Certificado generado exitosamente con node-forge');
        console.log('✓ Organización: Equipo 5');
        console.log('✓ CN: equipo5.local');
        console.log('✓ IP Local: 10.1.124.25');
        console.log('✓ DNSs Cloudflare: 1.1.1.1, 1.0.0.1');
        console.log('✓ Nombres de dominio: equipo5.local, route-it.local');
        console.log('✓ Vigencia: 1 año');
        console.log('✓ Archivos: cert.pem y key.pem');
    } catch (forgeError) {
        console.error('Error: node-forge no está instalado');
        console.error('Por favor instala: npm install node-forge');
        process.exit(1);
    }
}
