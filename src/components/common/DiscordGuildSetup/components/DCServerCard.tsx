import { usePrevious } from "@chakra-ui/react"
import Button from "components/common/Button"
import OptionCard from "components/common/OptionCard"
import useGuildByPlatformId from "hooks/useGuildByPlatformId"
import usePopupWindow from "hooks/usePopupWindow"
import useServerData from "hooks/useServerData"
import Link from "next/link"
import { ArrowSquareIn } from "phosphor-react"
import { useEffect } from "react"

type Props = {
  serverData: {
    id: string
    name: string
    img: string
    owner: boolean
  }
  onSelect?: (id: string) => void
  onCancel?: () => void
}

const DCServerCard = ({ serverData, onSelect, onCancel }: Props): JSX.Element => {
  const { onOpen: openAddBotPopup, windowInstance: activeAddBotPopup } =
    usePopupWindow(
      `https://discord.com/api/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID}&guild_id=${serverData.id}&permissions=268782673&scope=bot%20applications.commands`
    )

  const {
    data: { isAdmin, channels },
  } = useServerData(serverData.id, {
    swrOptions: {
      refreshInterval: !!activeAddBotPopup ? 2000 : 0,
      refreshWhenHidden: true,
    },
  })

  const prevActiveAddBotPopup = usePrevious(activeAddBotPopup)

  useEffect(() => {
    if (!!prevActiveAddBotPopup && !activeAddBotPopup && isAdmin) {
      onSelect(serverData.id)
    }
  }, [prevActiveAddBotPopup, activeAddBotPopup, isAdmin])

  useEffect(() => {
    if (channels?.length > 0 && activeAddBotPopup) {
      activeAddBotPopup.close()
    }
  }, [channels, activeAddBotPopup])

  const { id, urlName } = useGuildByPlatformId("DISCORD", serverData.id)

  return (
    <OptionCard
      title={serverData.name}
      description={serverData.owner ? "Owner" : "Admin"}
      image={serverData.img || "/default_discord_icon.png"}
    >
      {onCancel ? (
        <Button h={10} onClick={onCancel}>
          Cancel
        </Button>
      ) : isAdmin === undefined ? (
        <Button h={10} isLoading />
      ) : !isAdmin ? (
        <Button
          h={10}
          colorScheme="DISCORD"
          onClick={openAddBotPopup}
          isLoading={!!activeAddBotPopup}
          rightIcon={<ArrowSquareIn />}
        >
          Add bot
        </Button>
      ) : !id ? (
        <Button
          h={10}
          colorScheme="green"
          onClick={() => onSelect(serverData.id)}
          data-test="select-dc-server-button"
        >
          Select
        </Button>
      ) : id ? (
        <Link href={`/${urlName}`} passHref>
          <Button as="a" h={10} colorScheme="gray">
            Already guilded
          </Button>
        </Link>
      ) : null}
    </OptionCard>
  )
}

export default DCServerCard
