import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploy PatientRegistry contract.
 */
const deployPatientRegistry: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("PatientRegistry", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });
  console.log("✅ PatientRegistry deployed");
};

export default deployPatientRegistry;
deployPatientRegistry.tags = ["PatientRegistry"];
