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
    args: [connectedAddress as `0x${string}` | undefined],
  });

  // Read patient data from PatientRegistry
  const { data: patientData } = useScaffoldReadContract({
    contractName: "PatientRegistry",
    functionName: "patients",
    args: [connectedAddress as `0x${string}` | undefined],
  });

  const patientName = patientData ? String(patientData[0]) : "";
  const patientIpfsHash = patientData ? String(patientData[1]) : "";
  const patientId = patientData ? String(patientData[4]) : "";

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
            {/* Patient Medical Record */}
            <div className="bg-base-100 rounded-3xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-4">Your Medical Record</h2>

              <div className="bg-base-200 rounded-lg p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold opacity-70">Patient Name</label>
                    <p className="text-lg font-medium">{patientName || "Loading..."}</p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold opacity-70">Patient ID</label>
                    <p className="text-lg font-medium">{patientId || "Loading..."}</p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold opacity-70">Wallet Address</label>
                    <div className="mt-1">
                      <Address address={connectedAddress} />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold opacity-70">Medical Record IPFS Hash</label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-xs break-all bg-base-300 px-3 py-2 rounded flex-1">
                        {patientIpfsHash || "No IPFS hash found"}
                      </code>
                      {patientIpfsHash && (
                        <a
                          href={`https://ipfs.io/ipfs/${patientIpfsHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-secondary"
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
                          View
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <a href="/update-patient" className="btn btn-primary">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Update Record
                  </a>
                </div>
              </div>
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
                Your medical record is stored securely on the blockchain. The IPFS hash links to your encrypted medical
                data.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalRecordsPage;
