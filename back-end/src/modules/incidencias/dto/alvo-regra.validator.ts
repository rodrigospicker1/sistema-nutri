import { BadRequestException } from '@nestjs/common';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { TipoAlvoIncidencia } from '../../../common/enums/index.js';

export function assertAlvoRegraIncidencia(
  tipoAlvo: TipoAlvoIncidencia,
  grupoIncidenciaId?: string | null,
  fichaTecnicaId?: string | null,
  alimentoId?: string | null,
): void {
  const mapa: Record<TipoAlvoIncidencia, boolean> = {
    GRUPO: Boolean(grupoIncidenciaId) && !fichaTecnicaId && !alimentoId,
    FICHA_TECNICA: Boolean(fichaTecnicaId) && !grupoIncidenciaId && !alimentoId,
    ALIMENTO: Boolean(alimentoId) && !grupoIncidenciaId && !fichaTecnicaId,
  };
  if (!mapa[tipoAlvo]) {
    throw new BadRequestException(`tipoAlvo ${tipoAlvo} exige exatamente o identificador correspondente preenchido`);
  }
}

@ValidatorConstraint({ name: 'alvoRegraIncidencia', async: false })
export class AlvoRegraConstraint implements ValidatorConstraintInterface {
  validate(_valor: unknown, args: ValidationArguments): boolean {
    const alvo = args.object as {
      tipoAlvo?: TipoAlvoIncidencia;
      grupoIncidenciaId?: string | null;
      fichaTecnicaId?: string | null;
      alimentoId?: string | null;
    };
    if (!alvo.tipoAlvo) return true;
    try {
      assertAlvoRegraIncidencia(
        alvo.tipoAlvo,
        alvo.grupoIncidenciaId ?? null,
        alvo.fichaTecnicaId ?? null,
        alvo.alimentoId ?? null,
      );
      return true;
    } catch {
      return false;
    }
  }

  defaultMessage(): string {
    return 'O tipoAlvo deve bater com um único identificador (grupo, ficha ou alimento)';
  }
}