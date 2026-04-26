# Plan: Actualizar Tests para Nuevos Prefijos de Red

## Contexto

Se modificaron los prefijos de red en `lib/networks.js` y los tests necesitan ser actualizados para reflejar estos cambios. **No se debe modificar `lib/networks.js`**.

### Prefijos Actuales (de `lib/networks.js`)

| Red | Tipo | Prefijo (hex) | Caracteres resultantes |
|-----|------|--------------|------------------------|
| livenet | pubkeyhash | `0x32` (50) | `M...` |
| livenet | scripthash | `0x05` (5) | `3...` |
| livenet | privatekey | `0x4b` (75) | `C...` (WIF) |
| testnet | pubkeyhash | `0x6e` (110) | `m...` |
| testnet | scripthash | `0x0c` (12) | `8...` |
| testnet | privatekey | `0xef` (239) | `c...` (WIF) |

### Prefijos ANTERIORES (usados en tests originales)

| Red | Tipo | Prefijo (hex) |
|-----|------|--------------|
| livenet | pubkeyhash | `0x4c` |
| livenet | scripthash | `0x10` |
| testnet | pubkeyhash | `0x6f` |
| testnet | scripthash | `0x0c` |

---

## Estado Actual de los Tests

### Tests YA Arreglados
- `test/script/script.js` - 4 direcciones actualizadas
- `test/address.js` - Variables base (`buf`, `str`) actualizadas

### Tests FALLANDO (75 tests en 41 archivos)

#### 1. ERROR MAS COMUN: "Address has mismatched network type" (~40+ occurrences)

**Causa:** Las direcciones en fixtures/expectations usan prefixes antiguos.

**Archivos afectados:**
- `test/privatekey.js` (8 failures)
- `test/publickey.js` (4 failures)
- `test/uri.js` (2 failures)
- `test/bloomfilter.js` (1 failure)
- `test/deterministicmnlist/SimplifiedMNListEntry.js` (15 failures)
- `test/transaction/transaction.js`
- `test/transaction/signature.js`
- `test/transaction/unspentoutput.js` (5 failures)
- `test/transaction/input/multisig.js` (2 failures)
- `test/govobject/types/proposal.js` (9 failures - "Invalid Timespan")

#### 2. ERROR: "Invalid network" (~12 occurrences)

**Causa:** Private keys WIF con prefix antiguo no coinciden con nuevo `privatekey: 0x4b`.

**Archivos afectados:**
- `test/privatekey.js`
- `test/publickey.js`
- `test/bloomfilter.js`

#### 3. Fixture Files con Direcciones Outdated

**Archivos:**
- `test/fixtures/payload/proregtxpayload.js`
- `test/fixtures/payload/proupregtxpayload.js`
- `test/fixtures/payload/prouprevtxpayload.js`
- `test/fixtures/payload/proupservpayload.js`

**Direcciones a actualizar (testnet con prefix `y`):**
- `yh9o9kPRK1s3YsuyCBe3DEjBit2RnzhgwH` → needs regeneration
- `yRyv33x1PzwSTW3B2DV3XXRyr7Z5M2P4V7` → needs regeneration

#### 4. ERRORES SEPARADOS (Compatibilidad Vitest - NO relacionados con direcciones)

**NO TOCAR si el objetivo es solo actualizar prefijos:**
- `test/chainlock/chainlock.js` - `this.timeout()` no soportado en Vitest
- `test/deterministicmnlist/QuorumEntry.js` - `this.timeout()` no soportado
- `test/deterministicmnlist/SimplifiedMNList.js` - `this.timeout()` no soportado
- `test/instantlock/instantlock.js` - `this.timeout()` no soportado
- `test/mnemonic/mnemonic.unit.js` - `this.timeout()` no soportado
- `test/mnemonic/pbkdf2.test.js` - `this.timeout()` no soportado
- `test/configuration.js` - `before is not defined` (sintaxis Mocha)
- `test/transaction/payload/assetlockpayload.js` - `before is not defined`
- `test/transaction/payload/assetunlockpayload.js` - `before is not defined`
- `test/transaction/payload/coinbasepayload.js` - `before is not defined`
- `test/transaction/payload/commitmenttxpayload.js` - `before is not defined`
- `test/transaction/payload/mnhfsignalpayload.js` - `before is not defined`
- `test/data/blk19976-testnet.js` - "No test suite found"
- `test/data/merkleblocks.js` - "No test suite found"
- `test/fixtures/getSMLStoreJSON.js` - "No test suite found"
- `test/fixtures/getSMLStoreNoQuorumsJSON.js` - "No test suite found"
- `test/fixtures/mnList.js` - "No test suite found"
- `test/fixtures/payload/*.js` - "No test suite found"
- `test/transaction/payload/payloadparser.js` - "No test suite found"

#### 5. Tests de Networks.js

- `test/networks.js` - 2 failures (buscando prefixes antiguos)

---

## Pasos para Completar

### Paso 1: Generar Nuevas Direcciones para Fixtures

Usar este script para regenerar direcciones:

```javascript
const Base58Check = require('./lib/encoding/base58check');
const Networks = require('./lib/networks');

function regenerateAddress(hash, type, network) {
  const prefix = network === 'livenet' 
    ? (type === 'pubkeyhash' ? Networks.livenet.pubkeyhash : Networks.livenet.scripthash)
    : (type === 'pubkeyhash' ? Networks.testnet.pubkeyhash : Networks.testnet.scripthash);
  const buf = Buffer.concat([Buffer.from([prefix]), Buffer.from(hash, 'hex')]);
  return Base58Check.encode(buf);
}
```

### Paso 2: Actualizar test/fixtures/payload/*.js

Buscar estas direcciones outdated y regenerarlas:
- `yh9o9kPRK1s3YsuyCBe3DEjBit2RnzhgwH` (testnet p2pkh)
- `yRyv33x1PzwSTW3B2DV3XXRyr7Z5M2P4V7` (testnet p2pkh)

### Paso 3: Actualizar test/privatekey.js

Expectations con direcciones M... antiguas necesitan actualizarse a nuevas.

### Paso 4: Actualizar test/publickey.js

Expectations con direcciones M.../y... antiguas.

### Paso 5: Actualizar test/uri.js

Direcciones URI outdated.

### Paso 6: Actualizar test/bloomfilter.js

WIF keys outdated.

### Paso 7: Actualizar SimplifiedMNListEntry fixtures

Direcciones en `test/deterministicmnlist/SimplifiedMNListEntry.js`.

### Paso 8: Actualizar transaction fixtures/tests

Dirección `yXGeNPQXYFXhLAN1ZKrAjxzzBnZ2JZNKnh` en transaction tests.

### Paso 9: Actualizar test/networks.js

Solo si busca prefixes específicos en tests.

---

## Comandos para Verificar Progreso

```bash
# Ver todos los tests
npm run test:node

# Ver solo failures relacionados con addresses
npm run test:node 2>&1 | grep "mismatched network\|Invalid network"

# Contar failures
npm run test:node 2>&1 | grep -c "×"
```

---

## Notas Importantes

1. **NO modificar `lib/networks.js`** - los prefijos ahí son los correctos
2. **Usar la librería para generar direcciones** - no hardcodear
3. **Preservar los hashes de script/pubkey** - solo cambiar el prefix de encoding
4. **Tests de Vitest** son un problema separado y no están relacionados con los prefijos de red
