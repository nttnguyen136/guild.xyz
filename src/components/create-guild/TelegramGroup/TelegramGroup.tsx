import { FormControl, FormLabel, HStack, Icon, Input, Stack } from "@chakra-ui/react"
import Button from "components/common/Button"
import Card from "components/common/Card"
import FormErrorMessage from "components/common/FormErrorMessage"
import { Uploader } from "hooks/usePinata/usePinata"
import { ArrowSquareOut, Check } from "phosphor-react"
import { PropsWithChildren, useEffect } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import parseFromObject from "utils/parseFromObject"
import useSetImageAndNameFromPlatformData from "../hooks/useSetImageAndNameFromPlatformData"
import useIsTGBotIn from "./hooks/useIsTGBotIn"

type Props = {
  fieldName: string
  onUpload?: Uploader["onUpload"]
}

const TelegramGroup = ({
  fieldName,
  onUpload,
  children,
}: PropsWithChildren<Props>) => {
  const {
    register,
    trigger,
    formState: { errors },
  } = useFormContext()

  const platformId = useWatch({
    name: fieldName,
  })

  const {
    data: { ok: isIn, message: errorMessage, groupIcon, groupName },
    isLoading,
  } = useIsTGBotIn(platformId, { refreshInterval: 5000 })

  useSetImageAndNameFromPlatformData(groupIcon, groupName, onUpload)

  useEffect(() => {
    if (isIn && !errorMessage) trigger(fieldName)
  }, [isIn, errorMessage])

  return (
    <>
      <Card p={8} w="full">
        <Stack direction={{ base: "column", md: "row" }} spacing="4" w="full">
          <FormControl>
            <FormLabel>1. Add bot</FormLabel>
            {!isIn ? (
              <Button
                w="full"
                as="a"
                h="var(--chakra-space-11)"
                href={`https://t.me/${process.env.NEXT_PUBLIC_TG_BOT_USERNAME}?startgroup=true&admin=post_messages+restrict_members+invite_users`}
                target="_blank"
                rightIcon={<Icon as={ArrowSquareOut} mt="-1px" />}
                isLoading={isLoading}
              >
                Add Guild bot
              </Button>
            ) : (
              <Button
                h="var(--chakra-space-11)"
                w="full"
                isDisabled
                rightIcon={<Check />}
              >
                Guild bot added
              </Button>
            )}
          </FormControl>
          <FormControl isInvalid={!!parseFromObject(errors, fieldName)}>
            <FormLabel>2. Enter group ID</FormLabel>
            <Input
              h="var(--chakra-space-11)"
              borderRadius={"xl"}
              {...register(fieldName, {
                required: "This field is required.",
                minLength: {
                  value: 9,
                  message: "Invalid ID length",
                },
                pattern: {
                  value: /^-[0-9]+$/i,
                  message: "A Group ID starts with a '-' and contains only numbers",
                },
                validate: () => isIn || errorMessage,
              })}
            />
            <FormErrorMessage>
              {parseFromObject(errors, fieldName)?.message}
            </FormErrorMessage>
          </FormControl>
        </Stack>
        {children && (
          <HStack justifyContent={"end"} mt={8}>
            {children}
          </HStack>
        )}
      </Card>
    </>
  )
}

export default TelegramGroup
