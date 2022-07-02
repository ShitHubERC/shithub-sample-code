//SPDX-License-Identifier: Unlicense
pragma solidity >=0.7.4;

import "../interface/ILiquidityPoolFull.sol";

contract Position {

  constructor() {}

  function setTargetLeverage(address liquidityPoolAddress, uint256 perpetualIndex, int256 leverage
  ) public {
    ILiquidityPoolFull liquidityPool = ILiquidityPoolFull(liquidityPoolAddress);
    liquidityPool.forceToSyncState();
    liquidityPool.setTargetLeverage(perpetualIndex, address(this), leverage);
  }

  function queryTrade(address liquidityPoolAddress, uint256 perpetualIndex, int256 position,
    address referrer, uint32 flags
  ) public returns (
    int256 tradePrice, int256 totalFee, int256 cost
  ) {
    ILiquidityPoolFull liquidityPool = ILiquidityPoolFull(liquidityPoolAddress);
    liquidityPool.forceToSyncState();
    (tradePrice, totalFee, cost) = liquidityPool.queryTrade(perpetualIndex, address(this), position, referrer, flags);
  }

  function trade(address liquidityPoolAddress, uint256 perpetualIndex, int256 amount,
    int256 limitPrice, uint256 deadline, address referrer, uint32 flags
  ) public returns (
    int256 tradeAmount
  ) {
    ILiquidityPoolFull liquidityPool = ILiquidityPoolFull(liquidityPoolAddress);
    tradeAmount = liquidityPool.trade(perpetualIndex, address(this), amount, limitPrice, deadline, referrer, flags);
  }
}
