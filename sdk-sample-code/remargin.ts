import { JsonRpcProvider } from "@ethersproject/providers";
import {
  getLiquidityPool,
  getReaderContract,
  LiquidityPoolFactory,
} from '@mcdex/mai3.js';
import { ethers } from 'ethers';
import * as dotenv from "dotenv";
dotenv.config({ path: '~/.env' });
import {
  fromWei,
  toWei,
  NONE,
  USE_TARGET_LEVERAGE,
  ensureFinished,
} from "../utils/utils";

async function setupPosition(liquidityPool: any, trader: any) {
  // execute trade(): open position
  await ensureFinished(liquidityPool.connect(trader).trade(0, trader.address, toWei("1"), toWei("4500"), Math.floor(Date.now()/1000)+999999, NONE, USE_TARGET_LEVERAGE))
  console.log("open position")
}

async function remargin(liquidityPool: any, trader: any, perpetual: any, accountStorage: any) {
  const keeperGasReward = perpetual.keeperGasReward
  const markPrice = perpetual.markPrice
  const margin = fromWei(accountStorage.margin)
  const position = fromWei(accountStorage.position)
  console.log("keeperGasReward: " + keeperGasReward)
  console.log("markPrice: " + markPrice)
  console.log("margin: " + margin)
  console.log("position: " + position)
  const oi = markPrice * Math.abs(Number(position))
  const leverage = oi / (Number(margin) - keeperGasReward)
  console.log("now leverage: " + leverage)

  // assume we want leverage for 3, calculate margin
  const targetMargin = oi / 3 + keeperGasReward
  console.log("targetMargin: " + targetMargin)
  if (targetMargin > Number(margin)) {
    const amount = targetMargin - Number(margin)
    console.log("deposit amount: " + amount)
    await ensureFinished(liquidityPool.connect(trader).deposit(0, trader.address, toWei(amount.toString())))
  } else if (targetMargin < Number(margin)) {
    const amount = Number(margin) - targetMargin
    console.log("withdraw amount: " + amount)
    await ensureFinished(liquidityPool.connect(trader).withdraw(0, trader.address, toWei(amount.toString())))
  }
}

async function teardown(liquidityPool: any, trader: any) {
  // execute trade(): close position
  await ensureFinished(liquidityPool.connect(trader).trade(0, trader.address, toWei("-1"), toWei("3000"), Math.floor(Date.now()/1000)+999999, NONE, USE_TARGET_LEVERAGE))
  console.log("close position")
}

async function main() {
  // Get contract ABI, LiquidityPoolAddress
  const liquidityPoolAddress = "0xc32a2dfee97e2babc90a2b5e6aef41e789ef2e13"
  const provider = new JsonRpcProvider('https://rinkeby.arbitrum.io/rpc')
  const pk = process.env.PRIVATE_KEY
  if (pk == undefined) {
    console.log("PRIVATE_KEY is undefined")
    return
  }
  // @ts-ignore
  const trader = new ethers.Wallet(pk, provider)
  // @ts-ignore
  const liquidityPool = LiquidityPoolFactory.connect(liquidityPoolAddress, provider)
  // @ts-ignore
  const reader = await getReaderContract(provider)
  const pool = await getLiquidityPool(reader, liquidityPoolAddress)
  const perpetual = pool.perpetuals.get(0)
  const account = await reader.callStatic.getAccountStorage(liquidityPoolAddress, 0, trader.address)

  await setupPosition(liquidityPool, trader)
  await remargin(liquidityPool, trader, perpetual, account.accountStorage)
  await teardown(liquidityPool, trader)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
