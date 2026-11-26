// Os 7 carros da Protrade, normalizados a partir dos anúncios reais (dados/carros.json, recolhidos a 26/11/2026).
import fs from 'node:fs';
import path from 'node:path';

export const RAIZ = path.resolve(import.meta.dirname, '..');

export interface Equip { grupo: string; itens: string[] }
export interface Carro {
  slug: string; marca: string; modelo: string; versao: string; nome: string;
  preco: number; negociavel: boolean; ano: number; mes: string; km: number;
  combustivel: string; cv: number; caixa: string; cor: string; segmento: string;
  portas: string; lugares: string; cilindrada: string; co2: string;
  garantia: string | null; destaques: string[]; equipamento: Equip[];
  fotos: string[]; nFotos: number; anuncio: string; capa: number;
}

// Slug curto, ordem no site (da mais vendável para a menos) e o que o próprio anúncio afirma.
// Garantia: só quando o campo do portal e a descrição dizem o mesmo (Corsa, 308 SW e Taigo têm 36 no campo e 18 no texto).
const CURADO: Record<string, { slug: string; ordem: number; garantia: string | null; destaques: string[]; capa?: number }> = {
  ID8Q1pWP: { slug: 'audi-a3-sportback-45-tfsie-s-line', ordem: 0, garantia: '18 meses', destaques: [
    'Primeiro proprietário', 'Manutenção na marca desde novo', 'IVA dedutível para empresas', 'Tributação autónoma reduzida',
    '74 km em modo elétrico na cidade (WLTP)', 'Baterias com garantia de 160 000 km ou 8 anos'] },
  ID8Q1pw0: { slug: 'vw-taigo-1-0-tsi-dsg-r-line', ordem: 1, garantia: null, destaques: ['Versão R-Line', 'Caixa automática DSG'] },
  ID8Q1pWR: { slug: 'audi-a3-sportback-30-tfsi-advanced', ordem: 2, garantia: '18 meses', destaques: [
    'Primeiro proprietário', 'Livro de revisões completo', 'Consumo médio de 5,1 l/100 km'] },
  ID8Q1pnL: { slug: 'peugeot-308-sw-130-eat8-active-pack', ordem: 3, garantia: null, destaques: [
    'Histórico de revisões na marca', 'Distribuição trocada recentemente', 'Caixa automática EAT8'] },
  ID8Q1mx3: { slug: 'peugeot-308-1-2-puretech-active-pack', ordem: 4, garantia: '18 meses', destaques: [
    'Primeiro proprietário', 'Revisões na marca', 'Entregue com revisão feita e distribuição trocada', 'Garantia Stellantis até 180 000 km ou 10 anos'], capa: 3 },
  ID8Q1pXu: { slug: 'opel-corsa-1-2-elegance', ordem: 5, garantia: null, destaques: ['Primeiro proprietário', 'Versão Elegance'] },
  ID8Q1mS7: { slug: 'peugeot-208-1-2-puretech-active-pack', ordem: 6, garantia: '18 meses', destaques: [
    'Primeiro proprietário', 'Revisões feitas na marca', 'Distribuição trocada', 'Em excelente estado geral'] },
};

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

export function carros(): Carro[] {
  const bruto = JSON.parse(fs.readFileSync(path.join(RAIZ, 'dados', 'carros.json'), 'utf8')) as any[];
  return bruto.map((c) => {
    const id = (c.slug as string).split('-').pop()!;
    const k = CURADO[id]; if (!k) throw new Error('carro sem curadoria: ' + id);
    const d = c.detalhes as Record<string, string>;
    const num = (s: string) => Number(String(s ?? '').replace(/[^\d]/g, ''));
    const nome = `${d['Marca']} ${d['Modelo']}`;
    return {
      slug: k.slug, marca: d['Marca'], modelo: d['Modelo'], versao: d['Versão'], nome,
      preco: c.preco, negociavel: c.negociavel, ano: num(d['Ano']), mes: d['Mês de Registo'] ?? '', km: num(d['Quilómetros']),
      combustivel: d['Combustível'], cv: num(d['Potência']), caixa: d['Tipo de Caixa'], cor: d['Cor'], segmento: d['Segmento'],
      portas: d['Nº de portas'] ?? '', lugares: d['Lotação'] ?? '', cilindrada: d['Cilindrada'] ?? '', co2: d['Emissões CO2'] ?? '',
      garantia: k.garantia, destaques: k.destaques,
      equipamento: (c.equipamento as Equip[]).filter((g) => g.itens.length),
      fotos: c.fotos as string[], nFotos: (c.fotos as string[]).length, anuncio: c.url, capa: k.capa ?? 0,
      _ordem: k.ordem,
    } as Carro & { _ordem: number };
  }).sort((a: any, b: any) => a._ordem - b._ordem);
}

const milhares = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
export const euros = (n: number) => milhares(n) + ' €';
export const kms = (n: number) => milhares(n) + ' km';
export { MESES };
