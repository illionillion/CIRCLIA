import { db } from "@/utils/db"
import { hashPassword } from "@/utils/password"

const profileText = `
# 自己紹介

- *山田太郎*です。
- **趣味は読書です。**
- ~~ラーメンが好き~~
- 学籍番号は\`234201 \`


1. hello
2. world

\`\`\`json
{
    "message": "よろしく！！"
}
\`\`\`

> 引用以下

[GitHub](https://github.com/illionillion)
`

export const user = () =>
  db.user.createMany({
    data: [
      {
        id: "user1-uuid",
        studentNumber: "234201",
        name: "山田太郎",
        email: "yamada@email.com",
        password: hashPassword("password"),
        profileText,
      },
      {
        id: "user2-uuid",
        studentNumber: "234202",
        name: "山田花子",
        email: "yamada-hana@email.com",
        password: hashPassword("password"),
      },
      {
        id: "user3-uuid",
        studentNumber: "234203",
        name: "加古林檎",
        email: "ringo@email.com",
        password: hashPassword("password"),
      },
      {
        id: "user4-uuid",
        studentNumber: "",
        name: "講師1",
        email: "koushi1@email.com",
        password: hashPassword("password"),
        instructorFlag: true,
      },
      {
        id: "user5-uuid",
        studentNumber: "",
        name: "講師2",
        email: "koushi2@email.com",
        password: hashPassword("password"),
        instructorFlag: true,
      },
      {
        //ソート確認用
        id: "user6-uuid",
        studentNumber: "000006",
        name: "C",
        email: "c@email.com",
        password: hashPassword("password"),
      },
      {
        id: "user7-uuid",
        studentNumber: "000007",
        name: "B",
        email: "b@email.com",
        password: hashPassword("password"),
      },
      {
        id: "user8-uuid",
        studentNumber: "000008",
        name: "A",
        email: "a@email.com",
        password: hashPassword("password"),
      },
    ],
  })
