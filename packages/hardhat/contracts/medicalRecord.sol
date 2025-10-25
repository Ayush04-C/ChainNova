// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./patientRecord.sol";
import "./AccessControlManager.sol";

contract MedicalRecord is PatientRegistry, AccessControlManager {
    struct Record {
        uint256 timestamp;
        address uploadedBy;
        string ipfsHash;
    }

    mapping(address => Record[]) private patientRecords;
    PatientRegistry private registry;
    uint256 public addRecordFee = 0.003 ether;

    event RecordAdded(address indexed patient, address indexed uploader, string ipfsHash, uint256 timestamp);
    event AddRecordFeeUpdated(uint256 newFee);

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

    function addRecord(address _patient, string memory _ipfsHash) external payable onlyRegisteredPatient(_patient) {
        require(msg.value >= addRecordFee, "Insufficient fee for adding record");

        Record memory newRecord = Record(block.timestamp, msg.sender, _ipfsHash);
        patientRecords[_patient].push(newRecord);

        emit RecordAdded(_patient, msg.sender, _ipfsHash, block.timestamp);
    }

    function getRecords(address _patient) external view returns (Record[] memory) {
        require(registry.isRegistered(_patient), "Patient not registered");
        require(msg.sender == _patient || hasAccess(_patient, msg.sender), "No access to records");
        return patientRecords[_patient];
    }

    function setAddRecordFee(uint256 _newFee) external onlyOwner {
        addRecordFee = _newFee;
        emit AddRecordFeeUpdated(_newFee);
    }
}
