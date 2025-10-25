// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./patientRecord.sol";

contract MedicalRecord is PatientRegistry {
    struct Record {
        string ipfsHash;   // encrypted file hash stored on IPFS
        uint256 timestamp;
        address uploadedBy;
    }

    mapping(address => Record[]) private patientRecords;
    PatientRegistry private registry;

    event RecordAdded(address indexed patient, address indexed uploader, string ipfsHash, uint256 timestamp);

    constructor(address _registry) {
        registry = PatientRegistry(_registry);
    }

    modifier onlyRegisteredPatient(address _patient) {
        require(registry.isRegistered(_patient), "Patient not registered");
        _;
    }

    function addRecord(address _patient, string memory _ipfsHash)
        external
        onlyRegisteredPatient(_patient)
    {
        Record memory newRecord = Record(_ipfsHash, block.timestamp, msg.sender);
        patientRecords[_patient].push(newRecord);
        emit RecordAdded(_patient, msg.sender, _ipfsHash, block.timestamp);
    }

    function getRecords(address _patient) external view returns (Record[] memory) {
        return patientRecords[_patient];
    }
}
