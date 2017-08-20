var express = require('express');
var Web3 = require('web3');
var contract = require('truffle-contract');
var config = require('./config.json');
var tokenContract = require('./../build/contracts/BToken.json');

var port = process.env.PORT || 3000;
var app = express();
var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

app.get('/', function (req, res) {
    res.send('hello world');
});

// list all account and their balance
app.get('/listAccount', function (req, res) {
    var accounts = web3.eth.accounts;
    res.send(accounts);
});

app.get('/account/:addr', function (req,res) {
    var balance = {};
    var eth_balance = web3.eth.getBalance(req.params.addr);
    balance.eth = web3.fromWei(eth_balance, 'ether').toString(10);
    res.send(balance);
});

app.listen(port, function () {
    console.log('Example app listening on port ' + port)
});