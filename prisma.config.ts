import 'dotenv/config';
import { definePrismaConfig } from '@prisma/cli-engine';
import { defineConfig as ormConfig } from '@prisma/orm-postgres/config';
import type { PrismaNextConfig } from '@prisma/orm-framework/config/config-types';

const orm: PrismaNextConfig<'sql', 'postgres'> = ormConfig({
  contract: './src/prisma/contract.prisma',
  db: {
    connection: process.env['DATABASE_URL']!,
  },
});

export default definePrismaConfig({ orm });
