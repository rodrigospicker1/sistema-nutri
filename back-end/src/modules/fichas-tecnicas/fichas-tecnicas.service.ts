import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Alimento } from '../alimentos/schemas/alimento.schema.js';
import { GruposIncidenciaService } from '../alimentos/grupos-incidencia.service.js';
import { CreateFichaTecnicaDto } from './dto/create-ficha-tecnica.dto.js';
import { UpdateFichaTecnicaDto } from './dto/update-ficha-tecnica.dto.js';
import {
  baseLiquidaFicha,
  nutrientesDoAlimento,
  nutrientesPor100gPronto,
  nutrientesTotaisReceita,
  rendimentoPronto,
  totalBrutoFicha,
  type FichaPesavel,
  type IngredientePesavel,
  type Nutrientes100g,
} from './ficha-tecnica.domain.js';
import { FichaTecnica, type FichaTecnicaDocument } from './schemas/ficha-tecnica.schema.js';

interface IngredienteComAlimento extends IngredientePesavel {
  id?: string;
  alimentoId?: string;
  fatorCorrecao?: number;
  perCapitaBruto?: number;
  perCapitaLiquido?: number;
}

@Injectable()
export class FichasTecnicasService {
  constructor(
    @InjectModel(FichaTecnica.name) private readonly fichaModel: Model<FichaTecnica>,
    @InjectModel(Alimento.name) private readonly alimentoModel: Model<Alimento>,
    private readonly gruposService: GruposIncidenciaService,
  ) {}

  findAll(): Promise<FichaTecnicaDocument[]> {
    return this.fichaModel.find().sort({ nome: 1 }).exec();
  }

  async findOne(id: string): Promise<FichaTecnicaDocument> {
    const ficha = await this.fichaModel.findById(id).exec();
    if (!ficha) throw new NotFoundException('Ficha técnica não encontrada');
    return ficha;
  }

  async create(dto: CreateFichaTecnicaDto): Promise<FichaTecnicaDocument> {
    await this.assertGrupos(dto.gruposIncidenciaIds);
    return this.fichaModel.create(await this.payload(dto));
  }

  async update(id: string, dto: UpdateFichaTecnicaDto): Promise<FichaTecnicaDocument> {
    await this.assertGrupos(dto.gruposIncidenciaIds);
    const atual = await this.fichaModel.findById(id).exec();
    if (!atual) throw new NotFoundException('Ficha técnica não encontrada');
    const ficha = await this.fichaModel
      .findByIdAndUpdate(id, await this.payload(dto, atual), { new: true, runValidators: true })
      .exec();
    if (!ficha) throw new NotFoundException('Ficha técnica não encontrada');
    return ficha;
  }

  private async assertGrupos(ids: string[] | undefined): Promise<void> {
    if (!ids?.length) return;
    for (const grupoId of ids) {
      await this.gruposService.findOne(grupoId);
    }
  }

  /**
   * Monta o payload de gravação derivando todos os campos calculados:
   *
   * - `perCapitaBruto` do ingrediente = `perCapitaLiquido × fatorCorrecao`
   *   quando ambos estão presentes (fator default implícito = razão já
   *   gravada, senão 1,0);
   * - `totalLiquidoGramas` / `totalBrutoGramas` = somas da receita-base;
   * - `rendimentoTotalGramas` = `totalLiquido × fatorCoccao` — derivado,
   *   nunca editável (ver ficha-tecnica.domain.ts);
   * - `nutrientesTotaisReceita` = Σ (líquido/100) × nutriente100g do alimento;
   * - `nutrientesPor100gPronto` = totais ÷ rendimento × 100.
   */
  private async payload(
    dto: CreateFichaTecnicaDto | UpdateFichaTecnicaDto,
    atual?: FichaTecnicaDocument,
  ): Promise<Record<string, unknown>> {
    const dados: Record<string, unknown> = {};
    if (dto.nome !== undefined) dados.nome = dto.nome;
    if (dto.modoPreparo !== undefined) dados.modoPreparo = dto.modoPreparo;
    if (dto.fatorCoccao !== undefined) dados.fatorCoccao = dto.fatorCoccao;
    if (dto.porcoesEtapa !== undefined) dados.porcoesEtapa = dto.porcoesEtapa;
    if (dto.gruposIncidenciaIds !== undefined) {
      dados.gruposIncidenciaIds = dto.gruposIncidenciaIds.map((id) => new Types.ObjectId(id));
    }

    const ingredientes = this.ingredientesEfetivos(dto, atual);
    if (ingredientes) dados.ingredientes = ingredientes;

    const efetiva: FichaPesavel = {
      fatorCoccao: (dados.fatorCoccao ?? atual?.fatorCoccao) as number | undefined,
      ingredientes: (ingredientes ?? atual?.ingredientes ?? []) as FichaPesavel['ingredientes'],
    };

    dados.totalLiquidoGramas = baseLiquidaFicha(efetiva);
    dados.totalBrutoGramas = totalBrutoFicha(efetiva);
    const rendimento =
      rendimentoPronto(efetiva) ??
      (dto.rendimentoTotalGramas !== undefined
        ? dto.rendimentoTotalGramas
        : (atual?.rendimentoTotalGramas ?? undefined));
    if (rendimento !== undefined) dados.rendimentoTotalGramas = rendimento;

    const nutrientes = await this.calcularNutrientes(
      efetiva.ingredientes as IngredienteComAlimento[],
      rendimento ?? 0,
    );
    dados.nutrientesTotaisReceita = nutrientes.totais;
    dados.nutrientesPor100gPronto = nutrientes.por100g;

    return dados;
  }

  /**
   * Ingredientes efetivos da gravação: os do DTO com `perCapitaBruto`
   * derivado quando `perCapitaLiquido × fatorCorrecao` é computável.
   * O fator usado é o informado; sem ele, preserva o fator implícito
   * (bruto/líquido) já gravado; sem nenhum, assume 1,0.
   */
  private ingredientesEfetivos(
    dto: CreateFichaTecnicaDto | UpdateFichaTecnicaDto,
    atual?: FichaTecnicaDocument,
  ): IngredienteComAlimento[] | undefined {
    const fonte = dto.ingredientes ?? atual?.ingredientes;
    if (!fonte) return undefined;
    const anteriores = new Map(
      (atual?.ingredientes ?? []).map((item) => [item.id ?? item.alimentoId, item]),
    );
    return fonte.map((item) => {
      const dtoItem = item as IngredienteComAlimento;
      const anterior = dtoItem.id ? anteriores.get(dtoItem.id) : undefined;
      const liquido = dtoItem.perCapitaLiquido ?? anterior?.perCapitaLiquido;
      const fatorInformado = dtoItem.fatorCorrecao ?? anterior?.fatorCorrecao;
      let fator = fatorInformado;
      if (fator === undefined && liquido && liquido > 0) {
        const brutoAnterior = dtoItem.perCapitaBruto ?? anterior?.perCapitaBruto;
        if (brutoAnterior !== undefined) fator = brutoAnterior / liquido;
      }
      fator ??= 1;
      const perCapitaBruto =
        liquido !== undefined && liquido > 0
          ? Math.round(liquido * fator * 100) / 100
          : (dtoItem.perCapitaBruto ?? anterior?.perCapitaBruto ?? 0);
      return {
        ...dtoItem,
        perCapitaLiquido: liquido,
        fatorCorrecao: fator,
        perCapitaBruto,
      };
    });
  }

  /** Totais e nutrientes por 100 g pronto da receita-base efetiva. */
  private async calcularNutrientes(
    ingredientes: IngredienteComAlimento[],
    rendimentoTotalGramas: number,
  ): Promise<{ totais: Nutrientes100g; por100g: Nutrientes100g | Record<string, never> }> {
    const ids = [...new Set(ingredientes.map((item) => item.alimentoId).filter(Boolean))] as string[];
    const alimentos = ids.length
      ? await this.alimentoModel
          .find({ _id: { $in: ids.map((id) => new Types.ObjectId(id)) } })
          .exec()
      : [];
    const mapa = new Map<string, Nutrientes100g>(
      alimentos.map((alimento) => [
        alimento._id.toString(),
        nutrientesDoAlimento(alimento.composicaoNutricional),
      ]),
    );
    const totais = nutrientesTotaisReceita(ingredientes, mapa);
    const por100g = nutrientesPor100gPronto(totais, rendimentoTotalGramas);
    return { totais, por100g: por100g ?? {} };
  }
}
