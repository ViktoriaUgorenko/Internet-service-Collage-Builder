import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seed script запущен. Встроенные шаблоны теперь хранятся локально в клиенте.');
  console.log('Этот скрипт больше не создает системные шаблоны в БД.');
  console.log('Для создания пользовательских шаблонов используйте интерфейс редактора.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
