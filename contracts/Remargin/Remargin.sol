//SPDX-License-Identifier: Unlicense
pragma solidity >=0.7.4;

import "../interface/ILiquidityPoolFull.sol";

contract Remargin {
  constructor() {}

  function calAmountWithLeverage(address liquidityPoolAddress, uint256 index, int256 leverage) public returns (
    int256 keeperGasReward, int256 markPrice, int256 margin, int256 position, int256 targetMargin, int256 amount) {
    ILiquidityPoolFull liquidityPool = ILiquidityPoolFull(liquidityPoolAddress);
    liquidityPool.forceToSyncState();
    int256[42] memory nums;
    (, ,nums) = liquidityPool.getPerpetualInfo(index);
    keeperGasReward = nums[11];
    markPrice = nums[1];
    (, position, , margin, , , , , ) = liquidityPool.getMarginAccount(index, address(this));
    targetMargin = (position * nums[1]) / leverage + nums[11];
    amount = targetMargin - margin;
  }

  function deposit(address liquidityPoolAddress, uint256 index, int256 depositAmount) public {
    ILiquidityPoolFull liquidityPool = ILiquidityPoolFull(liquidityPoolAddress);
    liquidityPool.forceToSyncState();
    liquidityPool.deposit(index, address(this), depositAmount);
  }

  function withdraw(address liquidityPoolAddress, uint256 index, int256 withdrawAmount) public {
    ILiquidityPoolFull liquidityPool = ILiquidityPoolFull(liquidityPoolAddress);
    liquidityPool.forceToSyncState();
    liquidityPool.withdraw(index, address(this), withdrawAmount);
  }
}
