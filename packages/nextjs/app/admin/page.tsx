"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const AdminPage: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [loading, setLoading] = useState(false);

  // Read owner address
  const { data: owner } = useScaffoldReadContract({
    contractName: "PatientRegistry",
    functionName: "owner",
  });

  // Read contract balance
  const { data: balance, refetch: refetchBalance } = useScaffoldReadContract({
    contractName: "PatientRegistry",
    functionName: "getBalance",
  });

  // Read fees
  const { data: registrationFee } = useScaffoldReadContract({
    contractName: "PatientRegistry",
    functionName: "registrationFee",
  });

  const { data: updateFee } = useScaffoldReadContract({
    contractName: "PatientRegistry",
    functionName: "updateFee",
  });

  const { writeContractAsync: withdraw } = useScaffoldWriteContract("PatientRegistry");

  const isOwner = connectedAddress && owner && connectedAddress.toLowerCase() === (owner as string).toLowerCase();

  const handleWithdraw = async () => {
    setLoading(true);
    try {
      await withdraw({
        functionName: "withdraw",
      });
      alert("Withdrawal successful!");
      setTimeout(() => refetchBalance(), 2000);
    } catch (error) {
      console.error("Withdrawal failed:", error);
      alert("Withdrawal failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center flex-col grow pt-10">
      <div className="px-5 w-full max-w-3xl">
        <h1 className="text-center text-4xl font-bold mb-2">Admin Dashboard</h1>
        <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row mb-6">
          <p className="my-2 font-medium">Connected Address:</p>
          <Address address={connectedAddress} />
        </div>

        {!isOwner ? (
          <div className="bg-error text-error-content rounded-lg p-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p>Only the contract owner can access this page.</p>
            <div className="mt-4">
              <div className="text-sm">
                <span>Owner Address: </span>
                <Address address={owner as `0x${string}`} />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Contract Stats */}
            <div className="bg-base-100 rounded-3xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6">Contract Statistics</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="stats shadow">
                  <div className="stat">
                    <div className="stat-figure text-primary">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        className="inline-block w-8 h-8 stroke-current"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        ></path>
                      </svg>
                    </div>
                    <div className="stat-title">Contract Balance</div>
                    <div className="stat-value text-primary">{balance ? formatEther(balance as bigint) : "0"} ETH</div>
                    <div className="stat-desc">Available to withdraw</div>
                  </div>
                </div>

                <div className="stats shadow">
                  <div className="stat">
                    <div className="stat-figure text-secondary">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        className="inline-block w-8 h-8 stroke-current"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                        ></path>
                      </svg>
                    </div>
                    <div className="stat-title">Registration Fee</div>
                    <div className="stat-value text-secondary">
                      {registrationFee ? formatEther(registrationFee as bigint) : "0"} ETH
                    </div>
                    <div className="stat-desc">Per registration</div>
                  </div>
                </div>

                <div className="stats shadow md:col-span-2">
                  <div className="stat">
                    <div className="stat-figure text-accent">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        className="inline-block w-8 h-8 stroke-current"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        ></path>
                      </svg>
                    </div>
                    <div className="stat-title">Update Fee</div>
                    <div className="stat-value text-accent">
                      {updateFee ? formatEther(updateFee as bigint) : "0"} ETH
                    </div>
                    <div className="stat-desc">Per update</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Withdraw Section */}
            <div className="bg-base-100 rounded-3xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-4">Withdraw Funds</h2>

              <div className="alert alert-info mb-6">
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
                  All collected fees from patient registrations and updates are stored in the contract. Click below to
                  withdraw all funds to your wallet.
                </span>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="text-center">
                  <p className="text-4xl font-bold text-primary mb-2">
                    {balance ? formatEther(balance as bigint) : "0"} ETH
                  </p>
                  <p className="text-sm opacity-70">Available to withdraw</p>
                </div>

                <button
                  onClick={handleWithdraw}
                  className="btn btn-primary btn-lg w-full max-w-md"
                  disabled={loading || !balance || balance === 0n}
                >
                  {loading ? (
                    <>
                      <span className="loading loading-spinner"></span>
                      Withdrawing...
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Withdraw All Funds
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Owner Info */}
            <div className="alert alert-success">
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <div className="font-bold">You are the contract owner</div>
                <div className="text-sm">
                  You can withdraw funds collected from patient registrations and updates. Use a different wallet for
                  patient operations to maintain proper role separation.
                </div>
              </div>
            </div>

            {/* Info Box */}
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
              <div>
                <div className="font-bold">💡 Systematic Approach</div>
                <div className="text-sm">
                  <strong>Owner wallet (you):</strong> Manage system & withdraw fees
                  <br />
                  <strong>Patient wallets (others):</strong> Register & update records
                  <br />
                  This separation keeps your system organized and professional.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
