// @ts-ignore
import {ethers} from "hardhat";
import {fromWei, NONE, toWei, USE_TARGET_LEVERAGE} from "../../utils/utils";

async function test() {
  const Contract = await ethers.getContractFactory("Position");
  const contract = await Contract.deploy();

  await contract.deployed();
  console.log("Greeter deployed to:", contract.address);
  await contract.setTargetLeverage("0x01010029ce0055b9065081E95d4EEdDfca7866a3", 0, toWei("5"))
  console.log("setTargetLeverage to 5")
  const { totalFee, cost }  = await contract.callStatic.queryTrade("0x01010029ce0055b9065081E95d4EEdDfca7866a3", 0, toWei("1"), NONE, USE_TARGET_LEVERAGE)
  console.log("totalFee", fromWei(totalFee.toString()))
  console.log("cost " + fromWei(cost.toString()) + " ~= (mark price / leverage) + Keeper Gas Reward")
}

test().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});