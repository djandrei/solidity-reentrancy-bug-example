/**
 * Smart contract migration.
 * For any suggestions please contact me at andrei.dimitrief.jianu@gmail.com
 */

var Milkshake = artifacts.require("./Milkshake.sol");
var Straw = artifacts.require("./Straw.sol");

var fileSystem = require('fs');

module.exports = function(deployer, network, accounts) 
{
    console.log('\n\tMigration to ' + network + ' network');

    let owner = accounts[0];
    let attacker = accounts[1];

    deployer.deploy(Milkshake, { from: owner }).then((milkshake) => 
    {
        console.log('\tmilkshake address: ' + milkshake.address);
        fileSystem.writeFileSync('milkshake.address.json', JSON.stringify({ 'milkshake': milkshake.address }));

        return deployer.deploy(Straw, milkshake.address, { from: attacker }).then((straw) => 
        {
            console.log('\tstraw address: ' + straw.address);
            fileSystem.writeFileSync('straw.address.json', JSON.stringify({ 'straw': straw.address }));
        });
    });
};
