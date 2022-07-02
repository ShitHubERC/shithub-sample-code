import { ethers} from 'ethers'

export function toWei(n: string) { return ethers.utils.parseEther(n) };
export function fromWei(n: string) { return ethers.utils.formatEther(n); }

const NONE = "0x0000000000000000000000000000000000000000";
const USE_TARGET_LEVERAGE = 0x8000000;

export async function ensureFinished(transaction: any): Promise<any> {
  const result = await transaction;
  if (typeof result.deployTransaction != 'undefined') {
    await result.deployTransaction.wait()
  } else {
    await result.wait()
  }
  return result
}

export {
  NONE,
  USE_TARGET_LEVERAGE,
}
