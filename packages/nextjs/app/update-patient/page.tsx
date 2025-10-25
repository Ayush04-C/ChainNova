"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const UpdatePatientPage: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [newIpfsHash, setNewIpfsHash] = useState("");
  const [loading, setLoading] = useState(false);

  // Read update fee from contract
  const { data: updateFee } = useScaffoldReadContract({
    contractName: "PatientRegistry",
    functionName: "updateFee",
  });

  // Check if registered
  const { data: isRegistered } = useScaffoldReadContract({
    contractName: "PatientRegistry",
    functionName: "isRegistered",
    args: [connectedAddress] as const,
  });

  // Read current patient data
  const { data: patientData } = useScaffoldReadContract({
    contractName: "PatientRegistry",
    functionName: "patients",
    args: [connectedAddress] as const,
  });

  const { writeContractAsync: updatePatientData } = useScaffoldWriteContract("PatientRegistry");

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIpfsHash) {
      alert("Please enter new IPFS hash");
      return;
    }

    setLoading(true);
    try {
      await updatePatientData({
        functionName: "updatePatientData",
        args: [newIpfsHash],
        value: updateFee,
      });
      alert("Patient data updated successfully!");
      setNewIpfsHash("");
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center flex-col grow pt-10">
      <div className="px-5 w-full max-w-2xl">
        <h1 className="text-center text-4xl font-bold mb-2">Update Patient Record</h1>
        <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row mb-6">
          <p className="my-2 font-medium">Connected Address:</p>
          <Address address={connectedAddress} />
        </div>

        {!isRegistered ? (
          <div className="bg-error text-error-content rounded-lg p-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Not Registered</h2>
            <p>You need to register as a patient first before updating your data.</p>
            <a href="/register-patient" className="btn btn-primary mt-4">
              Go to Registration
            </a>
          </div>
        ) : (
          <div className="bg-base-100 rounded-3xl shadow-lg p-8">
            {/* Current Patient Info */}
            <div className="mb-6 p-4 bg-base-200 rounded-lg">
              <h3 className="font-bold text-lg mb-3">Current Patient Information</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-semibold">Name: </span>
                  {patientData ? (patientData as any)[0] : "Loading..."}
                </div>
                <div>
                  <span className="font-semibold">Patient ID: </span>
                  {patientData ? (patientData as any)[4]?.toString() : "Loading..."}
                </div>
                <div>
                  <span className="font-semibold">Current IPFS Hash: </span>
                  <code className="text-xs break-all">{patientData ? (patientData as any)[1] : "Loading..."}</code>
                </div>
              </div>
            </div>

            {/* Update Fee Info */}
            <div className="mb-6 p-4 bg-info text-info-content rounded-lg">
              <p className="text-sm">
                <span className="font-semibold">Update Fee: </span>
                {updateFee ? formatEther(updateFee) : "0"} ETH
              </p>
            </div>

            {/* Update Form */}
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text font-semibold">New IPFS Hash</span>
                </label>
                <input
                  type="text"
                  placeholder="Qm..."
                  className="input input-bordered w-full"
                  value={newIpfsHash}
                  onChange={e => setNewIpfsHash(e.target.value)}
                  required
                />
                <label className="label">
                  <span className="label-text-alt">
                    Upload updated medical data to IPFS and paste the new hash here
                  </span>
                </label>
              </div>

              <button type="submit" className="btn btn-primary w-full" disabled={loading || !connectedAddress}>
                {loading ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Updating...
                  </>
                ) : (
                  "Update & Pay"
                )}
              </button>
            </form>

            {/* Info Alert */}
            <div className="alert alert-warning mt-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span className="text-sm">
                Only the IPFS hash will be updated. Your name and patient ID remain unchanged.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpdatePatientPage;
