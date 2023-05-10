import {
  FormControl,
  FormLabel,
  HStack,
  Input,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import Button from "components/common/Button"
import FormErrorMessage from "components/common/FormErrorMessage"
import { Modal } from "components/common/Modal"
import useGuild from "components/[guild]/hooks/useGuild"
import useToast from "hooks/useToast"
import { useState } from "react"
import useTransferOwnership from "./hooks/useTransferOwnership"

const TransferOwnership = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <Button size="xs" variant="ghost" borderRadius={"lg"} onClick={onOpen}>
        <Text colorScheme={"gray"}>Transfer ownership</Text>
      </Button>
      <TransferOwnershipModal isOpen={isOpen} onClose={onClose} />
    </>
  )
}

const ADDRESS_REGEX = /^0x[a-f0-9]{40}$/i

const TransferOwnershipModal = ({ isOpen, onClose }) => {
  const [newOwner, setNewOwner] = useState("")
  const { mutateGuild } = useGuild()
  const toast = useToast()

  const handleClose = () => {
    setNewOwner("")
    onClose()
  }

  const onSuccess = (res) => {
    toast({
      title: "Owner successfully changed!",
      status: "success",
    })
    handleClose()
    mutateGuild(
      (oldData) => {
        const newAdmins = oldData.admins.map((admin) => ({
          ...admin,
          isOwner: admin.id === res.id,
        }))
        if (newAdmins.every((admin) => admin.isOwner === false)) newAdmins.push(res)
        return {
          ...oldData,
          admins: newAdmins,
        }
      },
      { revalidate: false }
    )
  }

  const { onSubmit, isLoading, signLoadingText } = useTransferOwnership({
    onSuccess,
  })

  const isValidAddress = ADDRESS_REGEX.test(newOwner)

  return (
    <Modal isOpen={isOpen} onClose={handleClose} colorScheme="dark">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader pb="3">Transfer ownership</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text mb="6">
            Are you sure that you want to hand over your ownership? You'll remain an
            admin, but the new owner will be able to remove you anytime.
          </Text>
          <FormControl isInvalid={newOwner && !isValidAddress}>
            <FormLabel>Address to transfer to</FormLabel>
            <Input
              type="url"
              placeholder="Paste address"
              onChange={(e) => setNewOwner(e.target.value)}
            />
            <FormErrorMessage>
              Please input a 42 characters long, 0x-prefixed hexadecimal address
            </FormErrorMessage>
          </FormControl>

          <HStack justifyContent="end">
            <Button
              mt="8"
              ml="auto"
              onClick={() => onSubmit({ to: newOwner })}
              colorScheme="red"
              isLoading={isLoading}
              loadingText={signLoadingText}
              isDisabled={!isValidAddress}
            >
              Transfer ownership
            </Button>
          </HStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
export default TransferOwnership
