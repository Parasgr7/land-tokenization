
const LandManagement = artifacts.require('LandManagement')

module.exports = async function(deployer, network, accounts) {

    await deployer.deploy(LandManagement)

}
