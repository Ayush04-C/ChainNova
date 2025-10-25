pragma solidity ^0.8.20;

contract AuditTrail {
    enum ActionType { ADD_RECORD, ACCESS_RECORD, UPDATE_RECORD }

    struct LogEntry {
        address actor;
        address patient;
        ActionType action;
        uint256 timestamp;
        string details;
    }

    LogEntry[] public logs;

    event ActionLogged(address indexed actor, address indexed patient, ActionType action, string details, uint256 timestamp);

    function logAction(address _actor, address _patient, ActionType _action, string memory _details) external {
        logs.push(LogEntry(_actor, _patient, _action, block.timestamp, _details));
        emit ActionLogged(_actor, _patient, _action, _details, block.timestamp);
    }

    function getAllLogs() external view returns (LogEntry[] memory) {
        return logs;
    }
}