var BToken = artifacts.require("./BToken.sol")

module.exports = function(deployer){
    deployer.deploy(BToken);
}