import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'funcaoValidator', async: false })
export class FuncaoValidator implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments) {
    const obj = args.object as any;

    if (obj.roleProfileType === 'MASTER') {
      return ['FINANCEIRO', 'COMERCIAL', 'TI_SUPORTE'].includes(value);
    }

    if (obj.roleProfileType === 'LABORATORY') {
      return [
        'ATENDENTE',
        'TRIAGEM',
        'TECNICO_LABORATORIO',
        'BIOQUIMICO',
      ].includes(value);
    }

    return true;
  }

  defaultMessage() {
    return 'funcao has an invalid value for the selected role profile type';
  }
}
