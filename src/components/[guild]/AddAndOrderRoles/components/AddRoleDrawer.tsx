import {
  Box,
  Collapse,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerOverlay,
  FormLabel,
  HStack,
  useDisclosure,
  VStack,
} from "@chakra-ui/react"
import Button from "components/common/Button"
import DiscardAlert from "components/common/DiscardAlert"
import DrawerHeader from "components/common/DrawerHeader"
import ErrorAlert from "components/common/ErrorAlert"
import Section from "components/common/Section"
import Description from "components/create-guild/Description"
import DynamicDevTool from "components/create-guild/DynamicDevTool"
import useCreateRole from "components/create-guild/hooks/useCreateRole"
import IconSelector from "components/create-guild/IconSelector"
import Name from "components/create-guild/Name"
import SetRequirements from "components/create-guild/Requirements"
import useGuild from "components/[guild]/hooks/useGuild"
import usePinata from "hooks/usePinata"
import useSubmitWithUpload from "hooks/useSubmitWithUpload"
import useWarnIfUnsavedChanges from "hooks/useWarnIfUnsavedChanges"
import { useEffect } from "react"
import { FormProvider, useForm, useWatch } from "react-hook-form"
import { PlatformType, Visibility } from "types"
import getRandomInt from "utils/getRandomInt"
import RolePlatforms from "../../RolePlatforms"
import SetVisibility from "../../SetVisibility"

const noRequirementsErrorMessage = "Set some requirements, or make the role free"

const AddRoleDrawer = ({ isOpen, onClose, finalFocusRef }): JSX.Element => {
  const { id, guildPlatforms } = useGuild()
  const discordPlatform = guildPlatforms?.find(
    (p) => p.platformId === PlatformType.DISCORD
  )

  const { onSubmit, isLoading, response, isSigning, signLoadingText } =
    useCreateRole()

  const defaultValues = {
    guildId: id,
    name: "",
    description: "",
    logic: "AND",
    requirements: [],
    roleType: "NEW",
    imageUrl: `/guildLogos/${getRandomInt(286)}.svg`,
    visibility: Visibility.PUBLIC,
    rolePlatforms: discordPlatform
      ? [
          {
            guildPlatformId: discordPlatform.id,
            platformRoleData: {},
            platformRoleId: null,
            isNew: true,
            visibility: Visibility.PUBLIC,
          },
        ]
      : [],
  }

  const methods = useForm({
    mode: "all",
    defaultValues,
  })

  useWarnIfUnsavedChanges(
    methods.formState?.isDirty && !methods.formState.isSubmitted
  )

  const {
    isOpen: isAlertOpen,
    onOpen: onAlertOpen,
    onClose: onAlertClose,
  } = useDisclosure()

  const onCloseAndClear = () => {
    methods.reset(defaultValues)
    onAlertClose()
    onClose()
  }

  useEffect(() => {
    if (!response) return

    onClose()
    methods.reset(defaultValues)
  }, [response])

  const iconUploader = usePinata({
    onSuccess: ({ IpfsHash }) => {
      methods.setValue(
        "imageUrl",
        `${process.env.NEXT_PUBLIC_IPFS_GATEWAY}${IpfsHash}`,
        {
          shouldTouch: true,
        }
      )
    },
    onError: () => {
      methods.setValue("imageUrl", `/guildLogos/${getRandomInt(286)}.svg`, {
        shouldTouch: true,
      })
    },
  })

  const formRequirements = useWatch({
    name: "requirements",
    control: methods.control,
  })

  const { handleSubmit, isUploadingShown, uploadLoadingText } = useSubmitWithUpload(
    (...props) => {
      methods.clearErrors("requirements")
      if (!formRequirements || formRequirements?.length === 0) {
        methods.setError(
          "requirements",
          {
            message: noRequirementsErrorMessage,
          },
          { shouldFocus: true }
        )
        document.getElementById("free-entry-checkbox")?.focus()
      } else {
        return methods.handleSubmit(onSubmit)(...props)
      }
    },
    iconUploader.isUploading
  )

  const loadingText = signLoadingText || uploadLoadingText || "Saving data"

  return (
    <>
      <Drawer
        isOpen={isOpen}
        placement="left"
        size={{ base: "full", md: "lg" }}
        onClose={methods.formState.isDirty ? onAlertOpen : onClose}
        finalFocusRef={finalFocusRef}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerBody className="custom-scrollbar">
            <FormProvider {...methods}>
              <DrawerHeader
                title="Add role"
                justifyContent="start"
                spacing={1}
                alignItems="center"
              >
                <Box>
                  <SetVisibility entityType="role" />
                </Box>
              </DrawerHeader>

              <VStack spacing={10} alignItems="start">
                <RolePlatforms />

                <Section title={"General"}>
                  <Box>
                    <FormLabel>Choose a logo and name for your role</FormLabel>
                    <HStack spacing={2} alignItems="start">
                      <IconSelector uploader={iconUploader} />
                      <Name />
                    </HStack>
                  </Box>
                  <Description />
                </Section>
                <SetRequirements />

                <Collapse
                  in={!!methods.formState.errors?.requirements}
                  style={{
                    width: "100%",
                  }}
                >
                  <ErrorAlert label={noRequirementsErrorMessage} />
                </Collapse>
              </VStack>
            </FormProvider>
          </DrawerBody>

          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={onCloseAndClear}>
              Cancel
            </Button>
            <Button
              isLoading={isLoading || isSigning || isUploadingShown}
              colorScheme="green"
              loadingText={loadingText}
              onClick={handleSubmit}
              data-test="save-role-button"
            >
              Save
            </Button>
          </DrawerFooter>
        </DrawerContent>
        <DynamicDevTool control={methods.control} />
      </Drawer>

      <DiscardAlert
        isOpen={isAlertOpen}
        onClose={onAlertClose}
        onDiscard={onCloseAndClear}
      />
    </>
  )
}

export default AddRoleDrawer
