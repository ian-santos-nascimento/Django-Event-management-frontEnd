export interface EventoType {
    id_evento: number,
    codigo_evento: number,
    nome: string,
    descricao: string,
    observacao: string,
    qtd_dias_evento: number,
    qtd_pessoas: number,
    data_inicio: string,
    data_fim: string,
    local: LocalType,
    clientes: ClienteType[]

}

export interface ComidaType {
    comida_id: number,
    nome: string,
    descricao: string
    valor: number,
    quantidade_minima: number
    tipo: string,
    subtipo: string,
}


interface LocalType {
    id_local: string,
    nome: string,
    endereco: string,
    telefone: string,
    email: string,
    observacoes: string,
    cidade: number
}

export interface ClienteType {
    id_cliente: number,
    cnpj: string,
    nome: string,
    taxa_financeira: number,
}

export interface OrcamentoType {
    id_orcamento: number,
    nome: string,
    observacoes: string,
    status: string,
    evento: EventoType,
    cliente: ClienteType,
    logisticas: Array<LogisticaOrcamentoType>;
    comidas: CardapioOrcamentoType[],
    valor_total: number,
    valor_total_logisticas: number,
    valor_total_comidas: number,
    valor_desconto_logisticas: number,
    valor_desconto_comidas: number,
    valor_imposto: number,
    valor_decoracao: number
}

export interface CardapioOrcamentoType {
    comida_id: number,
    comida: string,
    quantidade: number,
    valor: number

}

export interface LogisticaOrcamentoType {
    id: number;
    valor: number;
    quantidade: number;
    logistica: string
}


export interface LogisticaCidadeType {
    cidade: number,
    hospedagem: number,
    taxa_deslocamento: number,
    passagem: number,
    alimentacao: number,
    frete_terceiros: number,
    frete_proprio: number,
    frete_proprio_intervalo: number,
    frete_proprio_completo: number,
    diaria_completo: number,
    diaria_simples: number,
    logistica_lanches: number,
    logistica_lanches_grande: number,
}


export interface LogisticaType {
    id_logistica: number,
    nome: string,
    descricao: string,
    valor: number,
    tipo: string,
    in_sp: boolean,
}
