// SPDX-License-Identifier: MIT

//pragmas
pragma solidity ^0.8.18;

//imports
import "./PriceConverterLib.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

// Errors
error FundMe__Unauthorized();
error FundMe__callFailed();
error FundMe__InsufficientFunds();

//Interfaces,Librairies,Contracts
contract FundMe {
    // Type Declarations
    using PriceConverterLib for uint256;
    //State Variables
    AggregatorV3Interface private s_priceFeed;
    address[] private s_funders;
    mapping(address => uint256) private s_addressToFundedAmount;
    uint256 public constant MIN_USD = 50 * 1e18;
    address private immutable i_owner;

    modifier onlyOwner() {
        if (msg.sender != i_owner) {
            revert FundMe__Unauthorized();
        }
        _;
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    function fund() public payable {
        if (msg.value.getPrice(s_priceFeed) < MIN_USD) {
            revert FundMe__InsufficientFunds();
        }
        s_funders.push(msg.sender);
        s_addressToFundedAmount[msg.sender] += msg.value;
    }

    function withdraw() public onlyOwner {
        address[] memory memFunders = s_funders;
        for (uint256 i = 0; i < memFunders.length; i++) {
            s_addressToFundedAmount[memFunders[i]] = 0;
        }
        s_funders = new address[](0);
        (bool success, ) = i_owner.call{value: address(this).balance}("");
        if (!success) {
            revert FundMe__callFailed();
        }
    }

    // View,Pure functions
    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getAddressToFundedAmount(
        address funder
    ) public view returns (uint256) {
        return s_addressToFundedAmount[funder];
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }
}
