# Plasma CLI Wallet

This is the Plasma CLI Wallet using [wakkanay](https://github.com/cryptoeconomicslab/wakkanay).

## Development

### Requirement

- [Node.js](https://nodejs.org/) v10+
- [npm](https://www.npmjs.com/) (normally comes with Node.js)

### Install

```bash
$ npm i
```

### Run

```bash
$ npm start
```

### Manual

Please enter the `help` command to read the manual.

```bash
$ npm start
>> help

Commands:
  getbalance: get your balance
  deposit [amount]: deposit token to plasma
  transfer [amount] [to]: transfer token
  exit [amount]: submit exit claim
  showexitlist: show your exit list
  finalizeexit [index]: withdraw token from exit list
  quit: quit this process
```
