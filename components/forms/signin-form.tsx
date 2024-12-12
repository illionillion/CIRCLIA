//signin/page.tsxからuse clientの分離

"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  Button,
  Center,
  Container,
  FormControl,
  Heading,
  Input,
  Text,
  useBoolean,
  VStack,
} from "@yamada-ui/react"
import { signIn } from "next-auth/react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { signin } from "@/actions/auth/signin"
import { SigninSchema } from "@/schema/auth"
import type { SigninForm } from "@/schema/auth"

export const LoginForm = () => {
  const [isLoading, { on: start, off: end }] = useBoolean()
  const [error, setError] = useState("")
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SigninForm>({
    resolver: zodResolver(SigninSchema),
  })

  const onSubmit = async (values: SigninForm) => {
    start()
    setError("")
    const result = await signin(values)
    if (result?.error) {
      setError(result.error)
      end()
    }
  }

  return (
    <Container m="auto" maxW="4xl" w="full" h="100dvh" as={Center}>
      <VStack as="form" onSubmit={handleSubmit(onSubmit)}>
        <Center>
          <Heading
            fontSize="7xl"
            color="black"
            _firstLetter={{ color: "#35B0D2" }}
            fontWeight="light"
            textShadow="1px 1px 0 #fff,2px 2px 0 #666,3px 3px 0 #666"
          >
            CIRCLIA
          </Heading>
        </Center>
        <FormControl
          label="メールアドレス"
          isInvalid={!!errors.email}
          errorMessage={errors.email ? errors.email.message : undefined}
        >
          <Input
            type="text"
            {...register("email")}
            placeholder="sample@email.com"
          />
        </FormControl>
        <FormControl
          label="パスワード"
          isInvalid={!!errors.password}
          errorMessage={errors.password ? errors.password.message : undefined}
        >
          <Input
            type="password"
            {...register("password")}
            placeholder="パスワード"
          />
        </FormControl>
        {error ? <Text color="danger">{error}</Text> : undefined}
        <Center as={VStack}>
          <Button
            type="submit"
            colorScheme="primary"
            width="90%"
            loading={isLoading}
            mt={6}
            bgGradient="linear(to-r, teal.400, blue.500)"
            _hover={{
              bgGradient: "linear(to-r, teal.600, blue.700)",
              transform: "scale(1.05)",
            }}
            color="white"
            boxShadow="0px 4px 15px rgba(0, 0, 0, 0.2)"
            fullRounded
            transition="all 0.3s ease"
          >
            サインイン
          </Button>
          <Button
            colorScheme="purple"
            onClick={() => signIn("microsoft-entra-id")}
          >
            Microsoftアカウントでサインイン
          </Button>
        </Center>
      </VStack>
    </Container>
  )
}
