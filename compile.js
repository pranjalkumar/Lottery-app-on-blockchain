const assert=require('assert');
const path=require('path');
const fs= require('fs');
const solc=require('solc');

const LotteryPath= path.resolve(__dirname,'contracts','Lottery.sol');
const source= fs.readFileSync(LotteryPath,'utf8');

module.exports= solc.compile(source,1).contracts[':Lottery'];


//testing
// class Car{
//     park(){
//         return 'stopped';
//     }
//     drive(){
//         return 'vroom';
//     }
// }
//
// describe('Car',()=>{
//     it('can park',()=>{
//         const car= new Car();
//         assert.equal(car.park(),'stopped');
//     });
// });
