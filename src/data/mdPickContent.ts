export interface MdPickProductRef {
  slug: string;
  caption: string;
}

export interface MdPickContent {
  key: string;
  heroImage: string;
  eyebrow: string;
  title: string;
  lead: string;
  essayTag: string;
  essayTitle: string;
  essayParagraphs: string[];
  briefingTitle: string;
  briefing: { label: string; text: string }[];
  products: MdPickProductRef[];
  closingQuote: string;
  ctaSlug: string;
}

export const MD_PICK_CONTENT: Record<string, MdPickContent> = {
  hiking: {
    key: 'hiking',
    heroImage: 'images/md-hiking-hero.png',
    eyebrow: 'MD PICK · HIKING',
    title: '높이 오를수록, 움직임은 가볍게',
    lead: '거친 암릉에서도 몸의 리듬을 잃지 않도록, 필요한 보호와 편안함만 담았습니다.',
    essayTag: 'WHY THIS LOOK',
    essayTitle: '산에서는 옷이 움직임을 따라야 합니다',
    essayParagraphs: [
      '산길에서는 걸음마다 움직임이 달라집니다. 큰 바위를 넘을 때는 팔과 무릎의 가동 범위가 넓어지고, 능선에 오르면 바람과 체온이 빠르게 변합니다. 그래서 좋은 산행 코디는 멋을 더하기 전에 몸이 자유롭게 움직일 여유를 만듭니다.',
      '화이트 스웨이 온더고 자켓은 주변에서 눈에 잘 띄면서도 몸에 부담을 주지 않는 가벼운 레이어입니다. 청록 하의는 자연의 색과 차분하게 어우러지고, 오르막에서도 하체의 움직임을 편안하게 이어줍니다.',
      '선글라스와 기능성 모자, 가벼운 배낭을 더하면 햇빛과 바람에 대응하는 준비가 완성됩니다. 정상에 도착하는 순간뿐 아니라, 오르는 모든 시간을 편안하게 만드는 코디입니다.',
    ],
    briefingTitle: '오늘의 암릉 산행 코디',
    briefing: [
      { label: 'WEATHER', text: '화이트 자켓으로 바람과 체온 변화에 대응하고 지퍼를 열어 빠르게 환기합니다.' },
      { label: 'MOVEMENT', text: '청록 하의의 신축성과 안정적인 허리선이 큰 보폭과 오르막 움직임을 돕습니다.' },
      { label: 'STYLE', text: '아이보리와 청록의 대비가 자연 속에서 선명하면서도 차분한 인상을 만듭니다.' },
    ],
    products: [
      { slug: 'sway-onthego-jacket', caption: '바람과 체온 변화에 대응하는 가벼운 첫 번째 레이어' },
      { slug: 'soft-jersey-leggings', caption: '큰 보폭에도 허리를 편안하게 감싸는 청록 하의' },
      { slug: 'cool-touch-sleeveless', caption: '자켓 안에서 땀과 열을 빠르게 정리하는 베이스 TOP' },
    ],
    closingQuote: '정상보다 중요한 것은, 오르는 동안 내 몸이 편안한가 하는 질문입니다.',
    ctaSlug: 'sway-onthego-jacket',
  },
  marathon: {
    key: 'marathon',
    heroImage: 'images/md-marathon-hero.png',
    eyebrow: 'MD PICK · MARATHON',
    title: '기록보다 오래 남는, 나만의 리듬',
    lead: '가볍게 지지하는 브라탑과 차분한 컬러의 조합으로 긴 호흡을 이어갑니다.',
    essayTag: 'WHY THIS LOOK',
    essayTitle: '오래 달릴수록 옷은 더 가벼워야 합니다',
    essayParagraphs: [
      '마라톤의 리듬은 출발선에서 완성되지 않습니다. 호흡이 깊어지고 땀이 흐르기 시작한 뒤에도 몸을 압박하지 않는 옷이 나만의 페이스를 끝까지 이어가게 합니다.',
      '시그니처 에어핏 브라탑은 넓은 밴드로 움직임을 안정적으로 지지하면서 어깨와 팔은 자유롭게 열어둡니다. 뮤트 퍼플 하의는 네이비와 블랙 중심의 러닝 룩에 MYUNGJA 특유의 부드러운 에너지를 더합니다.',
      '헤어밴드는 긴 머리를 안정적으로 정돈하고 스포츠 선글라스는 시야를 선명하게 지켜줍니다. 빠르게 보이기 위한 옷보다 실제로 오래 달릴 수 있는 옷, 그것이 오늘의 선택입니다.',
    ],
    briefingTitle: '오늘의 지속 가능한 러닝 코디',
    briefing: [
      { label: 'SUPPORT', text: '에어핏 브라탑이 가슴을 안정적으로 받치고 어깨 움직임은 자유롭게 유지합니다.' },
      { label: 'TEMPERATURE', text: '필요할 때 네이비 반집업을 더해 출발 전후의 체온을 섬세하게 조절합니다.' },
      { label: 'COLOR', text: '블랙·네이비에 뮤트 퍼플을 더해 강인함과 세련됨을 함께 표현합니다.' },
    ],
    products: [
      { slug: 'signature-airfit-bra', caption: '긴 러닝에서도 안정감을 유지하는 핵심 서포트' },
      { slug: 'breeze-crop-half-zip', caption: '출발 전후 체온 조절을 위한 네이비 레이어' },
      { slug: 'soft-jersey-leggings', caption: '리듬감 있는 컬러와 편안한 허리선을 갖춘 하의' },
    ],
    closingQuote: '조금 느려도 괜찮습니다. 나의 호흡으로 끝까지 달리는 것이 더 중요하니까요.',
    ctaSlug: 'signature-airfit-bra',
  },
  yoga: {
    key: 'yoga',
    heroImage: 'images/md-yoga-hero.png',
    eyebrow: 'MD PICK · YOGA',
    title: '균형은 힘이 아니라, 집중에서 시작됩니다',
    lead: '고난도 동작에서도 흐트러지지 않는 부드러운 지지력과 차분한 색의 균형.',
    essayTag: 'WHY THIS LOOK',
    essayTitle: '오롯이 몸의 가능성에 집중하도록',
    essayParagraphs: [
      '난도가 높은 자세일수록 옷의 작은 불편함도 크게 느껴집니다. 상의가 말려 올라가거나 허리선이 접히면 호흡과 시선이 흐트러집니다. 좋은 요가복은 존재감을 드러내기보다 동작 속에 자연스럽게 스며들어야 합니다.',
      '화이트 TOP은 상체의 움직임과 호흡을 깨끗하게 보여주고, 브라운 하의는 중심을 차분하게 잡아주는 색이 됩니다. 넓은 허리밴드와 부드러운 저지 소재는 깊은 스트레칭에서도 몸을 조이지 않습니다.',
      '에어리 니트 브라탑이나 소프트 캡슬리브를 더하면 수련 전후의 체온과 노출을 자연스럽게 조절할 수 있습니다. 오늘의 목표는 완벽한 자세가 아니라, 내 몸의 가능성을 더 세심하게 알아가는 것입니다.',
    ],
    briefingTitle: '오늘의 고난도 플로우 코디',
    briefing: [
      { label: 'BALANCE', text: '넓은 허리밴드가 중심을 안정적으로 잡아 한 발 균형 동작에 집중하도록 돕습니다.' },
      { label: 'FLEXIBILITY', text: '부드러운 저지와 충분한 신축성이 깊은 가동 범위에서도 당김을 줄입니다.' },
      { label: 'CALM', text: '오프화이트와 코코아 브라운의 조합이 시선을 정돈하고 차분한 집중을 만듭니다.' },
    ],
    products: [
      { slug: 'airy-knit-bra-top', caption: '부드러운 니트 조직으로 가볍게 받쳐주는 브라탑' },
      { slug: 'soft-jersey-leggings', caption: '깊은 동작에서도 복부를 편안하게 감싸는 하의' },
      { slug: 'soft-jersey-cap-sleeve-tee', caption: '수련 전후 자연스럽게 덧입는 소프트 레이어' },
    ],
    closingQuote: '몸을 밀어붙이기보다, 오늘 가능한 가장 깊은 호흡을 선택하세요.',
    ctaSlug: 'soft-jersey-leggings',
  },
};
