"use client";

import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

const MedicalRecordsPage: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  // Check if registered
  const { data: isRegistered } = useScaffoldReadContract({
    contractName: "PatientRegistry",
    functionName: "isRegistered",
    args: [connectedAddress] as const,
  });

  // Read patient data
  const { data: patientData } = useScaffoldReadContract({
    contractName: "PatientRegistry",
    functionName: "patients",
    args: [connectedAddress] as const,
  });

  const currentIpfsHash = patientData ? String(patientData[1]) : "";

  return (
    <div className="flex items-center flex-col grow pt-10">
      <div className="px-5 w-full max-w-4xl">
        <h1 className="text-center text-4xl font-bold mb-2">Medical Records Management</h1>
        <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row mb-6">
          <p className="my-2 font-medium">Connected Address:</p>
          <Address address={connectedAddress} />
        </div>

        {!isRegistered ? (
          <div className="bg-error text-error-content rounded-lg p-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Not Registered</h2>
            <p>You need to register as a patient first before viewing medical records.</p>
            <a href="/register-patient" className="btn btn-primary mt-4">
              Go to Registration
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Current Medical Record */}
            <div className="bg-base-100 rounded-3xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-4">Your Medical Record</h2>

              {currentIpfsHash ? (
                <div className="space-y-4">
                  <div className="bg-base-200 rounded-lg p-4 border border-base-300">
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-semibold">Patient Name: </span>
                        {patientData ? String(patientData[0]) : "Loading..."}
                      </div>

                      <div>
                        <span className="font-semibold">Patient ID: </span>
                        {patientData ? String(patientData[4]) : "Loading..."}
                      </div>

                      <div>
                        <span className="font-semibold">IPFS Hash: </span>
                        <code className="text-xs break-all bg-base-300 px-2 py-1 rounded">{currentIpfsHash}</code>
                      </div>

                      <div>
                        <a
                          href={`https://ipfs.io/ipfs/${currentIpfsHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-secondary mt-2"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                          View on IPFS
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <a href="/update-patient" className="btn btn-primary">
                      Update Medical Record
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 opacity-60">
                  <p>No medical record found.</p>
                </div>
              )}
            </div>

            {/* Info Alert */}
            <div className="alert alert-info">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="stroke-current shrink-0 w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <span className="text-sm">
                Your medical record is stored as an IPFS hash. The actual medical data should be encrypted before
                uploading to IPFS.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalRecordsPage;
