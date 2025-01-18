import type { FC } from "@yamada-ui/react"
import { Card, Flip, GridItem, Ripple, useRipple } from "@yamada-ui/react"
import type { ReactElement } from "react"

interface WelcomeCardProps {
  area: string
  from: ReactElement
  to: ReactElement
}

export const WelcomeCard: FC<WelcomeCardProps> = ({ area, from, to }) => {
  const { onPointerDown, ripples, onClear } = useRipple()
  return (
    <GridItem
      area={area}
      onPointerDown={onPointerDown}
      w="full"
      h={{ base: "full", md: "sm" }}
    >
      <Flip
        w="full"
        h="full"
        from={
          <Card w="full" h="full" position="relative" overflow="hidden">
            {from}
            <Ripple ripples={ripples} onClear={onClear} />
          </Card>
        }
        to={
          <Card w="full" h="full" position="relative" overflow="hidden">
            {to}
            <Ripple ripples={ripples} onClear={onClear} />
          </Card>
        }
      />
    </GridItem>
  )
}
