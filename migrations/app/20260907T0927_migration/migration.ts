#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/041acc5ce723271dced32ffb07373ca99c1507152a224ce256092b5d4737c209/contract';
import endContract from '../../snapshots/041acc5ce723271dced32ffb07373ca99c1507152a224ce256092b5d4737c209/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [];
  }
}

MigrationCLI.run(import.meta.url, M);
