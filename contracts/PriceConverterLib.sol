// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverterLib {
    function getConversionRate(
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        (, int price, , , ) = priceFeed.latestRoundData();
        return (uint256)(price * 1e10);
    }

    function getPrice(
        uint256 ethAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        uint256 ethPrice = getConversionRate(priceFeed);
        uint256 finalPrice = (ethPrice * ethAmount) / 1e18;
        return finalPrice;
    }
}
