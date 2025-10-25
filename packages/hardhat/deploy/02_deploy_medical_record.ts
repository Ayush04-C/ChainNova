import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploy MedicalRecord contract.
 */
const deployMedicalRecord: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Get the deployed PatientRegistry address
  const patientRegistry = await hre.deployments.get("PatientRegistry");

  await deploy("MedicalRecord", {
    from: deployer,
    args: [patientRegistry.address],
    log: true,
    autoMine: true,
  });

  console.log("✅ MedicalRecord deployed");
};

export default deployMedicalRecord;
deployMedicalRecord.tags = ["MedicalRecord"];
deployMedicalRecord.dependencies = ["PatientRegistry"];
