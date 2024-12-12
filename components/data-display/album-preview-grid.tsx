"use client"
import { XIcon } from "@yamada-ui/lucide"
import type { FC } from "@yamada-ui/react"
import { Grid, GridItem, IconButton, Image } from "@yamada-ui/react"

export const AlbumPreviewGrid: FC<{
  images: string[]
  onRemove: (index: number) => void
}> = ({ images, onRemove }) => (
  <Grid
    templateColumns="repeat(5, 1fr)"
    templateRows="repeat(2, 1fr)"
    gap="md"
    overflow="auto"
    pt="sm"
    width={{ base: "3xl", md: "full" }}
    alignItems="center"
  >
    {images.map((src, index) => (
      <GridItem key={index} boxSize="4xs" position="relative" rounded="md">
        <Image
          src={src}
          alt={`preview-${index}`}
          boxSize="full"
          borderRadius="md"
          objectFit="cover"
        />
        <IconButton
          size="xs"
          fullRounded
          icon={<XIcon />}
          position="absolute"
          top="-sm"
          right="-sm"
          onClick={(e) => {
            e.stopPropagation()
            onRemove(index)
          }}
          colorScheme="danger"
          aria-label="画像削除"
        />
      </GridItem>
    ))}
  </Grid>
)
