# y-dictionary-api

A server which provides RESTful API(s) to look up word(s) using Express.js and runs the server on port 3000 by default.

[![Node Version](https://img.shields.io/badge/nodejs-18-green.svg?logo=node.js&style=flat)](https://nodejs.org)

## Installation

```shell
git clone git@github.com:hmtonywang/y-dictionary-api.git
cd y-dictionary-api
yarn install
```

## Usage

- To Run the API server in the development mode, run:

```shell
yarn dev
```

The server will restart when you make changes.

- To run the API server in the production mode, run:

```shell
yarn start
```

- To run linting, run:

```shell
yarn lint
```

- To run unit tests, run:

```shell
yarn unit-test
```

- To run integration tests, run:

```shell
yarn integration-test
```

- To run linting, unit tests and integration tests, run:

```shell
yarn test
```

- To build docker image, run:

```shell
yarn build
```

## Related Projects

- [y-dictionary-chrome-ext](https://github.com/hmtonywang/y-dictionary-chrome-ext) - A chrome extension to look up word(s)
