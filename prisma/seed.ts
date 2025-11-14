import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Создание тестовых товаров
  const products = [
    {
      name: 'VRT SHIRT 001',
      code: 'RV-W-002',
      price: 6800,
      category: 'Унисекс',
      fit: 'Обычная',
      sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
      colors: JSON.stringify(['#006341', '#FFFFFF']),
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { code: product.code },
      update: {
        name: product.name,
        price: product.price,
        category: product.category,
        fit: product.fit,
        sizes: product.sizes,
        colors: product.colors,
      },
      create: product,
    });
  }

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

