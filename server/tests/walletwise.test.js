const test = require('node:test');
const assert = require('node:assert');
const path = require('path');
const db = require('../src/config/db');
const walletService = require('../src/services/walletService');
const bcrypt = require('bcryptjs');

test('WalletWise Academic DBMS Comprehensive Test Suite', async (t) => {
  // Ensure DB initialized
  await db.initDatabase();

  await t.test('TC-01: Successful Authentication and Bcrypt Hash Verification', async () => {
    const user = await db.get('SELECT * FROM users WHERE email = ?', ['megasree@email.com']);
    assert.ok(user, 'User must exist in database');
    const isMatch = bcrypt.compareSync('password123', user.password_hash);
    assert.strictEqual(isMatch, true, 'Bcrypt password comparison must evaluate to true');
  });

  await t.test('TC-02: Duplicate Email Rejection via UNIQUE Constraint', async () => {
    const rawDb = db.getRawSqlite();
    assert.throws(() => {
      rawDb.prepare(`
        INSERT INTO users (full_name, email, password_hash, role)
        VALUES ('Clone User', 'megasree@email.com', 'hash', 'USER')
      `).run();
    }, /UNIQUE constraint failed/, 'Database must reject duplicate email at schema level');
  });

  await t.test('TC-03: Add Demo Money with Balanced CREDIT Ledger Entry', async () => {
    const initialWallet = await db.get('SELECT balance FROM wallets WHERE user_id = 2');
    const initialBal = parseFloat(initialWallet.balance);
    const depositAmount = 500.00;

    const res = await walletService.addMoney(2, depositAmount, 'Automated unit test deposit');
    assert.strictEqual(res.status, 'SUCCESS');
    assert.strictEqual(res.amount, depositAmount);
    assert.strictEqual(res.newBalance, parseFloat((initialBal + depositAmount).toFixed(2)));

    // Verify double-entry ledger record
    const entry = await db.get('SELECT * FROM transaction_entries WHERE transaction_id = ?', [res.transactionId]);
    assert.ok(entry, 'CREDIT entry must be present in transaction_entries');
    assert.strictEqual(entry.entry_type, 'CREDIT');
    assert.strictEqual(parseFloat(entry.amount), depositAmount);
  });

  await t.test('TC-04: Peer-to-Peer Transfer with Atomic Debit and Credit', async () => {
    const senderBefore = await db.get('SELECT balance FROM wallets WHERE user_id = 2');
    const recBefore = await db.get('SELECT balance FROM wallets WHERE user_id = 3');
    const transferAmount = 200.00;

    const res = await walletService.transferFunds(2, 'arun@email.com', transferAmount, 'Automated test peer transfer');
    assert.strictEqual(res.status, 'SUCCESS');

    const senderAfter = await db.get('SELECT balance FROM wallets WHERE user_id = 2');
    const recAfter = await db.get('SELECT balance FROM wallets WHERE user_id = 3');

    assert.strictEqual(
      parseFloat(senderAfter.balance),
      parseFloat((parseFloat(senderBefore.balance) - transferAmount).toFixed(2)),
      'Sender balance must be exactly decremented by transfer amount'
    );
    assert.strictEqual(
      parseFloat(recAfter.balance),
      parseFloat((parseFloat(recBefore.balance) + transferAmount).toFixed(2)),
      'Recipient balance must be exactly incremented by transfer amount'
    );

    // Verify double-entry ledger has both DEBIT and CREDIT
    const entries = await db.all('SELECT * FROM transaction_entries WHERE transaction_id = ? ORDER BY entry_type DESC', [res.transactionId]);
    assert.strictEqual(entries.length, 2, 'Transfer must produce exactly two ledger entries');
    assert.strictEqual(entries[0].entry_type, 'DEBIT');
    assert.strictEqual(entries[1].entry_type, 'CREDIT');
  });

  await t.test('TC-05: Insufficient Balance Rejection and Rollback', async () => {
    const sender = await db.get('SELECT balance FROM wallets WHERE user_id = 2');
    const excessiveAmount = parseFloat(sender.balance) + 10000.00;

    await assert.rejects(async () => {
      await walletService.transferFunds(2, 'arun@email.com', excessiveAmount, 'Excessive transfer');
    }, /Insufficient funds/, 'Transfer exceeding balance must reject cleanly without balance change');

    const senderAfter = await db.get('SELECT balance FROM wallets WHERE user_id = 2');
    assert.strictEqual(parseFloat(senderAfter.balance), parseFloat(sender.balance), 'Sender balance must remain unchanged on rollback');
  });

  await t.test('TC-06: Self-Transfer Rejection', async () => {
    await assert.rejects(async () => {
      await walletService.transferFunds(2, 'megasree@email.com', 50.00, 'Self transfer attempt');
    }, /Self-transfer is not permitted/, 'Self-transfers must be rejected');
  });

  await t.test('TC-07: Negative and Zero Amount Rejection', async () => {
    await assert.rejects(async () => {
      await walletService.addMoney(2, -100.00, 'Negative deposit');
    }, /valid positive amount/, 'Negative amounts must be rejected');

    await assert.rejects(async () => {
      await walletService.transferFunds(2, 'arun@email.com', 0, 'Zero transfer');
    }, /valid transfer amount/, 'Zero amounts must be rejected');
  });

  await t.test('TC-08: Utility Bill Payment Settlement and Ledger Posting', async () => {
    const userWalletBefore = await db.get('SELECT balance FROM wallets WHERE user_id = 2');
    const billAmount = 350.00;

    const res = await walletService.payBill(
      2,
      'Electricity',
      'Tamil Nadu Electricity Board (TNEB)',
      'EB-CONSUMER-TEST-99',
      billAmount,
      'Automated test bill payment'
    );

    assert.strictEqual(res.status, 'SUCCESS');
    assert.strictEqual(res.amount, billAmount);

    const billRecord = await db.get('SELECT * FROM bill_payments WHERE bill_payment_id = ?', [res.billPaymentId]);
    assert.ok(billRecord, 'Bill payment record must exist in database');
    assert.strictEqual(billRecord.customer_reference, 'EB-CONSUMER-TEST-99');
    assert.strictEqual(parseFloat(billRecord.amount), billAmount);
  });

  await t.test('TC-09: SQL Injection Parameterization Defense', async () => {
    const maliciousInput = "admin@walletwise.com' OR '1'='1";
    const user = await db.get('SELECT * FROM users WHERE email = ?', [maliciousInput]);
    assert.strictEqual(user, undefined, 'Parameterized query must treat malicious input as literal string and return undefined');
  });

  await t.test('TC-10: Audit Log Creation for Sensitive Actions', async () => {
    const recentAudit = await db.get('SELECT * FROM audit_logs ORDER BY log_id DESC LIMIT 1');
    assert.ok(recentAudit, 'Audit log entries must be created');
    assert.ok(recentAudit.action, 'Audit action must be populated');
  });
});
