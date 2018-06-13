const assert= require('assert');
const ganache= require('ganache-cli');
const Web3 = require('web3');

//web3 version problem fix
const provider = ganache.provider();
const web3 = new Web3(provider);

//including the solidity contract
const {interface,bytecode}= require('../compile');

let accounts;
let lottery;

beforeEach(async()=>{
    //fetching the list of accounts
    accounts= await web3.eth.getAccounts();

    //deploying the contract
    lottery= await new web3.eth.Contract(JSON.parse(interface))
        .deploy({data: bytecode})
        .send({ from: accounts[0], gas: '1000000'});

    //web3 version problem fix
    lottery.setProvider(provider);
});

describe('Lottery Contract', ()=>{
   it('deploys a contract',()=>{
      assert.ok(lottery.options.address);
   });

   it('allowing someone to enter the lottery', async()=>{
      await lottery.methods.enter().send({
         from:accounts[0],
          value: web3.utils.toWei('0.02','ether')
      });
      const players=await lottery.methods.getPlayers().call({
         from: accounts[0]
      });
      assert.equal(accounts[0],players[0]);
      assert.equal(1,players.length);
   });

    it('allowing second user to enter the lottery', async()=>{
        await lottery.methods.enter().send({
            from:accounts[0],
            value: web3.utils.toWei('0.03','ether')
        });
        await lottery.methods.enter().send({
            from:accounts[1],
            value: web3.utils.toWei('0.03','ether')
        });
        await lottery.methods.enter().send({
            from:accounts[2],
            value: web3.utils.toWei('0.03','ether')
        });
        const players=await lottery.methods.getPlayers().call({
            from: accounts[0]
        });
        assert.equal(accounts[0],players[0]);
        assert.equal(accounts[1],players[1]);
        assert.equal(accounts[2],players[2]);
        assert.equal(3,players.length);
    });

    it('only manager can pick the winner', async()=>{
       try{
           await lottery.methods.pickWinner().send({
               from: accounts[1]
           });
           assert(false);
       }catch (err){
           assert(err);
       }
    });

    it('sends money to winner and reset the lottery',async()=>{
        await lottery.methods.enter().send({
            from:accounts[0],
            value: web3.utils.toWei('2','ether')
        });

        const initial_balance=await web3.eth.getBalance(accounts[0]);
        await lottery.methods.pickWinner().send({
            from:accounts[0]
        });
        const final_balance=await web3.eth.getBalance(accounts[0]);

        const diff=final_balance-initial_balance;
        console.log(diff);
        assert(diff>web3.utils.toWei('1.8','ether'));
    });
});