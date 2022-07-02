import BigNumber from "bignumber.js"
import { ethers } from "ethers"
import {
  getReaderContract,
  getERC20Contract,
  getLiquidityPool,
  getAccountStorage,
  Reader,
} from "@shithuberc/protocol.js"

async function getLPExposure(
  reader: Reader,
  liquidityPool: string,
  lp: string
) {
  // since one pool may has multi-perps, lp may has a group of positions
  const result: Array<BigNumber> = []

  const pool = await getLiquidityPool(reader, liquidityPool)
  const shareToken = await getERC20Contract(pool.shareToken, reader.provider)

  // get shares of the LP
  const lpBalance = new BigNumber((await shareToken.balanceOf(lp)).toString())
  const totalLP = new BigNumber((await shareToken.totalSupply()).toString())
  const shares = lpBalance.div(totalLP)

  for (let i = 0; i < pool.perpetuals.size; i++) {
    // read AMM positions, AMM is a trader with the address of liquidity pool
    const account = await getAccountStorage(
      reader,
      liquidityPool,
      i,
      liquidityPool
    )
    const ammPosition = account.positionAmount

    // lp shares the position
    const lpPosition = ammPosition.times(shares)
    result.push(lpPosition)
  }

  return result
}

async function main() {
  // The USD pool
  const liquidityPool = "0x1111"
  // The address of liquidity provider
  const lpAddress = "0x0000"

  const provider = new ethers.providers.JsonRpcProvider(
    "https://rinkeby.arbitrum.io/rpc"
  )
  const reader = await getReaderContract(provider)

  const lpExposure = await getLPExposure(reader, liquidityPool, lpAddress)

  lpExposure.forEach((value: BigNumber, index: number) =>
    console.log(`LP position of perpetual ${index}: ` + value.toFixed(5))
  )
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
