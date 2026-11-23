/**
 * Migra todas as collections do Mongo local para o Atlas.
 *
 * Uso:
 *   ATLAS_URI="mongodb+srv://user:pass@cluster0.xxx.mongodb.net/sistema-nutri" \
 *   npx tsx scripts/migrate-to-atlas.ts
 *
 * Variáveis:
 *   LOCAL_URI  (default mongodb://127.0.0.1:27018/sistema-nutri)
 *   ATLAS_URI  (obrigatória)
 *
 * ATENÇÃO: apaga as collections de destino antes de copiar ( Atlas deve estar
 * vazio ou ser um banco de destino dedicado ).
 */
import { MongoClient } from 'mongodb';

const LOCAL_URI = process.env.LOCAL_URI ?? 'mongodb://127.0.0.1:27018/sistema-nutri';
const ATLAS_URI = process.env.ATLAS_URI;

if (!ATLAS_URI) {
  console.error('Defina ATLAS_URI com a connection string do Atlas.');
  process.exit(1);
}

const local = new MongoClient(LOCAL_URI);
const atlas = new MongoClient(ATLAS_URI);

try {
  await Promise.all([local.connect(), atlas.connect()]);
  const dbOrigem = local.db();
  const dbDestino = atlas.db();

  const collections = await dbOrigem.listCollections().toArray();
  console.log(`${collections.length} collections no banco de origem (${dbOrigem.databaseName})`);

  for (const { name } of collections) {
    if (name.startsWith('system.')) continue;
    const docs = await dbOrigem.collection(name).find().toArray();
    await dbDestino.collection(name).drop().catch(() => {});
    if (docs.length > 0) {
      await dbDestino.collection(name).insertMany(docs);
    }
    console.log(`  ${name}: ${docs.length} documentos`);
  }

  console.log('Migração concluída.');
} finally {
  await Promise.allSettled([local.close(), atlas.close()]);
}
