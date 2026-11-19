import type {
  CalendarioDiaNutricao,
  ContagemAlunosErudio,
  EtapaNutricao,
  MatriculaAlunoErudio,
  TurnoNutricao,
  UnidadeEnsinoNutricao,
  UsuarioNutricao,
} from '../../src/mocks/erudio.mock'

const ERUDIO_SME_INSTITUICAO_ID = 16138

let apiBaseUrl = 'http://localhost:3000'

function configurarApiBase() {
  const config = useRuntimeConfig()
  apiBaseUrl = String(config.public.apiBase ?? apiBaseUrl)
}

async function api<T>(caminho: string): Promise<T> {
  return $fetch<T>(`${apiBaseUrl}/erudio${caminho}`)
}

export function useErudioMock() {
  configurarApiBase()
  const unidades = useState<UnidadeEnsinoNutricao[]>('erudio-unidades', () => [])
  const etapas = useState<EtapaNutricao[]>('erudio-etapas', () => [])
  const turnos = useState<TurnoNutricao[]>('erudio-turnos', () => [])
  const contagem = useState<ContagemAlunosErudio[]>('erudio-contagem', () => [])
  const matriculas = useState<MatriculaAlunoErudio[]>('erudio-matriculas', () => [])
  const calendario = useState<CalendarioDiaNutricao[]>('erudio-calendario', () => [])
  const usuarios = useState<UsuarioNutricao[]>('erudio-usuarios', () => [])

  async function recarregar() {
    const [u, e, t, c, m, cal, us] = await Promise.all([
      api<UnidadeEnsinoNutricao[]>('/unidades'),
      api<EtapaNutricao[]>('/etapas'),
      api<TurnoNutricao[]>('/turnos'),
      api<ContagemAlunosErudio[]>('/contagem-alunos'),
      api<MatriculaAlunoErudio[]>('/matriculas'),
      api<CalendarioDiaNutricao[]>('/calendario'),
      api<UsuarioNutricao[]>('/usuarios'),
    ])
    unidades.value = u
    etapas.value = e
    turnos.value = t
    contagem.value = c
    matriculas.value = m
    calendario.value = cal
    usuarios.value = us
  }

  const nutricionistas = computed(() => usuarios.value.filter((usuario) => usuario.perfil === 'NUTRICIONISTA'))

  function nomeUnidade(id: number): string {
    return unidades.value.find((unidade) => unidade.erudioUnidadeEnsinoId === id)?.nomeCompleto ?? `Unidade ${id}`
  }

  function nomeEtapa(id: number): string {
    return etapas.value.find((etapa) => etapa.erudioEtapaId === id)?.nome ?? `Etapa ${id}`
  }

  function diaNaData(erudioUnidadeEnsinoId: number | null, data: string): CalendarioDiaNutricao | undefined {
    const daUnidade = calendario.value.find((dia) => dia.data === data && dia.erudioUnidadeEnsinoId === erudioUnidadeEnsinoId)
    if (daUnidade) return daUnidade
    if (erudioUnidadeEnsinoId == null || erudioUnidadeEnsinoId === ERUDIO_SME_INSTITUICAO_ID) return undefined
    return calendario.value.find((dia) => dia.data === data && dia.erudioUnidadeEnsinoId === null)
  }

  return {
    unidades,
    etapas,
    turnos,
    contagem,
    matriculas,
    calendario,
    usuarios,
    nutricionistas,
    nomeUnidade,
    nomeEtapa,
    diaNaData,
    recarregar,
  }
}
