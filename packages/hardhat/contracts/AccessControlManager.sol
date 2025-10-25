// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./PatientRegistry.sol";

contract AccessControlManager {
    struct AccessRequest {
        address doctor;
        address patient;
        bool approved;
        uint256 timestamp;
    }

    mapping(address => mapping(address => bool)) public accessGranted; // patient => doctor => bool
    mapping(address => AccessRequest[]) public accessHistory;

    event AccessRequested(address indexed doctor, address indexed patient);
    event AccessGranted(address indexed doctor, address indexed patient);
    event AccessRevoked(address indexed doctor, address indexed patient);

    PatientRegistry private registry;

    constructor(address _registry) {
        registry = PatientRegistry(_registry);
    }

    modifier onlyPatient(address _patient) {
        require(msg.sender == _patient, "Not authorized");
        _;
    }

    function requestAccess(address _patient) external {
        require(registry.isRegistered(_patient), "Patient not registered");
        accessHistory[_patient].push(AccessRequest(msg.sender, _patient, false, block.timestamp));
        emit AccessRequested(msg.sender, _patient);
    }

    function grantAccess(address _doctor) external onlyPatient(msg.sender) {
        accessGranted[msg.sender][_doctor] = true;
        emit AccessGranted(_doctor, msg.sender);
    }

    function revokeAccess(address _doctor) external onlyPatient(msg.sender) {
        accessGranted[msg.sender][_doctor] = false;
        emit AccessRevoked(_doctor, msg.sender);
    }

    function hasAccess(address _patient, address _doctor) external view returns (bool) {
        return accessGranted[_patient][_doctor];
    }
}