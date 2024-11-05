// @ts-ignore
import {ComidaType, LogisticaCidadeType} from "../types.tsx"
import {SUBCATEGORIAS_COMIDA, TIPO_COMIDA} from "../util/OptionList"

export default function verificarLogistica(cardapioSelecionado: ComidaType[], logisticaCidade: LogisticaCidadeType) {
    const temIntervaloDoce = cardapioSelecionado.some(item => item.tipo === "Intervalo_Doce");
    const temIntervaloSalgado = cardapioSelecionado.some(item => item.tipo === "Intervalo_Salgado");
    const temAlmoco = cardapioSelecionado.some(item => item.tipo === "Almoço");
    if (!temIntervaloDoce && !temIntervaloSalgado && !temAlmoco) {
        return {frete: logisticaCidade.frete_proprio, locomocao: logisticaCidade.diaria_simples};
    } else if (temIntervaloDoce || temIntervaloSalgado && !temAlmoco) {
        return {frete: logisticaCidade.frete_proprio_intervalo, locomocao: logisticaCidade.diaria_completo};
    } else if (temAlmoco) {
        return {frete: logisticaCidade.frete_proprio_completo, locomocao: logisticaCidade.diaria_completo};
    }

}

export function agruparComidasPorTipo(comidas) {
    // Mapeia subcategorias para categorias principais
    const subcategoriaToCategoria = {};
    Object.entries(SUBCATEGORIAS_COMIDA).forEach(([categoria, subcategorias]) => {
        subcategorias.forEach((subcategoria) => {
            subcategoriaToCategoria[subcategoria] = categoria;
        });
    });

    // Inicializa o objeto com todas as categorias
    const agrupadas = {};
    Object.keys(SUBCATEGORIAS_COMIDA).forEach((categoria) => {
        agrupadas[categoria] = [];
    });

    // Agrupa as comidas pelas categorias principais
    comidas.forEach((comida) => {
        const subcategoria = comida.subtipo; // Supondo que 'subtipo' é a subcategoria da comida
        const categoria = subcategoriaToCategoria[subcategoria] || 'Outros';
        agrupadas[categoria].push(comida);
    });

    return agrupadas;
}