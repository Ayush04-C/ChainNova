// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./patientRecord.sol";
import "./AccessControlManager.sol";

contract MedicalRecord is PatientRegistry, AccessControlManager {
    struct Record {
        uint256 timestamp;
        address uploadedBy;
    }

    mapping(address => Record[]) private patientRecords;
    PatientRegistry private registry;

    event RecordAdded(address indexed patient, address indexed uploader, string ipfsHash, uint256 timestamp);

    constructor(address _registry) AccessControlManager(_registry) {
        registry = PatientRegistry(_registry);
    }

    modifier onlyRegisteredPatient(address _patient) {
        require(registry.isRegistered(_patient), "Patient not registered");
        _;
    }

    function getPatientIpfsHash(address _patient) external view returns (string memory) {
        require(registry.isRegistered(_patient), "Patient not registered");
        (, string memory ipfsHash, , , ) = registry.patients(_patient);
        return ipfsHash;
    }

    function addRecord(address _patient) external onlyRegisteredPatient(_patient) {
        Record memory newRecord = Record(block.timestamp, msg.sender);
        patientRecords[_patient].push(newRecord);

        // Get the patient's IPFS hash from PatientRegistry
        (, string memory ipfsHash, , , ) = registry.patients(_patient);
        emit RecordAdded(_patient, msg.sender, ipfsHash, block.timestamp);
    }

    function getRecords(address _patient, address _doctor) external view returns (Record[] memory) {
        require(hasAccess(_patient, _doctor), "Doctor does not have access");
        return patientRecords[_patient];
    }
}
