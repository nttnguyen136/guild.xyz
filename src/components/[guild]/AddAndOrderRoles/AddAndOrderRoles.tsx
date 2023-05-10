import {
  ButtonGroup,
  Divider,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useDisclosure,
} from "@chakra-ui/react"
import Button from "components/common/Button"
import OnboardingMarker from "components/common/OnboardingMarker"
import useIsStuck from "hooks/useIsStuck"
import { CaretDown, ListNumbers, Plus } from "phosphor-react"
import { useEffect, useRef } from "react"
import AddRoleDrawer from "./components/AddRoleDrawer"
import OrderRolesModal from "./components/OrderRolesModal"

const AddAndOrderRoles = ({ setIsStuck = null }): JSX.Element => {
  const {
    isOpen: isAddDrawerOpen,
    onOpen: onAddDrawerOpen,
    onClose: onAddDrawerClose,
  } = useDisclosure()
  const {
    isOpen: isOrderModalOpen,
    onOpen: onOrderModalOpen,
    onClose: onOrderModalClose,
  } = useDisclosure()

  const orderButtonRef = useRef(null)
  const { ref: addRoleButtonRef, isStuck } = useIsStuck()
  useEffect(() => {
    setIsStuck?.(isStuck)
  }, [isStuck])

  return (
    <>
      <ButtonGroup isAttached size="sm" variant="ghost">
        <OnboardingMarker step={0} onClick={onAddDrawerOpen}>
          <Button
            ref={addRoleButtonRef}
            leftIcon={<Icon as={Plus} />}
            onClick={onAddDrawerOpen}
            /**
             * Have to remove border radiuses explicitly because ButtonGroup's
             * isAttached prop doesn't work when OnboardingMarker renders a wrapper
             * around the button
             */
            borderTopRightRadius="0"
            borderBottomRightRadius="0"
            data-test="add-role-button"
          >
            Add role
          </Button>
        </OnboardingMarker>
        <Divider orientation="vertical" h="8" />
        <Menu placement="bottom-end">
          <MenuButton
            isActive={isOrderModalOpen}
            as={IconButton}
            icon={<CaretDown />}
            borderTopLeftRadius="0"
            borderBottomLeftRadius="0"
          ></MenuButton>
          <MenuList>
            <MenuItem
              ref={orderButtonRef}
              onClick={onOrderModalOpen}
              icon={<ListNumbers />}
            >
              Reorder roles
            </MenuItem>
          </MenuList>
        </Menu>
      </ButtonGroup>
      <AddRoleDrawer
        isOpen={isAddDrawerOpen}
        onClose={onAddDrawerClose}
        finalFocusRef={addRoleButtonRef}
      />
      <OrderRolesModal
        isOpen={isOrderModalOpen}
        onClose={onOrderModalClose}
        finalFocusRef={orderButtonRef}
      />
    </>
  )
}

export default AddAndOrderRoles
