import { registerDecorator, type ValidationOptions } from 'class-validator';

export function MesesSafraUnicos(validationOptions?: ValidationOptions): PropertyDecorator {
  return (object: object, propertyName: string | symbol) => {
    if (typeof propertyName !== 'string') {
      return;
    }
    registerDecorator({
      name: 'mesesSafraUnicos',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (!Array.isArray(value)) {
            return true;
          }
          const meses = value.map((item) =>
            item !== null && typeof item === 'object' && 'mes' in item ? item.mes : undefined,
          );
          return new Set(meses).size === meses.length;
        },
        defaultMessage() {
          return 'safraMensal não pode repetir o mesmo mês';
        },
      },
    });
  };
}
