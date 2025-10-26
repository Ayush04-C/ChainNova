# ChainNova System Architecture - Role Separation Guide

## 🏗️ Systematic Role Structure

### The Problem You Encountered

You used the **same wallet** for:

- ✅ Deploying contracts (Owner role)
- ❌ Registering as a patient (Patient role)
- ❌ Updating patient data (Patient role)

**Result:** You paid 0.015 ETH in fees, but when you tried to withdraw, you were essentially moving money from yourself to yourself, which doesn't demonstrate the system properly.

---

## ✅ Correct System Architecture

### Role 1: Contract Owner (Administrator)

**Wallet:** The deployer address (whoever ran `yarn deploy`)

**Responsibilities:**

- Deploy the smart contracts
- Withdraw accumulated fees from the contract
- Manage system settings (update fees if needed)
- Access the Admin Dashboard at `/admin`

**Should NOT:**

- Register as a patient
- Update patient records
- Use patient-facing features

---

### Role 2: Patient Users

**Wallet:** Any OTHER wallet address (not the owner)

**Responsibilities:**

- Register as a patient (pays 0.01 ETH)
- Update their medical records (pays 0.005 ETH)
- View their own medical records
- Grant/revoke doctor access

**Should NOT:**

- Try to access admin dashboard
- Attempt to withdraw funds

---

## 🔄 Proper Workflow Example

### Setup Phase (One-Time)

1. **Deploy contracts** using your main wallet (this becomes the Owner)
   ```bash
   cd packages/hardhat
   yarn deploy --network localhost
   ```
   - This wallet is now the **Owner**
   - Note this address - it controls withdrawals

### Testing Phase

#### Step 1: Switch to a Different Wallet

- In MetaMask, create a new account OR import a different wallet
- Or use a second browser with a different wallet
- This simulates a real patient

#### Step 2: Register a Patient

- Connect with the **patient wallet** (not owner)
- Go to `/register-patient`
- Fill in details and pay 0.01 ETH
- ✅ Contract balance: 0.01 ETH

#### Step 3: Update Patient Record

- Still using **patient wallet**
- Go to `/update-patient`
- Update IPFS hash and pay 0.005 ETH
- ✅ Contract balance: 0.015 ETH

#### Step 4: Register More Patients

- Switch to another wallet
- Repeat registration
- ✅ Contract balance grows with each registration

#### Step 5: Withdraw Funds (Owner Only)

- Switch back to **owner wallet** (the deployer)
- Go to `/admin`
- See accumulated balance (e.g., 0.025 ETH from 2 registrations + 1 update)
- Click "Withdraw All Funds"
- ✅ All ETH transferred to owner wallet
- ✅ Contract balance: 0 ETH

---

## 🎯 Current Situation Fix

### What Happened

You registered and updated using the **owner wallet**, so:

- You paid: 0.01 + 0.005 = 0.015 ETH (gas + fees)
- Contract received: 0.015 ETH
- When you withdraw: 0.015 ETH goes back to you
- Net result: You only lost gas fees

### What You Should Do Now

**Option 1: Test with Different Wallet (Recommended)**

1. Keep your current owner wallet as-is
2. Switch to MetaMask Account 2 or 3
3. Register as a patient with the new wallet
4. Update records with the new wallet
5. Switch back to owner wallet
6. Check admin dashboard - you'll see the fees
7. Withdraw to demonstrate the system

**Option 2: Redeploy (Clean Slate)**

1. Stop the hardhat node
2. Delete `deployments/localhost` folder
3. Restart hardhat: `yarn chain`
4. Redeploy: `yarn deploy --network localhost`
5. Use a DIFFERENT wallet for patient operations

---

## 📊 Visual Flow

```
Owner Wallet (0xABC...123)
    │
    ├─ Deploys Contracts
    ├─ Controls Admin Dashboard
    └─ Withdraws Accumulated Fees
         ↑
         │ (Collects fees)
         │
    Contract (0x0165...8F)
         ↑
         │ (Sends fees)
         │
Patient Wallet 1 (0xDEF...456) ──→ Registers (0.01 ETH)
Patient Wallet 2 (0xGHI...789) ──→ Registers (0.01 ETH)
Patient Wallet 1 (0xDEF...456) ──→ Updates (0.005 ETH)
                                    Total: 0.025 ETH
```

---

## 🛠️ How to Create Test Wallets in MetaMask

### Method 1: Create New Accounts

1. Open MetaMask
2. Click the account icon (top right)
3. Click "Create Account"
4. Name it "Test Patient 1"
5. Repeat for more test patients

### Method 2: Import with Private Key

1. Export private key from Hardhat test accounts:
   ```bash
   yarn hardhat node
   ```
   - Copy one of the private keys shown
2. In MetaMask:
   - Click account icon → "Import Account"
   - Paste private key
   - These accounts have test ETH

---

## ⚠️ Important Warnings

### Warning System Added

When you connect with the **owner wallet** and try to register as a patient, you'll now see:

```
⚠️ You are the Contract Owner

As the owner, you should manage the system, not register as a patient.
Use a different wallet address for testing patient registration.
This keeps the system more systematic with clear role separation.
```

---

## 🎓 Best Practices

### For Development/Testing

✅ Use owner wallet only for deployment and admin functions
✅ Use separate test wallets for patient operations
✅ Document which wallet is the owner
✅ Keep private keys secure

### For Production

✅ Owner wallet should be a cold wallet or multisig
✅ Never use owner wallet for regular operations
✅ Implement proper access control
✅ Consider transferring ownership if needed

---

## 🔐 Security Considerations

1. **Owner Wallet Protection**

   - This wallet controls ALL funds
   - Store private key securely
   - Use hardware wallet in production
   - Consider multisig for shared ownership

2. **Clear Separation of Concerns**

   - Owner = System administrator
   - Patients = End users
   - Never mix roles

3. **Audit Trail**
   - All transactions are on-chain
   - Easy to track who paid what
   - Owner withdrawals are transparent

---

## 📝 Summary

### Current State

- ✅ Admin dashboard created at `/admin`
- ✅ Owner verification implemented
- ✅ Warning added for owner trying to register
- ✅ Withdrawal function working

### Next Steps

1. Use a different wallet for patient testing
2. Register multiple patients
3. Test the withdrawal function properly
4. See the systematic flow in action

### Key Takeaway

**One wallet = One role.** Don't use the owner wallet for patient operations. This keeps your system clean, systematic, and easy to understand.

---

## 🆘 Quick Reference

| Action               | Who Can Do It          | Where               |
| -------------------- | ---------------------- | ------------------- |
| Deploy Contracts     | Owner                  | Hardhat CLI         |
| Register as Patient  | Any wallet (not owner) | `/register-patient` |
| Update Patient Data  | Registered patients    | `/update-patient`   |
| View Medical Records | Registered patients    | `/medical-records`  |
| Withdraw Fees        | Owner only             | `/admin`            |
| View Contract Stats  | Owner only             | `/admin`            |

---

## Need Help?

If you see "0 ETH" in the admin dashboard but you know patients have registered:

1. Check if you used the owner wallet to register (this creates the circular flow issue)
2. Use `yarn hardhat node --trace` to see transaction details
3. Check the owner address matches your connected wallet

Your system is working correctly - it just needs proper role separation! 🎉
