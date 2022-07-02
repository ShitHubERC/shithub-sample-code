import { JsonRpcProvider } from "@ethersproject/providers";
import { getLiquidityPool, getReaderContract } from '@shithuberc/protocol.js';
import * as dotenv from "dotenv";
dotenv.config({ path: '~/.env' });

async function main() {
  // Take liquidityPool '0x01010029ce0055b9065081E95d4EEdDfca7866a3' and arb-rinkeby for example
  const liquidityPoolAddress = "0x01010029ce0055b9065081E95d4EEdDfca7866a3"
  const provider = new JsonRpcProvider('https://rinkeby.arbitrum.io/rpc')

  // @ts-ignore
  const reader = await getReaderContract(provider)
  const pool = await getLiquidityPool(reader, liquidityPoolAddress)

  // Take perpetualIndex 0 for example:
  const perpetual = pool.perpetuals.get(0)
  if (perpetual == undefined) {
    console.log("perpetual is undefined")
    return
  }
  console.log("fundingRate: " + perpetual.fundingRate.toString())
  const unitAccumulativeFunding = perpetual.unitAccumulativeFunding.toString()
  console.log("unitAccumulativeFunding: " + unitAccumulativeFunding)
  console.log("Funding payment = entryFunding - position(1) * unitAccumulativeFunding (" + unitAccumulativeFunding + "), entryFunding from MarginAccount of MAI3-graph")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
