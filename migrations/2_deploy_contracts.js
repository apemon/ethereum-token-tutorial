var BToken = artifacts.require("./BToken.sol")

module.exports = function(deployer){
    deployer.deploy(BToken, 1000000, "BToken", "BBL", {from: web3.eth.accounts[0]});
}