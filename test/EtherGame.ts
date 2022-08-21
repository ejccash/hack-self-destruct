import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { extendConfig } from "hardhat/config";


describe("Test Self Destruct", function () {
    let etherGame:Contract
    let attack:Contract
    

    beforeEach("Deploy Contracts",async ()=>{
        const EtherGame = await ethers.getContractFactory("EtherGame");
        const Attack = await ethers.getContractFactory("Attack");
        etherGame = await EtherGame.deploy();
        attack = await Attack.deploy(etherGame.address);        
    })

    it("Test the originer game process ",async()=>{
        let [Alice,Bob,Eve] = await ethers.getSigners();
        await etherGame.connect(Alice).deposit({value:ethers.utils.parseUnits("1","ether")});
        await etherGame.connect(Bob).deposit({value:ethers.utils.parseUnits("1","ether")});
        let contractBalance = await ethers.provider.getBalance(etherGame.address);

        expect(contractBalance ==  ethers.utils.parseUnits("2","ether"),"wrong balance,the contract balance should be 2 ETH");

        await etherGame.connect(Bob).deposit({value:ethers.utils.parseUnits("1","ether")});
        await etherGame.connect(Alice).deposit({value:ethers.utils.parseUnits("1","ether")});
        await etherGame.connect(Bob).deposit({value:ethers.utils.parseUnits("1","ether")});
        await etherGame.connect(Eve).deposit({value:ethers.utils.parseUnits("1","ether")});
        await etherGame.connect(Bob).deposit({value:ethers.utils.parseUnits("1","ether")});

        expect(Bob == await etherGame.winner(),"the winner should be Bob:"+Bob);

        let bobBalanceFirst = await ethers.provider.getBalance(Bob.address);
        await etherGame.connect(Bob).claimReward();
        let bobBalanceSecond = await ethers.provider.getBalance(Bob.address);
        expect(bobBalanceSecond.sub(bobBalanceFirst),"Winner should claim 7 ether");
    })

    it("Test Attack",async()=>{
        let [Alice,Bob,Eve] = await ethers.getSigners();
        await etherGame.connect(Alice).deposit({value:ethers.utils.parseUnits("1","ether")});
        await etherGame.connect(Bob).deposit({value:ethers.utils.parseUnits("1","ether")});
        let contractBalance = await ethers.provider.getBalance(etherGame.address);
        expect(contractBalance ==  ethers.utils.parseUnits("2","ether"),"wrong balance,the contract balance should be 2 ETH");
        await etherGame.connect(Bob).deposit({value:ethers.utils.parseUnits("1","ether")});
        await etherGame.connect(Alice).deposit({value:ethers.utils.parseUnits("1","ether")});
        await attack.connect(Eve).attack({value:ethers.utils.parseUnits("5","ether")});
        contractBalance = await ethers.provider.getBalance(etherGame.address);
        expect(contractBalance ==  ethers.utils.parseUnits("9","ether"),"wrong balance,the contract balance should be 9 ETH");
        expect(0X00==await etherGame.winner(),"winner should be 0x00");
   
    })

})