export const ESTADOS_BRASILEIROS = [
    {sigla: "AC", nome: "Acre"},
    {sigla: "AL", nome: "Alagoas"},
    {sigla: "AP", nome: "Amapá"},
    {sigla: "AM", nome: "Amazonas"},
    {sigla: "BA", nome: "Bahia"},
    {sigla: "CE", nome: "Ceará"},
    {sigla: "DF", nome: "Distrito Federal"},
    {sigla: "ES", nome: "Espírito Santo"},
    {sigla: "GO", nome: "Goiás"},
    {sigla: "MA", nome: "Maranhão"},
    {sigla: "MT", nome: "Mato Grosso"},
    {sigla: "MS", nome: "Mato Grosso do Sul"},
    {sigla: "MG", nome: "Minas Gerais"},
    {sigla: "PA", nome: "Pará"},
    {sigla: "PB", nome: "Paraíba"},
    {sigla: "PR", nome: "Paraná"},
    {sigla: "PE", nome: "Pernambuco"},
    {sigla: "PI", nome: "Piauí"},
    {sigla: "RJ", nome: "Rio de Janeiro"},
    {sigla: "RN", nome: "Rio Grande do Norte"},
    {sigla: "RS", nome: "Rio Grande do Sul"},
    {sigla: "RO", nome: "Rondônia"},
    {sigla: "RR", nome: "Roraima"},
    {sigla: "SC", nome: "Santa Catarina"},
    {sigla: "SP", nome: "São Paulo"},
    {sigla: "SE", nome: "Sergipe"},
    {sigla: "TO", nome: "Tocantins"},
];

export const TIPO_LOGISTICA = [
    'Pessoa', 'Material'
]

export const TIPO_EVENTO = [
    'Almoços e Coffees', 'Box, Cestas e Encomendas', 'Congressos', 'Feiras', 'Sociais'
]

export const TIPO_COMIDA = [
    'Intervalo_Doce', 'Intervalo_Salgado', 'Acompanhamentos', 'Bebidas', 'Almoço', 'Embalagens_e_Personalizacao', 'Terceirizados', 'Itens_Hotel'
]
export const SUBCATEGORIAS_COMIDA = {
    Bebidas: ['Bebidas Quentes', 'Bebidas Frias'],
    Acompanhamentos: ['Acompanhamentos Básicos', 'Acompanhamentos Diferenciados'],
    Intervalo_Doce: [
        'Bolos',
        'Doces de Padaria',
        'Doces Caseiros',
        'Tortas e Sobremesas',
        'Mini Doces e Brigadeiros',
        'Saudáveis',
        'Sorvetes e Açaís',
        'Pipocas',
        'Churros',
        'Festivais',
        'Complementos e Acompanhamentos',
        'Tapiocas Doces',
        'Crepiocas Doces',
        'Outros'
    ],
    Intervalo_Salgado: [
        'Empanadas',
        'Esfihas',
        'Folhados - Tamanho 6cm',
        'Mini Sanduíches - Período Manhã',
        'Mini Sanduíches - Período Tarde',
        'Mini Quiches - Tradicionais ou Integrais',
        'Pastéis',
        'Tarteletes',
        'Tortas da Nonna',
        'Tortinhas - Tradicionais ou Integrais',
        'Trouxinhas Folhadas – Tamanho 6cm',
        'Tortilhas Espanholas',
        'Paninnis',
        'Muffin Salgado',
        'Ovos',
        'Pipocas',
        'Pães Caseiros – Individuais',
        'Pães Caseiros – Inteiros',
        'Pães de Queijo',
        'Pastas e Terrines',
        'Tapiocas Salgadas',
        'Crepiocas Salgadas',
        'Crudites',
        'Outros'
    ],
    Almoço: [
        'Cremes e Caldos',
        'Saladas',
        'Massas Secas',
        'Massas Recheadas',
        'Aves',
        'Bovinos',
        'Suínos',
        'Peixes',
        'Pratos Únicos',
        'Tortas, Quiches e Strudel',
        'Risotos',
        'Acompanhamentos',
        'Hamburgueres e Hot Dogs',
        'Sanduíches Frios – Tamanho Almoço',
        'Sanduíches Quentes – Tamanho Almoço',
        'Batatas Recheadas',
        'Crepe Francês',
        'Festivais',
        'Outros'
    ],
    Embalagens_e_Personalizacao: [
        'Descartáveis',
        'Etiquetas, cintas e adesivos',
        'Personalização'
    ],
    Terceirizados: [
        'Bebidas Não Alcoólicas',
        'Doces e Salgados',
        'Sorvetes e Picolés',
        'Bebidas Alcoólicas',
        'Frete'
    ],
    Itens_Hotel: [
        'Acompanhamentos de Café',
        'Intervalo Doce',
        'Intervalo Salgado',
        'Almoço',
        'Taxas',
        'Kit Lanche'
    ]
};


export const STATUS_ORCAMENTO = [
    {value: 'Criado', name: 'Criado'},
    {value: 'Aprovado', name: 'Aprovado'},
    {value: 'Declinado', name: 'Declinado'},
    {value: 'Alteracao 1', name: 'Alteração 1'},
    {value: 'Alteracao 2', name: 'Alteração 2'},
    {value: 'Alteracao 3', name: 'Alteração 3'},
    {value: 'Alteracao 4', name: 'Alteração 4'},
    {value: 'Alteracao 5', name: 'Alteração 5'},
    {value: 'Alteracao 6', name: 'Alteração 6'},
    {value: 'Alteracao 7', name: 'Alteração 7'},
    {value: 'Alteracao 8', name: 'Alteração 8'},
    {value: 'Alteracao 9', name: 'Alteração 9'},
    {value: 'Alteracao 10', name: 'Alteração 10'},
    {value: 'Alteracao 11', name: 'Alteração 11'},
    {value: 'Alteracao 12', name: 'Alteração 12'},
    {value: 'Alteracao 13', name: 'Alteração 13'},
    {value: 'Alteracao 14', name: 'Alteração 14'},
    {value: 'Alteracao 15', name: 'Alteração 15'},
    {value: 'Alteracao 16', name: 'Alteração 16'},
    {value: 'Alteracao 17', name: 'Alteração 17'},
    {value: 'Alteracao 18', name: 'Alteração 18'},
    {value: 'Alteracao 19', name: 'Alteração 19'},
    {value: 'Alteracao 20', name: 'Alteração 20'},
];