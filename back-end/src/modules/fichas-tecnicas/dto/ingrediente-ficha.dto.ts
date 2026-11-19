import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsMongoId, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class IngredienteFichaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ description: 'Identificador do alimento (hex)' })
  @IsMongoId()
  alimentoId: string;

  @ApiPropertyOptional({ minimum: 0, description: 'Derivado de perCapitaLiquido × fatorCorrecao quando ambos informados' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  perCapitaBruto?: number;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  perCapitaLiquido?: number;

  @ApiPropertyOptional({ minimum: 0, description: 'Fator de correção bruto ÷ líquido; com perCapitaLiquido deriva perCapitaBruto' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  fatorCorrecao?: number;
}
