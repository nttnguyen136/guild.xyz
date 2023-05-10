import { Icon, Skeleton, Text } from "@chakra-ui/react"
import { formatUnits } from "@ethersproject/units"
import Withdraw from "components/[guild]/CreatePoap/components/PoapRoleCard/components/Withdraw"
import usePoapVault from "components/[guild]/CreatePoap/hooks/usePoapVault"
import useGuildPermission from "components/[guild]/hooks/useGuildPermission"
import Requirement, {
  RequirementProps,
} from "components/[guild]/Requirements/components/Requirement"
import { RequirementProvider } from "components/[guild]/Requirements/components/RequirementContext"
import { Chain, Chains, RPC } from "connectors"
import useTokenData from "hooks/useTokenData"
import { Coins } from "phosphor-react"
import { GuildPoap, PoapContract, RequirementType } from "types"

type Props = { guildPoap: GuildPoap; poapContract: PoapContract } & RequirementProps

// LEGACY, new POAPs use the general PaymentRequirement
const PoapPaymentRequirement = ({ guildPoap, poapContract, ...props }: Props) => {
  const { id, vaultId, chainId: vaultChainId, contract } = poapContract

  const { isAdmin } = useGuildPermission()

  const { isVaultLoading, vaultData } = usePoapVault(vaultId, vaultChainId)

  const {
    data: { symbol, decimals },
    isValidating: isTokenDataLoading,
  } = useTokenData(Chains[vaultChainId], vaultData?.token)

  const requirement = {
    id,
    type: "POAP_PAYMENT" as RequirementType,
    chain: Chains[vaultChainId] as Chain,
    address: contract,
    data: { id: vaultId },
    roleId: null,
    name: null,
    symbol: null,
    isNegated: null,
  }

  return (
    <RequirementProvider requirement={requirement}>
      <Requirement
        image={<Icon as={Coins} boxSize={6} />}
        footer={
          isAdmin && (
            <Withdraw poapId={guildPoap?.id} vaultId={requirement.data.id} />
          )
        }
        {...props}
        rightElement={props?.rightElement}
      >
        <Skeleton as="span" isLoaded={!isVaultLoading && !isTokenDataLoading}>
          <Text as="span">{`Pay ${formatUnits(
            vaultData?.fee ?? "0",
            decimals ?? 18
          )} ${symbol ?? RPC[Chains[vaultChainId]]?.nativeCurrency?.symbol} on ${
            RPC[Chains[vaultChainId]]?.chainName
          }`}</Text>
        </Skeleton>
      </Requirement>
    </RequirementProvider>
  )
}

export default PoapPaymentRequirement
