# Plan: Arreglar Tests FALLIDOS Restantes (Nuevos Prefijos de Red)

## Contexto

El plan anterior actualizo varios archivos, pero aun quedan tests fallando debido a los nuevos prefijos de red. Este plan identifica y documenta los archivos restantes que necesitan actualizacion.

### Prefijos Actuales (de `lib/networks.js`)

| Red | Tipo | Prefijo (hex) | Caracteres resultantes |
|-----|------|--------------|------------------------|
| livenet | pubkeyhash | `0x32` (50) | `M...` |
| livenet | scripthash | `0x05` (5) | `3...` |
| livenet | privatekey | `0x4b` (75) | `C...` (WIF) |
| testnet | pubkeyhash | `0x6e` (110) | `m...` |
| testnet | scripthash | `0x0c` (12) | `8...` |
| testnet | privatekey | `0xef` (239) | `c...` (WIF) |

### Prefijos ANTERIORES (que causaron los failures)

| Red | Tipo | Prefijo (hex) | Caracteres resultantes |
|-----|------|--------------|------------------------|
| livenet | pubkeyhash | `0x4c` (76) | `M...` (anterior) |
| livenet | scripthash | `0x10` (16) | `3...` (anterior) |
| testnet | pubkeyhash | `0x6f` (111) | `m...` (anterior) |
| testnet | scripthash | `0x0c` (12) | `8...` (mismo) |

---

## Estado Actual de los Tests

### Resultado de Tests (26-abr-2026)
```
Test Files  7 failed | 65 passed | 1 skipped (73)
Tests      35 failed | 3485 passed | 17 skipped (3537)
```

### Archivos FALLANDO (7 archivos)

#### 1. `test/publickey.js` - 1 test
```
FAIL  test/publickey.js > PublicKey > hashes
```
**Causa:** Las direcciones en el array `data` en lineas 532-548 usan prefixes antiguos.

**Direcciones afectadas:**
- `MQkfbT62Z9g1QokrY87HpNKXasHjgiBETt` (livenet p2pkh - prefix 0x4c)
- `MUQsp9z4H4TpDZgJRNXctcDUSBkszKdBjR` (livenet p2pkh - prefix 0x4c)
- `MLs53HHjCJ6BhAr1kzqKhbGneCP9apJ1fs` (livenet p2pkh - prefix 0x4c)
- `MEPhNDxmmneQY5kccU4qxJoXXJLC79GNCp` (livenet p2pkh - prefix 0x4c)

**Nota:** Las direcciones `M...` anteriores usan prefix `0x4c`, las nuevas usan `0x32`.

#### 2. `test/transaction/transaction.js` - 7 tests
```
FAIL  test/transaction/transaction.js > Transaction > transaction creation test vector > case 1-6
FAIL  test/transaction/transaction.js > Transaction > change address > accepts a P2SH address for change
```
**Causa:** Direcciones testnet (`m...`) con prefix antiguo `0x6f` en los vectores de prueba.

**Direcciones afectadas:**
- `mUewrPVYccx5FJUNbtCeTBtwFMy6Zh7YoJ` (testnet p2pkh)
- `mGqbK4aeHVzA1wEZWTTuiYm7kpbYBVd2E9` (testnet p2pkh)
- `8tdHAwttdvR87BihpKRSUjN6HyQNVZsqBv` (testnet p2sh)
- `mP1FEc5XA8SLWQ9ZLEWG8HboCByynBLRcX` (testnet p2pkh)

#### 3. `test/transaction/input/multisig.js` - 1 test
```
FAIL  test/transaction/input/multisig.js [ test/transaction/input/multisig.js ]
TypeError: Address buffers must be exactly 21 bytes.
```
**Causa:** La direccion `A4DELuxbpebYJxmEyqzYKRQaW6vJPyNuJWo` en linea 32 tiene un hash de 20 bytes pero el prefijo no corresponde a ninguna red valida con esos bytes.

**Nota:** Esta es una direccion livenet que parece usar prefix incorrecto (no `M...` ni `3...` valido).

#### 4. `test/deterministicmnlist/SimplifiedMNList.js` - 16 tests
```
FAIL  test/deterministicmnlist/SimplifiedMNList.js > SimplifiedMNList > ...
```
**Causa:** Los archivos JSON fixture (`smlstore4765_4853.json`, etc.) contienen scripts con direcciones testnet outdated.

**Archivos JSON afectados:**
- `test/fixtures/smlstore4765_4853.json`
- `test/fixtures/smlstore4765_4853_noQuorums.json`
- `test/fixtures/smlstore4848_4864.json`
- `test/fixtures/testnetSMLDiffs.json`

**Scripts con direcciones outdated (dentro de los JSON):**
- `76a91416b93a3b9168a20605cc3cda62f6135a3baa531a88ac` (contiene hash testnet con prefix antiguo)

#### 5. `test/deterministicmnlist/QuorumEntry.js` - 3 tests
```
FAIL  test/deterministicmnlist/QuorumEntry.js > QuorumEntry > quorum members/signatures
```
**Causa:** Usa los mismos fixtures JSON de SML que SimplifiedMNList.js.

#### 6. `test/instantlock/instantlock.js` - 6 tests
```
FAIL  test/instantlock/instantlock.js > InstantLock > ...
```
**Causa:** Usa `getSMLStoreJSON()` y `getSMLStoreJSONFixtureNoQuorums()` que cargan los JSON fixtures outdated.

#### 7. `test/chainlock/chainlock.js` - 2 tests
```
FAIL  test/chainlock/chainlock.js > ChainLock > ...
```
**Causa:** Usa los mismos fixtures JSON de SML.

---

## Pasos para Completar

### Paso 1: Regenerar direcciones testnet para transaction.js

Las direcciones testnet actuales (`m...`) usan prefix `0x6f`. Necesitamos regenerarlas con el nuevo prefix `0x6e`.

**Script para regenerar direcciones testnet:**
```javascript
const bitcore = require('./index.js');
const Base58Check = bitcore.encoding.Base58Check;
const Networks = bitcore.Networks;

// Hash original de 'mUewrPVYccx5FJUNbtCeTBtwFMy6Zh7YoJ'
const hash1 = 'b472a2660d208bbf0b8e5f2a7d96eb6ca7f2dba0b'; // 20 bytes

// Generar nueva direccion testnet p2pkh
const prefix = Networks.testnet.pubkeyhash; // 0x6e (110)
const buf = Buffer.concat([Buffer.from([prefix]), Buffer.from(hash1, 'hex')]);
const newAddr = Base58Check.encode(buf);
console.log('Nueva direccion:', newAddr);
```

### Paso 2: Actualizar test/publickey.js

En el array `data` de la seccion "hashes" (lineas 532-548), regenerar las 4 direcciones livenet.

**Nuevas direcciones (calculadas):**
- Las direcciones M... antiguas con prefix `0x4c` deben actualizarse a prefix `0x32`

### Paso 3: Actualizar test/transaction/input/multisig.js

La direccion `A4DELuxbpebYJxmEyqzYKRQaW6vJPyNuJWo` no parece ser valida. Verificar si debe ser regenerada o si hay un problema con el script en la linea 38.

### Paso 4: Regenerar scripts en JSON fixtures

Los archivos JSON contienen scripts OP_DUP OP_HASH160 ... que codifican direcciones testnet. El hash `16b93a3b9168a20605cc3cda62f6135a3baa531a` necesita ser recodificado con el nuevo prefix.

**Metodo:**
1. Extraer el hash de 20 bytes del script (despues de `76a914` y antes de `88ac`)
2. Recodificar con prefix testnet `0x6e`
3. Reemplazar el script en el JSON

---

## Metodo para Regenerar Direcciones

### Script de regeneracion:

```javascript
// scripts/regenerate-addresses.js
const bitcore = require('./index.js');
const Base58Check = bitcore.encoding.Base58Check;
const Networks = bitcore.Networks;

function regenerateAddress(hashHex, networkType, addressType) {
  let prefix;
  if (networkType === 'testnet') {
    prefix = addressType === 'pubkeyhash' 
      ? Networks.testnet.pubkeyhash 
      : Networks.testnet.scripthash;
  } else {
    prefix = addressType === 'pubkeyhash' 
      ? Networks.livenet.pubkeyhash 
      : Networks.livenet.scripthash;
  }
  const buf = Buffer.concat([
    Buffer.from([prefix]), 
    Buffer.from(hashHex, 'hex')
  ]);
  return Base58Check.encode(buf);
}

// Extraer hash de un script p2pkh
function extractHashFromScript(scriptHex) {
  // scriptHex = "76a914[HASH]88ac"
  const hashHex = scriptHex.replace('76a914', '').replace('88ac', '');
  return hashHex;
}

// Ejemplo:
const script = '76a91416b93a3b9168a20605cc3cda62f6135a3baa531a88ac';
const hash = extractHashFromScript(script);
const newAddr = regenerateAddress(hash, 'testnet', 'pubkeyhash');
console.log('Nuevo testnet addr:', newAddr);
```

---

## Comando para Verificar Progreso

```bash
# Ver todos los tests
npm run test:node

# Ver solo failures relacionados con addresses
npm run test:node 2>&1 | grep "mismatched network\|Invalid network\|Address buffers"

# Contar failures
npm run test:node 2>&1 | grep -c "×"
```

---

## Notas Importantes

1. **NO modificar `lib/networks.js`** - los prefijos ahí son los correctos
2. **Usar la libreria para generar direcciones** - no hardcodear valores
3. **Preservar los hashes de script/pubkey** - solo cambiar el prefix de codificacion
4. **Los JSON fixtures son grandes** - procesar con cuidado para no corromper la estructura
5. **Los tests de SimplifiedMNListEntry** ya fueron arreglados en el plan anterior

---

## Estado de Progreso

- [x] Leer plan anterior completado
- [x] Ejecutar tests para identificar failures restantes
- [x] Identificar archivos que necesitan actualizacion
- [ ] Regenerar direcciones testnet
- [ ] Actualizar test/publickey.js
- [ ] Arreglar test/transaction/input/multisig.js
- [ ] Regenerar scripts en JSON fixtures
- [ ] Verificar todos los tests pasan
