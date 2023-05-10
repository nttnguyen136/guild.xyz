import { BigNumber, BigNumberish } from "@ethersproject/bignumber"
import { Chains, RPC } from "connectors"
import { FetchPriceResponse } from "pages/api/fetchPrice"
import {
  getAssetsCallParams,
  NULL_ADDRESS,
  PurchaseAssetData,
  purchaseSupportedChains,
} from "./constants"

export type GeneratedGetAssetsParams =
  | [
      number,
      {
        tokenAddress: string
        amount: BigNumberish
      },
      string,
      string[],
      {
        value?: BigNumberish
        gasLimit?: BigNumberish
      }
    ]
  | [
      {
        tokenAddress: string
        amount: BigNumberish
      },
      string,
      string[],
      {
        value?: BigNumberish
        gasLimit?: BigNumberish
      }
    ]

const generateGetAssetsParams = (
  guildId: number,
  account: string,
  chainId: number,
  pickedCurrency: string,
  priceData: FetchPriceResponse
): GeneratedGetAssetsParams => {
  if (!priceData || !purchaseSupportedChains.ERC20?.includes(Chains[chainId]))
    return undefined

  const {
    maxPriceInWei,
    maxGuildFeeInWei: rawMaxGuildFeeInWei,
    buyAmountInWei,
    source,
    path,
    tokenAddressPath,
  } = priceData

  if (
    !guildId ||
    !account ||
    !maxPriceInWei ||
    !rawMaxGuildFeeInWei ||
    !buyAmountInWei ||
    !source ||
    (!path && !tokenAddressPath)
  )
    return undefined

  const amountIn = BigNumber.from(maxPriceInWei)
  const guildFeeInWei = BigNumber.from(rawMaxGuildFeeInWei)
  const amountInWithFee = amountIn.add(guildFeeInWei)
  const amountOut = BigNumber.from(buyAmountInWei)

  const formattedData: PurchaseAssetData = {
    chainId,
    account,
    tokenAddress: pickedCurrency,
    amountIn,
    amountInWithFee,
    amountOut,
    source,
    path,
    tokenAddressPath,
  }

  const isNativeCurrency = Object.values(RPC)
    .map((rpcData) => rpcData.nativeCurrency.symbol)
    .includes(pickedCurrency)

  if (Chains[chainId] === "ARBITRUM")
    return [
      {
        tokenAddress: isNativeCurrency ? NULL_ADDRESS : pickedCurrency,
        amount: isNativeCurrency ? 0 : amountInWithFee,
      },
      `0x${
        getAssetsCallParams[isNativeCurrency ? "COIN" : "ERC20"][source].commands
      }`,
      getAssetsCallParams[isNativeCurrency ? "COIN" : "ERC20"][
        source
      ].getEncodedParams(formattedData),
      { value: isNativeCurrency ? amountInWithFee : undefined },
    ]

  return [
    guildId,
    {
      tokenAddress: isNativeCurrency ? NULL_ADDRESS : pickedCurrency,
      amount: isNativeCurrency ? 0 : amountInWithFee,
    },
    `0x${getAssetsCallParams[isNativeCurrency ? "COIN" : "ERC20"][source].commands}`,
    getAssetsCallParams[isNativeCurrency ? "COIN" : "ERC20"][
      source
    ].getEncodedParams(formattedData),
    { value: isNativeCurrency ? amountInWithFee : undefined },
  ]
}

const flipPath = (pathToFlip: string): string => {
  if (!pathToFlip?.length) return undefined

  const ADDRESS_LENGTH = 40
  const TICK_SPACING_LENGTH = 6
  const pathString = pathToFlip.replace("0x", "")

  const pathSegments = []
  let iteration = 1,
    startIndex = 0,
    endIndex = 0

  do {
    endIndex += iteration % 2 === 1 ? ADDRESS_LENGTH : TICK_SPACING_LENGTH
    pathSegments.push(pathString.slice(startIndex, endIndex))
    startIndex = endIndex
    iteration++
  } while (endIndex < pathString.length)

  const reversedPathSegments = pathSegments.reverse()

  const flippedPath = `0x${reversedPathSegments.join("")}`

  return flippedPath
}

export { generateGetAssetsParams, flipPath }
