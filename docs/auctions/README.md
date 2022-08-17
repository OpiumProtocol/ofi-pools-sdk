# Opium Finance Auctions

## How to manually read current auction price

Whenever an auction is active, you can read it's current price directly from smart contract

First you need to get: auction smart contract address (`auction.address`), pool's nominal (`auction.nominal`) and decimals (`auction.token.decimals`)

Example:
```
GET https://api.opium.watch/v1/auctions/6cc8cd4d-bcb5-4a2b-bffc-a976d56f685b ->

result = {
  auction: {
    address: "0x211aaCc5A7761298fF0E2A7d37B7710E6e588B70",
    nominal: 0.01,
    token: {
      decimals: 18
    }
  },
}
```

First you need to convert required purchase size to BigNumber. Since every pool have different contracts nominal and decimals, you need to calculate it by formula.
```
sizeBN = convertToBN(input.size / result.auction.nominal, result.auction.token.decimals)
```
Example:
- Required Size: 200 ETH
- Nominal: 0.01
- Decimals: 18
- -> Result: 20000000000000000000000

Then you need to make a call to auction smart contract using ABI from this repo located [HERE](../../src/abis/AuctionV2.json).

You need to call the function `getRequiredTakerAmount(sizeBN)` and pass BigNumber'ed size as an argument.

In the example we make a call to `0x211aaCc5A7761298fF0E2A7d37B7710E6e588B70`.

```
const contractInstance = new web3.Contract(ABI, ADDRESS)
const requiredTakerAmount = await contractInstance.getRequiredTakerAmount(sizeBN)
```

Returned value represents the required amount of tokens to pay for the requested amount of size. Thus in order to get the bid you need to futhermore process it.

```
const bid = convertFromBN(requiredTakerAmount, result.auction.token.decimals) / size
```
Example:
- requiredTakerAmount: 440000000000000000
- Size: 200
- Decimals: 18
- -> Result: 0.0022
