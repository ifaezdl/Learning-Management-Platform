const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function run() {
  const u = await prisma.users.findFirst({ where: { Role_Id: 1 }, select: { Id:true, Email:true, UserName:true } });
  console.log(JSON.stringify(u));
  await prisma.$disconnect();
}
run().catch(console.error);
