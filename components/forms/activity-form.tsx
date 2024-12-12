"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { DatePicker } from "@yamada-ui/calendar"
import type { FC } from "@yamada-ui/react"
import {
  Button,
  Center,
  ErrorMessage,
  FormControl,
  Heading,
  Input,
  Label,
  Snacks,
  Spacer,
  Text,
  Textarea,
  useBoolean,
  useSnacks,
  VStack,
} from "@yamada-ui/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { addActivityAction } from "@/actions/circle/add-activity"
import { editActivity } from "@/actions/circle/edit-activity"
import type { getCircleById } from "@/actions/circle/fetch-circle"
import type { getActivityById } from "@/data/activity"
import type { ActivityFormType } from "@/schema/activity"
import { ActivitySchema } from "@/schema/activity"
import { zeroPadding } from "@/utils/format"
import "dayjs/locale/ja"

interface ActivityFormProps {
  userId: string
  circleId: string
  circle?: Awaited<ReturnType<typeof getCircleById>>
  activity?: Awaited<ReturnType<typeof getActivityById>>
  mode: "create" | "edit"
}

export const ActivityForm: FC<ActivityFormProps> = ({
  circleId,
  circle,
  userId,
  activity,
  mode,
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ActivityFormType>({
    resolver: zodResolver(ActivitySchema),
    defaultValues: {
      title: activity?.title || "",
      description: activity?.description || "",
      location: activity?.location || "",
      date: activity?.activityDay,
      startTime: activity?.startTime
        ? `${activity.startTime.getHours()}:${zeroPadding(activity.startTime.getMinutes())}`
        : "",
      endTime: activity?.endTime
        ? `${activity.endTime.getHours()}:${zeroPadding(activity.endTime.getMinutes())}`
        : "",
      notes: activity?.notes || "",
    },
  })

  const { snack, snacks } = useSnacks()
  const [isLoading, { on: start, off: end }] = useBoolean()
  const router = useRouter()
  const onSubmit = async (data: ActivityFormType) => {
    start()
    if (mode === "create") {
      const result = await addActivityAction(data, circleId, userId)
      if (result.success) {
        router.push(`/circles/${circleId}/activities`)
      } else {
        snack({
          title: result.error || "活動日の登録に失敗しました。",
          status: "error",
        })
        end()
      }
    } else if (mode === "edit") {
      const result = await editActivity(
        data,
        circleId,
        userId,
        activity?.id || 0,
      )
      if (result.success) {
        router.push(`/circles/${circleId}/activities`)
      } else {
        snack({
          title: result.error || "活動日の更新に失敗しました。",
          status: "error",
        })
        end()
      }
    }
  }

  return (
    <VStack
      w="full"
      h="fit-content"
      as="form"
      onSubmit={handleSubmit(onSubmit)}
      p="md"
    >
      <VStack maxW="5xl" m="auto" gap="lg" flexGrow={1}>
        <Heading>{`${circle?.name} 活動日程`}</Heading>
        <FormControl
          display="flex"
          flexDirection={{ base: "row", md: "column" }}
          gap={{ base: "2xl", md: "md" }}
          maxW="2xl"
          isInvalid={!!errors.title}
        >
          <Label flexGrow={1} isRequired>
            見出し
          </Label>
          <VStack w="auto">
            <Input
              type="text"
              w={{ base: "md", md: "full" }}
              placeholder="例）ミーティング"
              {...register("title")}
            />
            {errors.title ? (
              <ErrorMessage mt={0}>{errors.title.message}</ErrorMessage>
            ) : (
              <>
                <Spacer />
                <Spacer />
              </>
            )}
          </VStack>
        </FormControl>
        <FormControl
          display="flex"
          flexDirection={{ base: "row", md: "column" }}
          gap={{ base: "2xl", md: "md" }}
          maxW="2xl"
          isInvalid={!!errors.description}
        >
          <Label flexGrow={1}>内容</Label>
          <VStack w="auto">
            <Textarea
              w={{ base: "md", md: "full" }}
              placeholder="例）定例ミーティングです"
              autosize
              {...register("description")}
            />
            {errors.description ? (
              <ErrorMessage mt={0}>{errors.description.message}</ErrorMessage>
            ) : (
              <>
                <Spacer />
                <Spacer />
              </>
            )}
          </VStack>
        </FormControl>
        <FormControl
          display="flex"
          flexDirection={{ base: "row", md: "column" }}
          gap={{ base: "2xl", md: "md" }}
          maxW="2xl"
          isInvalid={!!errors.date}
        >
          <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <>
                <Label flexGrow={1} isRequired>
                  日付
                </Label>
                <VStack w="auto">
                  <DatePicker
                    locale="ja"
                    w={{ base: "md", md: "full" }}
                    placeholder="YYYY/MM/DD"
                    calendarProps={{
                      dayProps: {
                        component: ({ isSelected, date }) => (
                          <Text
                            as="span"
                            color={
                              isSelected
                                ? "white" // 選択状態の文字色
                                : date.getDay() === 6
                                  ? "blue.500" // 土曜日の文字色
                                  : undefined // デフォルト文字色
                            }
                            bgColor={isSelected ? "blue.500" : undefined}
                            display="inline-block"
                            textAlign="center"
                            w="full"
                            h="full"
                          >
                            {date.getDate()}
                          </Text>
                        ),
                      },
                    }}
                    {...field}
                  />

                  {errors.date ? (
                    <ErrorMessage mt={0}>{errors.date.message}</ErrorMessage>
                  ) : (
                    <>
                      <Spacer />
                      <Spacer />
                    </>
                  )}
                </VStack>
              </>
            )}
          />
        </FormControl>
        <FormControl
          display="flex"
          flexDirection={{ base: "row", md: "column" }}
          gap={{ base: "2xl", md: "md" }}
          maxW="2xl"
          isInvalid={!!errors.startTime}
        >
          <Label flexGrow={1} isRequired>
            開始時間
          </Label>
          <VStack w="auto">
            <Input
              type="time"
              w={{ base: "md", md: "full" }}
              placeholder="開始時間を入力"
              {...register("startTime")}
            />
            {errors.startTime ? (
              <ErrorMessage mt={0}>{errors.startTime.message}</ErrorMessage>
            ) : (
              <>
                <Spacer />
                <Spacer />
              </>
            )}
          </VStack>
        </FormControl>
        <FormControl
          display="flex"
          flexDirection={{ base: "row", md: "column" }}
          gap={{ base: "2xl", md: "md" }}
          maxW="2xl"
          isInvalid={!!errors.endTime}
        >
          <Label flexGrow={1}>終了時間</Label>
          <VStack w="auto">
            <Input
              type="time"
              w={{ base: "md", md: "full" }}
              placeholder="終了時間を入力"
              {...register("endTime")}
            />
            {errors.endTime ? (
              <ErrorMessage mt={0}>{errors.endTime.message}</ErrorMessage>
            ) : (
              <>
                <Spacer />
                <Spacer />
              </>
            )}
          </VStack>
        </FormControl>
        <FormControl
          display="flex"
          flexDirection={{ base: "row", md: "column" }}
          gap={{ base: "2xl", md: "md" }}
          maxW="2xl"
          isInvalid={!!errors.location}
        >
          <Label flexGrow={1}>場所</Label>
          <VStack w="auto">
            <Input
              type="text"
              w={{ base: "md", md: "full" }}
              placeholder="例）404教室"
              {...register("location")}
            />
            {errors.location ? (
              <ErrorMessage mt={0}>{errors.location.message}</ErrorMessage>
            ) : (
              <>
                <Spacer />
                <Spacer />
              </>
            )}
          </VStack>
        </FormControl>
        <FormControl
          display="flex"
          flexDirection={{ base: "row", md: "column" }}
          gap={{ base: "2xl", md: "md" }}
          maxW="2xl"
          isInvalid={!!errors.notes}
        >
          <Label flexGrow={1}>備考</Label>
          <VStack w="auto">
            <Textarea
              w={{ base: "md", md: "full" }}
              placeholder="備考欄"
              autosize
              {...register("notes")}
            />
            {errors.notes ? (
              <ErrorMessage mt={0}>{errors.notes.message}</ErrorMessage>
            ) : (
              <>
                <Spacer />
                <Spacer />
              </>
            )}
          </VStack>
        </FormControl>
        <Snacks snacks={snacks} />
        <Center gap="md" justifyContent="end">
          <Button
            as={Link}
            href={`/circles/${circleId || ""}/activities`}
            colorScheme="riverBlue"
          >
            キャンセル
          </Button>
          <Button type="submit" isLoading={isLoading} colorScheme="riverBlue">
            {mode === "create" ? "追加" : "更新"}
          </Button>
        </Center>
      </VStack>
    </VStack>
  )
}
