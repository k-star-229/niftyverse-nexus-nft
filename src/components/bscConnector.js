import { BscConnector } from '@binance-chain/bsc-connector'

export const bsc = new BscConnector({
    supportedChainIds: [56, 97] // later on 1 ethereum mainnet and 3 ethereum ropsten will be supported
})
