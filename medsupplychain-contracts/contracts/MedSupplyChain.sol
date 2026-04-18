// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract MedSupplyChain is AccessControl {
    // Role identifiers
    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER");
    bytes32 public constant DISTRIBUTOR_ROLE   = keccak256("DISTRIBUTOR");
    bytes32 public constant REGULATOR_ROLE     = keccak256("REGULATOR");

    // Batch data stored on-chain (keep minimal: metadata hash + routing)
    struct Batch {
        string productId;       // SKU or product name
        string productHash;     // hash or IPFS CID of the off-chain metadata
        address currentHolder;  // who currently has custody
        uint256 timestamp;      // creation time (block.timestamp at register)
        bool recalled;          // recall flag
        address[] history;      // storage array of all holders (persistent)
    }

    mapping(string => Batch) private batches; // batchId => Batch

    // EVENTS
    event BatchRegistered(string indexed batchId, string productId, address indexed manufacturer);
    event BatchTransferred(string indexed batchId, address indexed from, address indexed to);
    event BatchRecalled(string indexed batchId, address indexed by);

    constructor() {
        // grant deployer admin role
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /// @notice Register a new batch. Only accounts with MANUFACTURER_ROLE can call.
    function registerBatch(
        string memory batchId,
        string memory productId,
        string memory productHash
    ) public onlyRole(MANUFACTURER_ROLE) {
        // ensure batch does not already exist
        require(bytes(batches[batchId].productId).length == 0, "Batch already exists");

        // write data directly into storage struct fields
        batches[batchId].productId      = productId;
        batches[batchId].productHash    = productHash;
        batches[batchId].currentHolder  = msg.sender;
        batches[batchId].timestamp      = block.timestamp;
        batches[batchId].recalled       = false;

        // push initial holder into storage-based history
        batches[batchId].history.push(msg.sender);

        emit BatchRegistered(batchId, productId, msg.sender);
    }

    /// @notice Transfer custody of a batch to `newHolder`. Caller must be current holder.
    function transferBatch(string memory batchId, address newHolder) public {
        require(bytes(batches[batchId].productId).length != 0, "Batch not found");
        require(!batches[batchId].recalled, "Batch has been recalled");
        require(batches[batchId].currentHolder == msg.sender, "Caller not current holder");

        address from = batches[batchId].currentHolder;
        batches[batchId].currentHolder = newHolder;
        batches[batchId].history.push(newHolder);

        emit BatchTransferred(batchId, from, newHolder);
    }

    /// @notice Mark a batch as recalled. Only REGULATOR_ROLE can call.
    function recallBatch(string memory batchId) public onlyRole(REGULATOR_ROLE) {
        require(bytes(batches[batchId].productId).length != 0, "Batch not found");
        require(!batches[batchId].recalled, "Batch already recalled");

        batches[batchId].recalled = true;

        emit BatchRecalled(batchId, msg.sender);
    }

    /// @notice Verify basic on-chain data for a batch.
    /// @return productId, productHash, currentHolder, timestamp, recalled
    function verifyBatch(string memory batchId) public view returns (
        string memory,
        string memory,
        address,
        uint256,
        bool
    ) {
        require(bytes(batches[batchId].productId).length != 0, "Batch not found");
        Batch storage b = batches[batchId];
        return (b.productId, b.productHash, b.currentHolder, b.timestamp, b.recalled);
    }

    /// @notice Return the full custody history for a batch (addresses in order).
    function getBatchHistory(string memory batchId) public view returns (address[] memory) {
        require(bytes(batches[batchId].productId).length != 0, "Batch not found");
        return batches[batchId].history;
    }
}
