const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting seed process...');

    // 기존 데이터 삭제
    console.log('Deleting existing data...');
    await prisma.comment.deleteMany();
    await prisma.article.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.user.deleteMany();

    // 사용자 생성
    console.log('Creating users...');
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

    const createdUsers = await Promise.all(
      usersData.map(userData => prisma.user.create({ data: userData })),
    );

    // 태그 생성
    console.log('Creating tags...');
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

    // 게시글 생성 (한 번에 5개씩)
    console.log('Creating articles...');
    for (let i = 1; i <= 30; i += 5) {
      const batchPromises = Array.from({ length: Math.min(5, 31 - i) }, (_, index) => {
        const j = i + index;
        const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
        const slug = `article-${j}-${Math.floor(Math.random() * 10000)}`;

        const tagCount = Math.floor(Math.random() * 3) + 1;
        const randomTags = [...createdTags].sort(() => 0.5 - Math.random()).slice(0, tagCount);

        return prisma.article.create({
          data: {
            slug,
            title: `Article Title ${j}`,
            description: `This is the description for article ${j}.`,
            body: `This is the detailed body content of article ${j}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
            author: {
              connect: { id: randomUser.id },
            },
            tagList: {
              connect: randomTags.map(tag => ({ id: tag.id })),
            },
          },
        });
      });

      await Promise.all(batchPromises);
      console.log(`Created articles ${i} to ${Math.min(i + 4, 30)}`);
    }

    console.log('Seed completed successfully');
  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  }
}

main()
  .catch(error => {
    console.error('Failed to seed database:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
