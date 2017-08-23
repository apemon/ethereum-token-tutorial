var express = require('express');
var Web3 = require('web3');
var contract = require('truffle-contract');
var config = require('./config.json');
var tokenContract = require('./../build/contracts/BToken.json');

var port = process.env.PORT || 3000;
var app = express();
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

app.get('/transfer',function(req, res){
    var from = req.query.from;
    var to = req.query.to;
    var amount = req.query.amount;
    token.transfer(to, amount, {from: from}).then(function(v){
        res.send(v);
    }).catch(function(err){
        res.send(err);
    });
});

app.get('/freeze',function(req, res){
    var target = req.query.target;
    var from = req.query.from;
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