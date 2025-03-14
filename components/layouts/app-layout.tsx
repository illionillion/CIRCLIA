"use client"
import {
  BellIcon,
  CalendarDaysIcon,
  HouseIcon,
  LogOutIcon,
  UsersIcon,
} from "@yamada-ui/lucide"
import {
  Avatar,
  Box,
  Heading,
  HStack,
  IconButton,
  Indicator,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useSafeLayoutEffect,
  useToken,
  VStack,
  useOS,
} from "@yamada-ui/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import type { FC, ReactNode } from "react"
import type { getUserById } from "@/actions/user/user"
import { useNotifications } from "@/provider/notification-provider"

export const AppLayout: FC<{
  children?: ReactNode
  user?: Awaited<ReturnType<typeof getUserById>>
}> = ({ children, user }) => {
  const pathname = usePathname()
  const hRem = useToken("spaces", "12")
  const pbRem = useToken("sizes", "15")
  const { unreadCount } = useNotifications()
  const os = useOS()

  useSafeLayoutEffect(() => {
    if (!user && pathname !== "/signin") {
      signOut({ redirectTo: "/signin" })
    }
  }, [])
  return pathname !== "/signin" ? (
    <VStack w="100vw" h="100dvh" gap={0}>
      <VStack
        w="full"
        bgColor="black"
        px="md"
        position="sticky"
        zIndex="guldo"
        top={0}
        left={0}
        right={0}
      >
        <Heading
          w="fit-content"
          color="white"
          _firstLetter={{ color: "#35B0D2" }}
          fontWeight="light"
          textShadow="1px 1px 0 #666,2px 2px 0 #666,3px 3px 0 #666"
          as={Link}
          href="/"
        >
          CIRCLIA
        </Heading>
      </VStack>
      <HStack w="full" h="full" gap={0}>
        <VStack
          w="fit-content"
          h="full"
          p="sm"
          borderRightWidth={1}
          justifyContent="space-between"
          position="sticky"
          top="12"
          maxH={`calc(100dvh - ${hRem})`}
          left={0}
          bottom={0}
          display={{ base: "flex", sm: "none" }}
          background="whiteAlpha.400"
        >
          <VStack>
            <IconButton
              w="50px"
              h="50px"
              justifyContent="center"
              alignItems="center"
              as={Link}
              variant="ghost"
              href={`/user/${user?.id}`}
              icon={<Avatar src={user?.profileImageUrl || ""} boxSize="8xs" />}
              title="プロフィール"
              _hover={{ transform: "scale(1.4)" }}
            />
            <Indicator
              label={unreadCount}
              showZero={false}
              offset={4}
              ping
              pingScale={1.4}
              withBorder
              size="sm"
              colorScheme="riverBlue"
            >
              <IconButton
                w="50px"
                h="50px"
                justifyContent="center"
                alignItems="center"
                as={Link}
                variant="ghost"
                href="/notifications"
                icon={<BellIcon fontSize="2xl" />}
                title="通知"
                _hover={{ transform: "scale(1.3)" }}
              />
            </Indicator>
            <IconButton
              w="50px"
              h="50px"
              justifyContent="center"
              alignItems="center"
              as={Link}
              variant="ghost"
              href="/"
              icon={<HouseIcon fontSize="2xl" />}
              title="ホーム"
              _hover={{ transform: "scale(1.3)" }}
            />
            <IconButton
              w="50px"
              h="50px"
              justifyContent="center"
              alignItems="center"
              as={Link}
              variant="ghost"
              href="/circles"
              icon={<UsersIcon fontSize="2xl" />}
              title="サークル一覧"
              _hover={{ transform: "scale(1.3)" }}
            />
            <IconButton
              w="50px"
              h="50px"
              justifyContent="center"
              alignItems="center"
              as={Link}
              variant="ghost"
              href="/calendar"
              icon={<CalendarDaysIcon fontSize="2xl" />}
              title="カレンダー"
              _hover={{ transform: "scale(1.3)" }}
            />

            <IconButton
              w="50px"
              h="50px"
              justifyContent="center"
              alignItems="center"
              variant="ghost"
              onClick={() => signOut({ redirectTo: "/signin" })}
              icon={<LogOutIcon fontSize="2xl" />}
              title="サインアウト"
              _hover={{ transform: "scale(1.3)" }}
            />
          </VStack>
        </VStack>
        <Box w="full" h="full" overflowY="auto" pb={{ sm: pbRem }}>
          {children}
        </Box>
      </HStack>
      <HStack
        w="full"
        p="sm"
        {...(os === "ios"
          ? {
              h: "20",
              pb: "7",
            }
          : {
              h: "15",
            })}
        borderTopWidth={1}
        justifyContent="space-between"
        position="fixed"
        left={0}
        right={0}
        bottom={0}
        display={{ base: "none", sm: "flex" }}
        background="whiteAlpha.400"
        backdropBlur="10px"
        backdropFilter="auto"
        backdropSaturate="180%"
      >
        <Indicator
          label={unreadCount}
          showZero={false}
          offset={4}
          ping
          pingScale={1.4}
          withBorder
          size="sm"
          colorScheme="riverBlue"
        >
          <IconButton
            w="50px"
            h="50px"
            justifyContent="center"
            alignItems="center"
            as={Link}
            variant="ghost"
            href="/notifications"
            icon={<BellIcon fontSize="2xl" />}
            title="通知"
          />
        </Indicator>
        <IconButton
          w="50px"
          h="50px"
          justifyContent="center"
          alignItems="center"
          as={Link}
          variant="ghost"
          href="/circles"
          icon={<UsersIcon fontSize="2xl" />}
          title="サークル一覧"
          _hover={{ transform: "scale(1.3)" }}
        />
        <IconButton
          w="50px"
          h="50px"
          justifyContent="center"
          alignItems="center"
          as={Link}
          variant="ghost"
          href="/"
          icon={<HouseIcon fontSize="2xl" />}
          title="ホーム"
          _hover={{ transform: "scale(1.3)" }}
        />
        <IconButton
          w="50px"
          h="50px"
          justifyContent="center"
          alignItems="center"
          as={Link}
          variant="ghost"
          href="/calendar"
          icon={<CalendarDaysIcon fontSize="2xl" />}
          title="カレンダー"
          _hover={{ transform: "scale(1.3)" }}
        />
        <Menu>
          <MenuButton
            as={IconButton}
            w="50px"
            h="50px"
            justifyContent="center"
            alignItems="center"
            variant="ghost"
            icon={<Avatar src={user?.profileImageUrl || ""} boxSize="8xs" />}
            title="プロフィール"
            _hover={{ transform: "scale(1.4)" }}
          />
          <MenuList>
            <MenuItem as={Link} href={`/user/${user?.id}`}>
              <HStack w="full">
                <Avatar src={user?.profileImageUrl || ""} boxSize="8xs" />
                <Text>プロフィール</Text>
              </HStack>
            </MenuItem>
            <MenuItem onClick={() => signOut({ redirectTo: "/signin" })}>
              <HStack w="full">
                <LogOutIcon fontSize="8xs" />
                <Text>サインアウト</Text>
              </HStack>
            </MenuItem>
          </MenuList>
        </Menu>
      </HStack>
    </VStack>
  ) : (
    children
  )
}
