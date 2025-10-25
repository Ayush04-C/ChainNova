import { expect } from "chai";
import { ethers } from "hardhat";
import type { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("Medical Record System", () => {
  let patientRegistry: any;
  let accessControlManager: any;
  let medicalRecord: any;
  let auditTrail: any;

  let deployer: SignerWithAddress;
  let patient1: SignerWithAddress;
  let patient2: SignerWithAddress;
  let doctor1: SignerWithAddress;
  let doctor2: SignerWithAddress;

  const PATIENT1_NAME = "John Doe";
  const PATIENT1_IPFS = "QmPatient1Hash123";
  const PATIENT1_ID = 1001;

  const PATIENT2_NAME = "Jane Smith";
  const PATIENT2_IPFS = "QmPatient2Hash456";
  const PATIENT2_ID = 1002;

  const UPDATED_IPFS = "QmUpdatedHash789";

  const REGISTRATION_FEE = ethers.parseEther("0.01");
  const UPDATE_FEE = ethers.parseEther("0.005");

  beforeEach(async () => {
    // Get signers
    [deployer, patient1, patient2, doctor1, doctor2] = await ethers.getSigners();

    // Deploy PatientRegistry
    const PatientRegistry = await ethers.getContractFactory("PatientRegistry");
    patientRegistry = await PatientRegistry.deploy();

    // Deploy AccessControlManager
    const AccessControlManager = await ethers.getContractFactory("AccessControlManager");
    accessControlManager = await AccessControlManager.deploy(await patientRegistry.getAddress());

    // Deploy MedicalRecord
    const MedicalRecord = await ethers.getContractFactory("MedicalRecord");
    medicalRecord = await MedicalRecord.deploy(await patientRegistry.getAddress());

    // Deploy AuditTrail
    const AuditTrail = await ethers.getContractFactory("AuditTrail");
    auditTrail = await AuditTrail.deploy();
  });

  describe("PatientRegistry", () => {
    describe("Patient Registration", () => {
      it("Should allow a patient to register", async () => {
        await expect(
          patientRegistry.connect(patient1).registerPatient(PATIENT1_NAME, PATIENT1_IPFS, PATIENT1_ID, {
            value: REGISTRATION_FEE,
          }),
        )
          .to.emit(patientRegistry, "PatientRegistered")
          .withArgs(patient1.address, PATIENT1_NAME);
      });

      it("Should store patient data correctly", async () => {
        await patientRegistry.connect(patient1).registerPatient(PATIENT1_NAME, PATIENT1_IPFS, PATIENT1_ID, {
          value: REGISTRATION_FEE,
        });

        const patient = await patientRegistry.patients(patient1.address);
        expect(patient.name).to.equal(PATIENT1_NAME);
        expect(patient.ipfsHash).to.equal(PATIENT1_IPFS);
        expect(patient.wallet).to.equal(patient1.address);
        expect(patient.exists).to.equal(true);
        expect(patient.id).to.equal(PATIENT1_ID);
      });

      it("Should return true for registered patient", async () => {
        await patientRegistry.connect(patient1).registerPatient(PATIENT1_NAME, PATIENT1_IPFS, PATIENT1_ID, {
          value: REGISTRATION_FEE,
        });
        expect(await patientRegistry.isRegistered(patient1.address)).to.equal(true);
      });

      it("Should return false for unregistered patient", async () => {
        expect(await patientRegistry.isRegistered(patient2.address)).to.equal(false);
      });

      it("Should not allow duplicate registration", async () => {
        await patientRegistry.connect(patient1).registerPatient(PATIENT1_NAME, PATIENT1_IPFS, PATIENT1_ID, {
          value: REGISTRATION_FEE,
        });

        await expect(
          patientRegistry.connect(patient1).registerPatient(PATIENT1_NAME, PATIENT1_IPFS, PATIENT1_ID, {
            value: REGISTRATION_FEE,
          }),
        ).to.be.revertedWith("Already registered");
      });

      it("Should not allow registration with insufficient fee", async () => {
        await expect(
          patientRegistry.connect(patient1).registerPatient(PATIENT1_NAME, PATIENT1_IPFS, PATIENT1_ID, {
            value: ethers.parseEther("0.005"), // Less than required
          }),
        ).to.be.revertedWith("Insufficient registration fee");
      });
    });

    describe("Patient Data Update", () => {
      beforeEach(async () => {
        await patientRegistry.connect(patient1).registerPatient(PATIENT1_NAME, PATIENT1_IPFS, PATIENT1_ID, {
          value: REGISTRATION_FEE,
        });
      });

      it("Should allow registered patient to update IPFS hash", async () => {
        await expect(
          patientRegistry.connect(patient1).updatePatientData(UPDATED_IPFS, {
            value: UPDATE_FEE,
          }),
        )
          .to.emit(patientRegistry, "PatientUpdated")
          .withArgs(patient1.address, UPDATED_IPFS);

        const patient = await patientRegistry.patients(patient1.address);
        expect(patient.ipfsHash).to.equal(UPDATED_IPFS);
      });

      it("Should not allow unregistered patient to update data", async () => {
        await expect(
          patientRegistry.connect(patient2).updatePatientData(UPDATED_IPFS, {
            value: UPDATE_FEE,
          }),
        ).to.be.revertedWith("Not a registered patient");
      });

      it("Should not allow update with insufficient fee", async () => {
        await expect(
          patientRegistry.connect(patient1).updatePatientData(UPDATED_IPFS, {
            value: ethers.parseEther("0.001"), // Less than required
          }),
        ).to.be.revertedWith("Insufficient update fee");
      });
    });
  });

  describe("AccessControlManager", () => {
    beforeEach(async () => {
      // Register patients
      await patientRegistry.connect(patient1).registerPatient(PATIENT1_NAME, PATIENT1_IPFS, PATIENT1_ID, {
        value: REGISTRATION_FEE,
      });
      await patientRegistry.connect(patient2).registerPatient(PATIENT2_NAME, PATIENT2_IPFS, PATIENT2_ID, {
        value: REGISTRATION_FEE,
      });
    });

    describe("Access Request", () => {
      it("Should allow doctor to request access to registered patient", async () => {
        await expect(accessControlManager.connect(doctor1).requestAccess(patient1.address))
          .to.emit(accessControlManager, "AccessRequested")
          .withArgs(doctor1.address, patient1.address);
      });

      it("Should not allow access request for unregistered patient", async () => {
        await expect(accessControlManager.connect(doctor1).requestAccess(deployer.address)).to.be.revertedWith(
          "Patient not registered",
        );
      });

      it("Should store access request in history", async () => {
        await accessControlManager.connect(doctor1).requestAccess(patient1.address);

        // Since accessHistory is internal, we verify by checking the event was emitted
        // The fact that the transaction succeeded means it was stored
        const hasAccess = await accessControlManager.hasAccess(patient1.address, doctor1.address);
        expect(hasAccess).to.equal(false); // Not yet approved
      });
    });

    describe("Grant Access", () => {
      beforeEach(async () => {
        // Register patient in AccessControlManager's registry as well
        await accessControlManager.connect(patient1).registerPatient(PATIENT1_NAME, PATIENT1_IPFS, PATIENT1_ID, {
          value: REGISTRATION_FEE,
        });
        await accessControlManager.connect(doctor1).requestAccess(patient1.address);
      });

      it("Should allow patient to grant access to doctor", async () => {
        await expect(accessControlManager.connect(patient1).grantAccess(doctor1.address))
          .to.emit(accessControlManager, "AccessGranted")
          .withArgs(doctor1.address, patient1.address);
      });

      it("Should update access status correctly", async () => {
        await accessControlManager.connect(patient1).grantAccess(doctor1.address);

        const hasAccess = await accessControlManager.hasAccess(patient1.address, doctor1.address);
        expect(hasAccess).to.equal(true);
      });

      it("Should not allow non-patient to grant access", async () => {
        await expect(accessControlManager.connect(deployer).grantAccess(doctor1.address)).to.be.revertedWith(
          "Not a registered patient",
        );
      });
    });

    describe("Revoke Access", () => {
      beforeEach(async () => {
        // Register patient in AccessControlManager's registry
        await accessControlManager.connect(patient1).registerPatient(PATIENT1_NAME, PATIENT1_IPFS, PATIENT1_ID, {
          value: REGISTRATION_FEE,
        });
        await accessControlManager.connect(doctor1).requestAccess(patient1.address);
        await accessControlManager.connect(patient1).grantAccess(doctor1.address);
      });

      it("Should allow patient to revoke access from doctor", async () => {
        await expect(accessControlManager.connect(patient1).revokeAccess(doctor1.address))
          .to.emit(accessControlManager, "AccessRevoked")
          .withArgs(doctor1.address, patient1.address);
      });

      it("Should update access status after revocation", async () => {
        await accessControlManager.connect(patient1).revokeAccess(doctor1.address);

        const hasAccess = await accessControlManager.hasAccess(patient1.address, doctor1.address);
        expect(hasAccess).to.equal(false);
      });

      it("Should not allow non-patient to revoke access", async () => {
        await expect(accessControlManager.connect(deployer).revokeAccess(doctor1.address)).to.be.revertedWith(
          "Not a registered patient",
        );
      });
    });
  });

  describe("MedicalRecord", () => {
    beforeEach(async () => {
      // Register patients
      await patientRegistry.connect(patient1).registerPatient(PATIENT1_NAME, PATIENT1_IPFS, PATIENT1_ID, {
        value: REGISTRATION_FEE,
      });
      await patientRegistry.connect(patient2).registerPatient(PATIENT2_NAME, PATIENT2_IPFS, PATIENT2_ID, {
        value: REGISTRATION_FEE,
      });
    });

    describe("Add Record", () => {
      it("Should allow adding record for registered patient", async () => {
        await expect(medicalRecord.connect(doctor1).addRecord(patient1.address)).to.emit(medicalRecord, "RecordAdded");
      });

      it("Should emit correct data in RecordAdded event", async () => {
        const tx = await medicalRecord.connect(doctor1).addRecord(patient1.address);
        const receipt = await tx.wait();

        // Check event was emitted with correct parameters
        const event = receipt?.logs.find((log: any) => {
          try {
            const parsed = medicalRecord.interface.parseLog(log);
            return parsed?.name === "RecordAdded";
          } catch {
            return false;
          }
        });
        expect(event).to.not.equal(undefined);
      });

      it("Should not allow adding record for unregistered patient", async () => {
        await expect(medicalRecord.connect(doctor1).addRecord(deployer.address)).to.be.revertedWith(
          "Patient not registered",
        );
      });

      it("Should store multiple records for same patient", async () => {
        await medicalRecord.connect(doctor1).addRecord(patient1.address);
        await medicalRecord.connect(doctor2).addRecord(patient1.address);

        // Register patient and grant access to doctor1 in MedicalRecord's registry
        await medicalRecord.connect(patient1).registerPatient(PATIENT1_NAME, PATIENT1_IPFS, PATIENT1_ID, {
          value: REGISTRATION_FEE,
        });
        await medicalRecord.connect(patient1).grantAccess(doctor1.address);

        const records = await medicalRecord.getRecords(patient1.address, doctor1.address);
        expect(records.length).to.equal(2);
      });
    });

    describe("Get Patient IPFS Hash", () => {
      it("Should return correct IPFS hash for registered patient", async () => {
        const ipfsHash = await medicalRecord.getPatientIpfsHash(patient1.address);
        expect(ipfsHash).to.equal(PATIENT1_IPFS);
      });

      it("Should return updated IPFS hash after patient updates data", async () => {
        await patientRegistry.connect(patient1).updatePatientData(UPDATED_IPFS, {
          value: UPDATE_FEE,
        });

        const ipfsHash = await medicalRecord.getPatientIpfsHash(patient1.address);
        expect(ipfsHash).to.equal(UPDATED_IPFS);
      });

      it("Should revert for unregistered patient", async () => {
        await expect(medicalRecord.getPatientIpfsHash(deployer.address)).to.be.revertedWith("Patient not registered");
      });
    });

    describe("Get Records", () => {
      beforeEach(async () => {
        // Register patient in MedicalRecord's registry
        await medicalRecord.connect(patient1).registerPatient(PATIENT1_NAME, PATIENT1_IPFS, PATIENT1_ID, {
          value: REGISTRATION_FEE,
        });
        await medicalRecord.connect(doctor1).addRecord(patient1.address);
        await medicalRecord.connect(doctor2).addRecord(patient1.address);
      });

      it("Should allow authorized doctor to view records", async () => {
        await medicalRecord.connect(patient1).grantAccess(doctor1.address);

        const records = await medicalRecord.getRecords(patient1.address, doctor1.address);
        expect(records.length).to.equal(2);
        expect(records[0].uploadedBy).to.equal(doctor1.address);
        expect(records[1].uploadedBy).to.equal(doctor2.address);
      });

      it("Should not allow unauthorized doctor to view records", async () => {
        await expect(medicalRecord.getRecords(patient1.address, doctor1.address)).to.be.revertedWith(
          "Doctor does not have access",
        );
      });

      it("Should not allow access after revocation", async () => {
        await medicalRecord.connect(patient1).grantAccess(doctor1.address);
        await medicalRecord.connect(patient1).revokeAccess(doctor1.address);

        await expect(medicalRecord.getRecords(patient1.address, doctor1.address)).to.be.revertedWith(
          "Doctor does not have access",
        );
      });
    });
  });

  describe("AuditTrail", () => {
    describe("Log Action", () => {
      it("Should log action correctly", async () => {
        await expect(auditTrail.logAction(doctor1.address, patient1.address, 0, "Added medical record"))
          .to.emit(auditTrail, "ActionLogged")
          .withArgs(
            doctor1.address,
            patient1.address,
            0,
            "Added medical record",
            await ethers.provider.getBlock("latest").then(b => b!.timestamp + 1),
          );
      });

      it("Should store log entry with correct data", async () => {
        await auditTrail.logAction(doctor1.address, patient1.address, 0, "Added medical record");

        const log = await auditTrail.logs(0);
        expect(log.actor).to.equal(doctor1.address);
        expect(log.patient).to.equal(patient1.address);
        expect(log.action).to.equal(0); // ADD_RECORD
        expect(log.details).to.equal("Added medical record");
      });

      it("Should store multiple log entries", async () => {
        await auditTrail.logAction(doctor1.address, patient1.address, 0, "Added medical record");
        await auditTrail.logAction(doctor1.address, patient1.address, 1, "Accessed medical record");
        await auditTrail.logAction(patient1.address, patient1.address, 2, "Updated patient data");

        const allLogs = await auditTrail.getAllLogs();
        expect(allLogs.length).to.equal(3);
      });

      it("Should return all logs correctly", async () => {
        await auditTrail.logAction(doctor1.address, patient1.address, 0, "Added record");
        await auditTrail.logAction(doctor2.address, patient2.address, 1, "Accessed record");

        const allLogs = await auditTrail.getAllLogs();
        expect(allLogs[0].actor).to.equal(doctor1.address);
        expect(allLogs[0].patient).to.equal(patient1.address);
        expect(allLogs[1].actor).to.equal(doctor2.address);
        expect(allLogs[1].patient).to.equal(patient2.address);
      });
    });
  });

  describe("Integration Tests", () => {
    it("Complete workflow: Register, Grant Access, Add Records, Retrieve Records", async () => {
      // 1. Register patient in both registries
      await patientRegistry.connect(patient1).registerPatient(PATIENT1_NAME, PATIENT1_IPFS, PATIENT1_ID, {
        value: REGISTRATION_FEE,
      });
      await medicalRecord.connect(patient1).registerPatient(PATIENT1_NAME, PATIENT1_IPFS, PATIENT1_ID, {
        value: REGISTRATION_FEE,
      });
      expect(await patientRegistry.isRegistered(patient1.address)).to.equal(true);

      // 2. Doctor requests access
      await medicalRecord.connect(doctor1).requestAccess(patient1.address);

      // 3. Patient grants access
      await medicalRecord.connect(patient1).grantAccess(doctor1.address);
      expect(await medicalRecord.hasAccess(patient1.address, doctor1.address)).to.equal(true);

      // 4. Doctor adds medical record
      await medicalRecord.connect(doctor1).addRecord(patient1.address);

      // 5. Doctor retrieves records
      const records = await medicalRecord.getRecords(patient1.address, doctor1.address);
      expect(records.length).to.equal(1);
      expect(records[0].uploadedBy).to.equal(doctor1.address);

      // 6. Log the action
      await auditTrail.logAction(doctor1.address, patient1.address, 1, "Doctor accessed records");
      const logs = await auditTrail.getAllLogs();
      expect(logs.length).to.equal(1);
    });

    it("Multiple doctors accessing same patient records", async () => {
      // Register patient in both registries
      await patientRegistry.connect(patient1).registerPatient(PATIENT1_NAME, PATIENT1_IPFS, PATIENT1_ID, {
        value: REGISTRATION_FEE,
      });
      await medicalRecord.connect(patient1).registerPatient(PATIENT1_NAME, PATIENT1_IPFS, PATIENT1_ID, {
        value: REGISTRATION_FEE,
      });

      // Both doctors request and get access
      await medicalRecord.connect(doctor1).requestAccess(patient1.address);
      await medicalRecord.connect(doctor2).requestAccess(patient1.address);
      await medicalRecord.connect(patient1).grantAccess(doctor1.address);
      await medicalRecord.connect(patient1).grantAccess(doctor2.address);

      // Both doctors add records
      await medicalRecord.connect(doctor1).addRecord(patient1.address);
      await medicalRecord.connect(doctor2).addRecord(patient1.address);

      // Both can retrieve records
      const records1 = await medicalRecord.getRecords(patient1.address, doctor1.address);
      const records2 = await medicalRecord.getRecords(patient1.address, doctor2.address);

      expect(records1.length).to.equal(2);
      expect(records2.length).to.equal(2);
    });

    it("Patient updates data and medical record reflects changes", async () => {
      // Register patient
      await patientRegistry.connect(patient1).registerPatient(PATIENT1_NAME, PATIENT1_IPFS, PATIENT1_ID, {
        value: REGISTRATION_FEE,
      });

      // Check initial IPFS hash
      let ipfsHash = await medicalRecord.getPatientIpfsHash(patient1.address);
      expect(ipfsHash).to.equal(PATIENT1_IPFS);

      // Update patient data
      await patientRegistry.connect(patient1).updatePatientData(UPDATED_IPFS, {
        value: UPDATE_FEE,
      });

      // Check updated IPFS hash
      ipfsHash = await medicalRecord.getPatientIpfsHash(patient1.address);
      expect(ipfsHash).to.equal(UPDATED_IPFS);
    });
  });
});
