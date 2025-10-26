"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const RegisterPatientPage: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [name, setName] = useState("");
  const [ipfsHash, setIpfsHash] = useState("");
  const [patientId, setPatientId] = useState("");
  const [loading, setLoading] = useState(false);

  // Read registration fee from contract
  const { data: registrationFee } = useScaffoldReadContract({
    contractName: "PatientRegistry",
    functionName: "registrationFee",
  });

  // Read owner address
  const { data: owner } = useScaffoldReadContract({
    contractName: "PatientRegistry",
    functionName: "owner",
  });

  // Check if already registered
  const { data: isRegistered } = useScaffoldReadContract({
    contractName: "PatientRegistry",
    functionName: "isRegistered",
    args: [connectedAddress] as const,
  });

  const isOwner = connectedAddress && owner && connectedAddress.toLowerCase() === (owner as string).toLowerCase();

  const { writeContractAsync: registerPatient } = useScaffoldWriteContract("PatientRegistry");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !ipfsHash || !patientId) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      await registerPatient({
        functionName: "registerPatient",
        args: [name, ipfsHash, BigInt(patientId)],
        value: registrationFee,
      });
      alert("Registration successful!");
      setName("");
      setIpfsHash("");
      setPatientId("");
    } catch (error) {
      console.error("Registration failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center flex-col grow pt-10">
      <div className="px-5 w-full max-w-2xl">
        <h1 className="text-center text-4xl font-bold mb-2">Patient Registration</h1>
        <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row mb-6">
          <p className="my-2 font-medium">Connected Address:</p>
          <Address address={connectedAddress} />
        </div>

        {isOwner && (
          <div className="alert alert-warning mb-6">
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
            <div>
              <h3 className="font-bold">⚠️ You are the Contract Owner</h3>
              <div className="text-sm">
                As the owner, you should manage the system, not register as a patient. Use a different wallet address
                for testing patient registration. This keeps the system more systematic with clear role separation.
              </div>
            </div>
          </div>
        )}

        {isRegistered ? (
          <div className="bg-success text-success-content rounded-lg p-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Already Registered</h2>
            <p>You have already registered as a patient.</p>
          </div>
        ) : (
          <div className="bg-base-100 rounded-3xl shadow-lg p-8">
            <div className="mb-6 p-4 bg-base-200 rounded-lg">
              <p className="text-sm">
                <span className="font-semibold">Registration Fee: </span>
                {registrationFee ? formatEther(registrationFee) : "0"} ETH
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text font-semibold">Full Name</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="input input-bordered w-full"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-semibold">Patient ID</span>
                </label>
                <input
                  type="number"
                  placeholder="Enter unique patient ID"
                  className="input input-bordered w-full"
                  value={patientId}
                  onChange={e => setPatientId(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-semibold">IPFS Hash</span>
                </label>
                <input
                  type="text"
                  placeholder="Qm..."
                  className="input input-bordered w-full"
                  value={ipfsHash}
                  onChange={e => setIpfsHash(e.target.value)}
                  required
                />
                <label className="label">
                  <span className="label-text-alt">Store medical data on IPFS and paste the hash here</span>
                </label>
              </div>

              <button type="submit" className="btn btn-primary w-full" disabled={loading || !connectedAddress}>
                {loading ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Processing...
                  </>
                ) : (
                  "Register & Pay"
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterPatientPage;
