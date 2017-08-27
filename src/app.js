var express = require('express');
var bodyParser = require('body-parser');
var moment = require('moment');
var Web3 = require('web3');
var contract = require('truffle-contract');
var config = require('./config.json');
var tokenContract = require('./../build/contracts/BToken.json');

var port = process.env.PORT || 3000;
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

var token;
// setup contract
var Token = contract(tokenContract);
Token.setProvider(web3.currentProvider);
// initialize contract
Token.deployed().then(function(instance){
    token = instance;
    app.listen(port, function () {
        console.log('Example app listening on port ' + port)
    });
});

app.get('/', function (req, res) {
    res.send('hello world');
});

// list all account and their balance
app.get('/listAccount', function (req, res) {
    var accounts = web3.eth.accounts;
    res.send(accounts);
});

app.post('/transfer',function(req, res){
    var from = req.body.from
    var to = req.body.to;
    var amount = req.body.amount;
    //Token.web3.personal.unlockAccount(from, 'Password123');
    token.transfer(to, amount, {from: from}).then(function(v){
        res.send(v);
    }).catch(function(err){
        res.send(err);
    });
});

app.post('/freeze',function(req, res){
    var target = req.body.target;
    var from = req.body.from;
    //Token.web3.personal.unlockAccount(from, 'Password123');
    token.freezeAccount(target, true, {from:from}).then(function(v){
        res.send(v);
    }).catch(function(err){
        res.send(err);
    });
});

app.get('/account/:addr', function (req,res) {
    var addr = req.params.addr;
    var balance = {};
    var eth_balance = web3.eth.getBalance(addr);
    balance.eth = web3.fromWei(eth_balance, 'ether').toString(10);
    // get token balance
    token.balanceOf.call(addr).then(function(b){
        balance.token = b.c[0];
        res.send(balance);
    });
});

app.get('/transaction/:addr',function(req,res){
    var addr = req.params.addr;
    var transactions = [];
    var finished = {};
    var i = 0;
    var fromEvent = token.Transfer({from:addr},{fromBlock:'3',toBlock:'latest'});
    var toEvent = token.Transfer({to:addr},{fromBlock:'3',toBlock:'latest'});
    var callback = function(err, result) {
        if(err) res.send(err);
        i++;
        transactions = transactions.concat(result);
        if(i == 2) finalCallback()
    }
    var finalCallback = function() {
        // sort the transaction and get time for each block number
        transactions = transactions.sort(function(a, b){
            return a.blockNumber > b.blockNumber;
        });
        var results = {};
        var datas = [];
        results.totalTrx = transactions.length;
        for(var index = 0;index<transactions.length;index++){
            var tx = transactions[index];
            var transaction = {};
            transaction.from = tx.args.from;
            transaction.to = tx.args.to;
            transaction.amount = tx.args.value;
            transaction.datetime = moment(web3.eth.getBlock(tx.blockNumber).timestamp * 1000).add(7, 'h').toDate();
            datas.push(transaction);
        }
        results.transactions = datas;
        res.send(results);
    }
    fromEvent.get(callback);
    toEvent.get(callback);
});