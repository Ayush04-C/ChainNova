// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PatientRegistry {
    struct Patient {
        string name;
        string ipfsHash; 
        address wallet;
        bool exists;
    }

    mapping(address => Patient) public patients;

    event PatientRegistered(address indexed patient, string name);
    event PatientUpdated(address indexed patient, string ipfsHash);

    modifier onlyPatient(address _patient) {
        require(msg.sender == _patient, "Not authorized");
        _;
    }

    function registerPatient(string memory _name, string memory _ipfsHash) external {
        require(!patients[msg.sender].exists, "Already registered");
        patients[msg.sender] = Patient(_name, _ipfsHash, msg.sender, true);
        emit PatientRegistered(msg.sender, _name);
    }

    function updatePatientData(string memory _ipfsHash) external onlyPatient(msg.sender) {
        patients[msg.sender].ipfsHash = _ipfsHash;
        emit PatientUpdated(msg.sender, _ipfsHash);
    }

    function isRegistered(address _patient) external view returns (bool) {
        return patients[_patient].exists;
    }
}
