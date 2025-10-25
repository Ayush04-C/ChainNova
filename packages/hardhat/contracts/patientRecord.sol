// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PatientRegistry {
    struct Patient {
        string name;
        string ipfsHash;
        address wallet;
        bool exists;
        uint256 id;
    }

    modifier onlyPatient() {
        require(patients[msg.sender].exists, "Not a registered patient");
        _;
    }

    mapping(address => Patient) public patients;

    event PatientRegistered(address indexed patient, string name);
    event PatientUpdated(address indexed patient, string ipfsHash);

    function registerPatient(string memory _name, string memory _ipfsHash, uint256 _id) external payable {
        require(!patients[msg.sender].exists, "Already registered");
        patients[msg.sender] = Patient(_name, _ipfsHash, msg.sender, true, _id);
        emit PatientRegistered(msg.sender, _name);
    }

    function updatePatientData(string memory _ipfsHash) external onlyPatient payable {
        patients[msg.sender].ipfsHash = _ipfsHash;
        emit PatientUpdated(msg.sender, _ipfsHash);
    }

    function isRegistered(address _patient) external view returns (bool) {
        return patients[_patient].exists;
    }
}
