"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  // Check if connected user is the owner
  const { data: owner } = useScaffoldReadContract({
    contractName: "PatientRegistry",
    functionName: "owner",
  });

  const isOwner = connectedAddress && owner && connectedAddress.toLowerCase() === (owner as string).toLowerCase();

  return (
    <>
      <div
        className="flex items-center flex-col grow pt-10 bg-gradient-to-b from-blue-100 to-blue-500"
        style={{ borderRadius: "20px" }}
      >
        <div className="px-5">
          <h1 className="text-center text-black">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">ChainNova Medical Records</span>
          </h1>
          <div className="flex justify-center items-center space-x-2 flex-col text-black">
            <p className="my-2 font-medium">Connected Address:</p>
            <Address address={connectedAddress} />
          </div>

          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Link href="/register-patient" className="btn btn-primary btn-lg gap-2">
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
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
              Register as Patient
            </Link>
            <Link href="/update-patient" className="btn btn-secondary btn-lg gap-2">
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Update Record
            </Link>
            <Link href="/medical-records" className="btn btn-accent btn-lg gap-2">
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Medical Records
            </Link>
            {isOwner && (
              <Link href="/admin" className="btn btn-lg gap-2">
                Admin Dashboard
              </Link>
            )}
          </div>
        </div>

        <div
          className="grow bg-base-300 w-full bg-gradient-to-b from-purple-100 to-purple-200 mt-16 px-8 py-12"
          style={{ borderRadius: "15px" }}
        >
          <div className="flex justify-center items-center gap-8 flex-wrap">
            <div className="flex flex-col bg-gradient-to-b from-blue-200 to-blue-400 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 fill-secondary"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <p className="mt-2">
                <Link href="/register-patient" passHref className="link">
                  Register as Patient
                </Link>{" "}
                and store your medical records on-chain securely.
              </p>
            </div>
            <div className="flex flex-col bg-gradient-to-b from-blue-200 to-blue-400 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 fill-secondary"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <p className="mt-2">
                <Link href="/update-patient" passHref className="link">
                  Update Your Record
                </Link>{" "}
                to modify your IPFS hash with new medical data.
              </p>
            </div>
            <div className="flex flex-col bg-gradient-to-b from-blue-200 to-blue-400 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 fill-secondary"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mt-2">
                <Link href="/medical-records" passHref className="link">
                  Medical Records
                </Link>{" "}
                - Add new records and view all your medical history.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
