/**
 * Recalcula `dias[].data` dos cardápios MENSAL já gravados, aplicando a
 * regra atual: a semana 1 começa na primeira semana (seg–sex) que contém
 * dias do mês — antes, meses começando no fim de semana tinham uma semana
 * 1 inteira caindo no mês anterior.
 *
 * Uso:
 *   npx tsx scripts/fix-cardapio-datas.ts
 *
 * Variáveis:
 *   MONGO_URI (default mongodb://127.0.0.1:27018/sistema-nutri)
 */
import { MongoClient } from 'mongodb';
import { comDatasReais } from '../src/modules/cardapios/cardapios.service.js';
import type { DiaCardapio } from '../src/modules/cardapios/schemas/cardapio.schema.js';

const MONGO_URI = process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27018/sistema-nutri';

const client = new MongoClient(MONGO_URI);

try {
  await client.connect();
  const cardapios = client.db().collection('cardapios');
  const mensal = await cardapios
    .find({ tipo: 'MENSAL', mes: { $exists: true, $ne: null }, ano: { $exists: true, $ne: null } })
    .toArray();

  let alterados = 0;
  for (const cardapio of mensal) {
    const dias = cardapio.dias as DiaCardapio[];
    const novas = comDatasReais(dias, cardapio.mes as number, cardapio.ano as number);
    const mudou = novas.some((dia, indice) => {
      const antiga = dias[indice]?.data?.toISOString?.() ?? dias[indice]?.data;
      const nova = dia.data?.toISOString?.() ?? dia.data;
      return String(antiga ?? '') !== String(nova ?? '');
    });
    if (!mudou) continue;
    await cardapios.updateOne({ _id: cardapio._id }, { $set: { dias: novas } });
    alterados += 1;
    console.log(`  ${cardapio.nome} (${cardapio.mes}/${cardapio.ano}): datas recalculadas`);
  }
  console.log(`${mensal.length} cardápios mensais verificados, ${alterados} atualizados.`);
} finally {
  await client.close();
}
