import { HStack, Text } from "@chakra-ui/react"
import BlockExplorerUrl from "components/[guild]/Requirements/components/BlockExplorerUrl"
import PurchaseRequirement from "components/[guild]/Requirements/components/GuildCheckout/PurchaseRequirement"
import { GuildCheckoutProvider } from "components/[guild]/Requirements/components/GuildCheckout/components/GuildCheckoutContex"
import PurchaseTransactionStatusModal from "components/[guild]/Requirements/components/GuildCheckout/components/PurchaseTransactionStatusModal"
import Requirement, {
  RequirementProps,
} from "components/[guild]/Requirements/components/Requirement"
import { useRequirementContext } from "components/[guild]/Requirements/components/RequirementContext"
import useTokenData from "hooks/useTokenData"
import { useEffect } from "react"
import { UseFormSetValue } from "react-hook-form"

type Props = RequirementProps & {
  setValueForBalancy: UseFormSetValue<any>
}

const TokenRequirement = ({ setValueForBalancy, ...rest }: Props) => {
  const requirement = useRequirementContext()

  const { data, isValidating } = useTokenData(requirement.chain, requirement.address)

  useEffect(() => {
    if (setValueForBalancy && data.decimals)
      setValueForBalancy("balancyDecimals", data.decimals)
  }, [setValueForBalancy, data.decimals])

  return (
    <Requirement
      image={
        data?.logoURI ?? (
          <Text as="span" fontWeight="bold" fontSize="xx-small">
            ERC20
          </Text>
        )
      }
      isImageLoading={isValidating}
      footer={
        requirement?.type === "ERC20" && (
          <HStack spacing="4">
            <GuildCheckoutProvider>
              <PurchaseRequirement />
              <PurchaseTransactionStatusModal />
            </GuildCheckoutProvider>
            <BlockExplorerUrl />
          </HStack>
        )
      }
      {...rest}
    >
      {`Hold ${
        requirement.data?.maxAmount
          ? `${requirement.data.minAmount} - ${requirement.data.maxAmount}`
          : requirement.data?.minAmount > 0
          ? `at least ${requirement.data?.minAmount}`
          : "any amount of"
      } ${data?.symbol ?? requirement.symbol}`}
    </Requirement>
  )
}

export default TokenRequirement
