/**
 * Script to regenerate test/data/tx_creation.json with correct network prefixes.
 * Run with: node scripts/regenerate_tx.js
 */

const bitcore = require('../index.js');
const base58 = require('../lib/encoding/base58');
const Base58Check = require('../lib/encoding/base58check');
const Networks = require('../lib/networks');
const Script = bitcore.Script;
const Hash = bitcore.crypto.Hash;
const fs = require('fs');

const TESTNET_PUBKEYHASH = Networks.testnet.pubkeyhash;

function convertYToM(yAddr) {
  const decoded = base58.decode(yAddr);
  const data = decoded.slice(0, 21);
  const hash = data.slice(1);
  const newBuf = Buffer.concat([Buffer.from([TESTNET_PUBKEYHASH]), hash]);
  return Base58Check.encode(newBuf);
}

function getHashFromAddress(addr) {
  const decoded = Base58Check.decode(addr);
  return decoded.slice(1).toString('hex');
}

function buildP2PKHScriptHex(addr) {
  const hash = getHashFromAddress(addr);
  return '76a914' + hash + '88ac';
}

function buildScript(addr) {
  const hash = getHashFromAddress(addr);
  return 'OP_DUP OP_HASH160 20 0x' + hash + ' OP_EQUALVERIFY OP_CHECKSIG';
}

// Case 1
const from1 = convertYToM('yYo3PeSBv2rMnJeyLUCCzx4Y8VhPppZKkC');
const to1 = convertYToM('yXGeNPQXYFXhLAN1ZKrAjxzzBnZ2JZNKnh');
const key1 = 'cSBnVM4xvxarwGQuAfQFwqDg9k5tErHUHzgWsEfD4zdwUasvqRVY';
const tx1 = new bitcore.Transaction()
  .from({
    txId: 'a477af6b2667c29670467e4e0728b685ee07b240235771862318e29ddbe58458',
    outputIndex: 0,
    script: buildP2PKHScriptHex(from1),
    satoshis: 1020000,
  })
  .to(to1, 1010000)
  .sign(key1);

// Case 2
const from2 = convertYToM('yLygrKXHautSYwRAF3TUGJvidxKqXwLA23');
const to2a = convertYToM('ySxHD5jGymxKCw8Gkr8RyNZ8weNk4NfZ2y');
const to2b = convertYToM('ybt7T6KbAbs1gKPa1sBX7VhtRbkH1MJRQw');
const key2 = 'cSQUuwwJBAg6tYQhzqqLWW115D1s5KFZDyhCF2ffrnukZxMK6rNZ';
const tx2 = new bitcore.Transaction()
  .from({
    txId: 'e42447187db5a29d6db161661e4bc66d61c3e499690fe5ea47f87b79ca573986',
    vout: 1,
    address: from2,
    scriptPubKey: buildP2PKHScriptHex(from2),
    amount: 0.0108,
  })
  .to(to2a, 500000)
  .to(to2b, 570000)
  .sign(key2);

// Case 3 - use satoshis
const from3a = convertYToM('ySxHD5jGymxKCw8Gkr8RyNZ8weNk4NfZ2y');
const from3b = convertYToM('ybt7T6KbAbs1gKPa1sBX7VhtRbkH1MJRQw');
const to3 = convertYToM('yZnGAMARuxPoT24Wg4LKDUYkRtzBYHVzQz');
const keys3 = [
  'cPGbA2C54ZZ1sw4dc2ckBE1WqkdrNSbEV8Tkjhi2p1J15oErdgP2',
  'cSpyve5bXAuyHrNeV9MjTdFz3HLw739yUjjUAUSMe3ppf2qzj2hw',
];
const tx3 = new bitcore.Transaction()
  .from({
    txId: 'a9db84566e0fc9351e86337d2828ab281b25ddc06fab798f6d4b5baef48c02b3',
    vout: 0,
    address: from3a,
    scriptPubKey: buildP2PKHScriptHex(from3a),
    satoshis: 500000,
  })
  .from({
    txId: 'a9db84566e0fc9351e86337d2828ab281b25ddc06fab798f6d4b5baef48c02b3',
    vout: 1,
    address: from3b,
    scriptPubKey: buildP2PKHScriptHex(from3b),
    satoshis: 570000,
  })
  .to(to3, 1060000)
  .sign(keys3[0])
  .sign(keys3[1]);
// Case 4
const from4 = convertYToM('yM6wgsJ2vJ6Z5miuxovDjZgGBe25fA3j2S');
const to4 = convertYToM('yifD5iTJSxiCFg7NfGwsmnq2EZAKxCbHcc');
const key4 = 'cPwWtDztEgRCMCU8pMQp4HgphvyadrAsYBrCjXUZuDSmnZkyoyNF';
const tx4 = new bitcore.Transaction()
  .from({
    txId: 'f50e13cecda9a438ebd7df213a2899e42b2461a18d4630ee773d26b4f2688bdc',
    vout: 1,
    address: from4,
    scriptPubKey: buildP2PKHScriptHex(from4),
    amount: 0.01,
  })
  .to(to4, 990000)
  .sign(key4);

// P2SH cases
const pk1 = new bitcore.PrivateKey(undefined, 'livenet');
const pk2 = new bitcore.PrivateKey(undefined, 'livenet');
const pk3 = new bitcore.PrivateKey(undefined, 'livenet');
const pubKeys = [pk1.publicKey, pk2.publicKey, pk3.publicKey];
const redeemScript = Script.buildMultisigOut(pubKeys, 2);
const addr5 = bitcore.Address.createMultisig(pubKeys, 2, 'livenet');

const tx5 = new bitcore.Transaction()
  .from(
    {
      txId: '073281b2cc94e879aaf30ea2e92947d9827b270015849d3a5b96a89ee15bfa66',
      vout: 0,
      script: redeemScript,
      satoshis: 328512,
    },
    pubKeys,
    2
  )
  .to(addr5.toString(), 320299)
  .sign(pk1)
  .sign(pk2);

const tx6 = new bitcore.Transaction()
  .from(
    {
      txId: 'afbf98ca4a43db8915d75184b5204fbe71d916482adfe85cb0ed3635764fc220',
      vout: 0,
      script: redeemScript,
      satoshis: 318512,
    },
    pubKeys,
    2
  )
  .from(
    {
      txId: 'dc2e197ab72f71912c39bc23a42d823a3aa8d469fe65eb591c086e60d14c64a0',
      vout: 0,
      script: redeemScript,
      satoshis: 300299,
    },
    pubKeys,
    2
  )
  .to(addr5.toString(), 150000)
  .to(addr5.toString(), 160000)
  .change(addr5.toString())
  .sign(pk1)
  .sign(pk2);

console.log('P2SH address:', addr5.toString());
console.log('Case 1:', tx1.isFullySigned());
console.log('Case 2:', tx2.isFullySigned());
console.log('Case 3:', tx3.isFullySigned());
console.log('Case 4:', tx4.isFullySigned());
console.log('Case 5:', tx5.isFullySigned());
console.log('Case 6:', tx6.isFullySigned());

const cases = [
  [
    'version',
    3,
    'from',
    [
      {
        address: from1,
        txId: 'a477af6b2667c29670467e4e0728b685ee07b240235771862318e29ddbe58458',
        outputIndex: 0,
        script: buildScript(from1),
        satoshis: 1020000,
      },
    ],
    'to',
    [to1, 1010000],
    'sign',
    [key1],
    'serialize',
    tx1.uncheckedSerialize(),
  ],
  [
    'version',
    3,
    'from',
    [
      {
        txid: 'e42447187db5a29d6db161661e4bc66d61c3e499690fe5ea47f87b79ca573986',
        vout: 1,
        address: from2,
        scriptPubKey: buildP2PKHScriptHex(from2),
        amount: 0.0108,
      },
    ],
    'to',
    [to2a, 500000],
    'to',
    [to2b, 570000],
    'sign',
    [key2],
    'serialize',
    tx2.uncheckedSerialize(),
  ],
  [
    'version',
    3,
    'from',
    [
      [
        {
          txid: 'a9db84566e0fc9351e86337d2828ab281b25ddc06fab798f6d4b5baef48c02b3',
          vout: 0,
          address: from3a,
          account: '',
          scriptPubKey: buildP2PKHScriptHex(from3a),
          satoshis: 500000,
        },
      ],
      [
        {
          txid: 'a9db84566e0fc9351e86337d2828ab281b25ddc06fab798f6d4b5baef48c02b3',
          vout: 1,
          address: from3b,
          account: '',
          scriptPubKey: buildP2PKHScriptHex(from3b),
          satoshis: 570000,
        },
      ],
    ],
    'to',
    [to3, 1060000],
    'sign',
    [keys3],
    'serialize',
    tx3.uncheckedSerialize(),
  ],
  [
    'version',
    3,
    'from',
    [
      {
        address: from4,
        txid: 'f50e13cecda9a438ebd7df213a2899e42b2461a18d4630ee773d26b4f2688bdc',
        vout: 1,
        scriptPubKey: buildP2PKHScriptHex(from4),
        amount: 0.01,
      },
    ],
    'to',
    [to4, 990000],
    'sign',
    [key4],
    'serialize',
    tx4.uncheckedSerialize(),
  ],
  [
    'version',
    3,
    'from',
    [
      {
        address: addr5.toString(),
        txid: '073281b2cc94e879aaf30ea2e92947d9827b270015849d3a5b96a89ee15bfa66',
        vout: 0,
        ts: 1418877950,
        script: redeemScript.toHex(),
        satoshis: 328512,
      },
      [pubKeys.map((pk) => pk.toString()), 2],
    ],
    'to',
    [addr5.toString(), 320299],
    'sign',
    [[pk1.toWIF(), pk2.toWIF()]],
    'serialize',
    tx5.uncheckedSerialize(),
  ],
  [
    'version',
    3,
    'from',
    [
      [
        [
          {
            address: addr5.toString(),
            txid: 'afbf98ca4a43db8915d75184b5204fbe71d916482adfe85cb0ed3635764fc220',
            vout: 0,
            ts: 1418878108,
            script: redeemScript.toHex(),
            satoshis: 318512,
          },
          [pubKeys.map((pk) => pk.toString()), 2],
        ],
        [
          [
            {
              address: addr5.toString(),
              txid: 'dc2e197ab72f71912c39bc23a42d823a3aa8d469fe65eb591c086e60d14c64a0',
              vout: 0,
              ts: 1418878014,
              script: redeemScript.toHex(),
              satoshis: 300299,
            },
            [pubKeys.map((pk) => pk.toString()), 2],
          ],
        ],
      ],
      'to',
      'to',
      [addr5.toString(), 150000],
      'to2',
      [addr5.toString(), 160000],
      [addr5.toString()],
      'sign',
      [pk1.toWIF(), pk2.toWIF()],
      'serialize',
      tx6.uncheckedSerialize(),
    ],
  ],
];

fs.writeFileSync('test/data/tx_creation.json', JSON.stringify(cases, null, 2));
console.log('Updated tx_creation.json');
