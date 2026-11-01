import { ShopItem } from '../types/game';

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'bibendum_pack_1',
    characterId: 'bibendum',
    title: 'Bibendum Garaj Sövgü Paketi',
    description: 'Bibendum için efsanevi garaj ve lastik sövgüleri açar!',
    price: 15,
    icon: '🛞',
    unlockedQuotes: [
      'Lastiğimi patlatanın ceddini sikeyim!',
      'Bas bas teker yanıyor amk!',
      'Formula 1 pilotlarının anasını sikeyim!'
    ],
  },
  {
    id: 'baldi_pack_1',
    characterId: 'baldi',
    title: 'Baldi Cetvel Dayağı & Küfür Paketi',
    description: 'Baldi için ağır matematiksel sövgüler ve cetvel tehditleri!',
    price: 25,
    icon: '📐',
    unlockedQuotes: [
      'Kafana 30cm cetveli sokarım amk!',
      'Türev entegralinizi sikeyim!',
      'Tebrikler piç, tam puan aldın!'
    ],
  },
  {
    id: 'neighbor_pack_1',
    characterId: 'neighbor',
    title: 'Komşu Bodrum İşkence Paketi',
    description: 'Komşu için efsanevi bodrum sövgüleri ve bıyık tehditleri!',
    price: 30,
    icon: '🔑',
    unlockedQuotes: [
      'Bodrumda fantezi yaptırırım amk!',
      'Koca bıyığımı yala piç!',
      'Evime girenin anasını avradını sikeyim!'
    ],
  },
  {
    id: 'ultra_kings_pack',
    characterId: 'all',
    title: 'Efsanevi Sansürsüz Krallar Paketi',
    description: 'Tüm karakterler için en ağır, kahkaha garantili krallar kulübü sövgüleri!',
    price: 60,
    icon: '👑',
    unlockedQuotes: [
      'Ben böyle oyunun ızdırabını sikeyim!',
      'Çekirdek çitleyip alayınızın amına koyayım!',
      'Rekor kırıldı piçler, dağılın lan!'
    ],
  },
];
