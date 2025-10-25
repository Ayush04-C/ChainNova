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

    uint256 public registrationFee = 0.01 ether;
    uint256 public updateFee = 0.005 ether;
    address public owner;

    modifier onlyPatient() {
        require(patients[msg.sender].exists, "Not a registered patient");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    mapping(address => Patient) public patients;

    event PatientRegistered(address indexed patient, string name);
    event PatientUpdated(address indexed patient, string ipfsHash);
    event FeeUpdated(string feeType, uint256 newFee);

    constructor() {
        owner = msg.sender;
    }

    function registerPatient(string memory _name, string memory _ipfsHash, uint256 _id) external payable {
        require(!patients[msg.sender].exists, "Already registered");
        require(msg.value >= registrationFee, "Insufficient registration fee");

        patients[msg.sender] = Patient(_name, _ipfsHash, msg.sender, true, _id);
        emit PatientRegistered(msg.sender, _name);
    }

    function updatePatientData(string memory _ipfsHash) external payable onlyPatient {
        require(msg.value >= updateFee, "Insufficient update fee");

        patients[msg.sender].ipfsHash = _ipfsHash;
        emit PatientUpdated(msg.sender, _ipfsHash);
    }

    function isRegistered(address _patient) external view returns (bool) {
        return patients[_patient].exists;
    }

    function setRegistrationFee(uint256 _newFee) external onlyOwner {
        registrationFee = _newFee;
        emit FeeUpdated("registration", _newFee);
    }

    function setUpdateFee(uint256 _newFee) external onlyOwner {
        updateFee = _newFee;
        emit FeeUpdated("update", _newFee);
    }

    function withdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
