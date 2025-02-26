const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 기존 데이터 삭제 (관계형 제약 조건에 따라 삭제 순서를 지켜야 함)
  await prisma.comment.deleteMany();
  await prisma.article.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.user.deleteMany();

  // 1. 3명의 사용자 생성
  const usersData = [
    {
      email: 'user1@example.com',
      username: 'user1',
      password: 'password1',
      bio: 'This is user 1 bio',
      image: undefined,
    },
    {
      email: 'user2@example.com',
      username: 'user2',
      password: 'password2',
      bio: 'This is user 2 bio',
      image: undefined,
    },
    {
      email: 'user3@example.com',
      username: 'user3',
      password: 'password3',
      bio: 'This is user 3 bio',
      image: undefined,
    },
  ];

  const createdUsers = await Promise.all(usersData.map(user => prisma.user.create({ data: user })));

  // 2. 10개의 태그 생성
  const tagNames = [
    'Tech',
    'Life',
    'Travel',
    'Food',
    'Health',
    'Business',
    'Education',
    'Science',
    'Entertainment',
    'Sports',
  ];

  const createdTags = await Promise.all(
    tagNames.map(name => prisma.tag.create({ data: { name } })),
  );

  // 3. 30개의 게시글 생성 (각 게시글은 랜덤한 작성자와 1~3개의 랜덤 태그를 가짐)
  const articlePromises = [];
  for (let i = 1; i <= 30; i++) {
    // 사용자 배열에서 랜덤으로 작성자 선택
    const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];

    // 고유한 slug 생성 (인덱스와 랜덤 숫자 활용)
    const slug = `article-${i}-${Math.floor(Math.random() * 10000)}`;

    // 1~3개의 태그를 랜덤하게 선택
    const tagCount = Math.floor(Math.random() * 3) + 1;
    const randomTags = [...createdTags].sort(() => 0.5 - Math.random()).slice(0, tagCount);

    articlePromises.push(
      prisma.article.create({
        data: {
          slug: slug,
          title: `Article Title ${i}`,
          description: `This is the description for article ${i}.`,
          body: `This is the detailed body content of article ${i}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
          author: {
            connect: { id: randomUser.id },
          },
          tagList: {
            connect: randomTags.map(tag => ({ id: tag.id })),
          },
        },
      }),
    );
  }

  await Promise.all(articlePromises);
}

main()
  .catch(error => {
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
