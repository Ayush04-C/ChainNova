 # ChaiNova — Decentralized Medical Record Sharing
 
Theme Fit --  Transparency & Real-world Use

Problem
Medical data today is fragmented, insecure, and siloed across hospitals and healthcare providers. Patients often lack ownership of their own records, and hospitals struggle with interoperability and data authenticity.

Solution
MedLedger is a blockchain-based decentralized application (DApp) designed for secure, consent-driven sharing of medical data.
Patients own and control access to their encrypted health records.
Hospitals and doctors can request access via smart contracts with full transparency and audit trails.
IPFS (InterPlanetary File System) is used to store patient records off-chain efficiently using content hashes, ensuring scalability and cost-effectiveness.

Tech Stack
Solidity — Smart contract development
Hardhat — Testing, deployment, and automation framework
IPFS — Decentralized storage for patient records
Ethereum Blockchain — Ensures data immutability and transparency
Next.js / React — For the DApp frontend interface

How It Works

Patient Registration
A patient registers by providing their name, ID, and IPFS hash of their medical record.
Registration requires a small fee to deploy the transaction on-chain.
Patients can update their data in the future by paying an update fee.

Medical Record Access
Patients can view their encrypted medical data and associated IPFS hash anytime through the DApp.

Owner Dashboard
The contract owner can track total earnings and withdraw funds securely.

Future Scope
We plan to extend ChaiNova by adding:
Doctor access management, where doctors can request access to a patient’s data and the patient can approve or deny the request via smart contract.

Innovation
Combines privacy + interoperability using blockchain and IPFS.
Empowers patients with full data ownership.
Enhances research and emergency response through faster, verified data sharing.

Impact
Saves lives during medical emergencies by making verified data instantly available.
Improves healthcare research with high-quality, tamper-proof datasets.
Builds trust between patients, hospitals, and researchers.


Testing & Deployment
The smart contracts were developed and tested using Hardhat.
To test locally:

# Install dependencies
1. git clone

2. yarn chain

3. yarn deploy

4. yarn start

Preview --

<img width="1919" height="871" alt="image" src="https://github.com/user-attachments/assets/2d6fa43b-e72f-4d86-9d8f-721a100f5945" />

📄 License

This project is licensed under the MIT License — feel free to use and improve it!
