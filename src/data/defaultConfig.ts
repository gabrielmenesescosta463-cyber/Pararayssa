import { RelationshipConfig } from '../types';

export const DEFAULT_CONFIG: RelationshipConfig = {
  partnerName: 'Rayssa',
  photoHeaderTitle: 'Feliz Um Ano de Namoro!',
  // Configured date: 24 de setembro de 2025 às 17:00 (5h da tarde)
  startDate: '2025-09-24T17:00:00',
  displayDateText: '24 setembro 2025',
  declarationSubtitle: 'Eu te amo há:',
  photoUrl: '', // Will default to the generated image asset or fallback
  scratchPhotoUrl: '', // Will default to romantic couple photo or custom photo
  scratchPhotoOffsetY: 14, // Lowered inside heart belly so faces show
  letterGreeting: 'Meu amor,',
  letterParagraphs: [
    'Hoje completamos 11 meses juntos! A cada dia que passa, mais nos aproximamos de completar 1 ano juntos, o que me deixa muito feliz, pois adoro fazer o melhor possível para o nosso relacionamento. Acho que em todas as cartinhas e mensagens que escrevi para você, nunca consegui demonstrar o meu real amor. Acredito que as palavras não sejam suficientes para expressar o que sinto, mas de uma coisa eu sei, vejo meu amor cada vez mais forte por você, o que me deixa ainda mais apaixonado, me encanto pelos seus pequenos gestos de bondade, sua preocupação e sua atenção. Não imaginava que você seria uma pessoa tão maravilhosa quanto é agora. Vejo que descobri melhor a sua pessoa e a adoro isso, adoro abraçá-la, beijá-la e amá-la. Que seja assim pelo resto da vida e pelo tempo que Deus abençoar e permitir!',
    'Obrigado por ser essa pessoa tão querida e amada em minha vida!',
    'Te amo meu amor, infinitamente e incondicionalmente.'
  ],
  letterClosing: '',
  letterEmojis: '🥰🥰💖💓💗💖💓',
  musicEnabled: true,
  floatingHeartsEnabled: true,
};
