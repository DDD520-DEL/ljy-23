import { useState } from 'react';
import { 
  BookOpen, ChevronDown, ChevronUp, Clock, Percent, Refrigerator,
  Milk, Croissant, Candy, Coffee, Fish, Snowflake, UtensilsCrossed, Apple,
  Sparkles, Target, Lightbulb, ArrowUp, Compass, ScrollText
} from 'lucide-react';

interface CategoryGuide {
  id: string;
  name: string;
  icon: typeof Milk;
  color: string;
  badgeClass: string;
  discountRules: string[];
  bestTiming: string[];
  storageTips: string[];
  proTips: string[];
}

const categoryGuides: CategoryGuide[] = [
  {
    id: 'dairy',
    name: '乳制品',
    icon: Milk,
    color: '#60A5FA',
    badgeClass: 'stamp-blue',
    discountRules: [
      '距过期7天开始打折，通常5-7折起',
      '距过期3天内降至3-5折，是入手黄金期',
      '大包装（1L以上）折扣力度更大，降幅可达60%-70%',
      '酸奶类临期时最划算，保质期短但口感变化极小',
      '芝士、黄油等发酵乳制品折扣相对保守，4-6折较多'
    ],
    bestTiming: [
      '超市每日晚间 20:00-22:00 集中贴新折扣标',
      '周末促销日（周五-周日）叠加会员折扣最划算',
      '新品上市前1-2周，老款清仓折扣最大',
      '节假日后第一天，节日礼盒装巨折清仓'
    ],
    storageTips: [
      '牛奶临期后建议煮沸后饮用，可延长2-3天',
      '酸奶可冷冻保存，解冻后口感略有变化但不影响食用',
      '芝士开封后用蜡纸包裹冷藏，勿用保鲜膜直接接触',
      '黄油可切块分装冷冻，保质期延长至6个月',
      '注意：胀包、分层、异味的乳制品即使未过期也勿食用'
    ],
    proTips: [
      '临期酸奶是做烘焙、奶昔、沙拉的绝佳原料',
      '大盒牛奶临期可分装制成酸奶、双皮奶等再加工品',
      '马苏里拉芝士临期冷冻保存，做披萨完全不影响'
    ]
  },
  {
    id: 'bakery',
    name: '烘焙糕点',
    icon: Croissant,
    color: '#D97706',
    badgeClass: 'stamp-amber',
    discountRules: [
      '面包类当日未售通常18:00后开始5折',
      '蛋糕类距过期2天降至4-6折，当天过期3折起',
      '盒装点心、月饼等节日商品节后折扣可达2-3折',
      '进口烘焙品保质期标注严格，实际可食用期更长',
      '现烤面包打折力度最大，包装面包相对保守'
    ],
    bestTiming: [
      '面包区：每日 18:00-20:00 第一轮折扣，21:00 后第二轮',
      '蛋糕柜：晚上 19:30 开始降价，闭店前捡漏最划算',
      '节后首日：中秋、圣诞、情人节后礼盒装狂降',
      '新品试销失败品：不定期出现，需经常关注'
    ],
    storageTips: [
      '切片面包冷冻保存，吃前用烤箱或面包机复烤如新',
      '奶油蛋糕冷藏不超过24小时，建议当日食用',
      '硬质面包（法棍、吐司）冷冻可保存1-2个月',
      '含肉松、火腿肠的调理面包易变质，优先食用',
      '解冻面包勿用微波炉，会使面包变干发硬'
    ],
    proTips: [
      '临期吐司切丁烘干做面包糠，或做法式吐司',
      '变硬的法棍切片做蒜蓉面包、面包布丁完美复活',
      '奶油蛋糕临期可分离奶油做慕斯或奶盖'
    ]
  },
  {
    id: 'snacks',
    name: '零食糖果',
    icon: Candy,
    color: '#C026D3',
    badgeClass: 'stamp-red',
    discountRules: [
      '膨化食品临期前1个月开始3-5折',
      '巧克力类夏季折扣最多（怕融化），可达2-4折',
      '进口零食临期折扣普遍比国产大，3折起步常见',
      '节日限定款（如圣诞、春节糖果）节后1-2折清仓',
      '礼盒装临期折扣远大于散装，包装成本让让步更多'
    ],
    bestTiming: [
      '每年5-8月：巧克力专区进入清仓季，大量折扣',
      '节后1-3天：节日糖果、礼盒装最低价',
      '超市盘点前（月末/季末）：囤货零食大量出清',
      '新品上市后2-3周：老款临期集中打折'
    ],
    storageTips: [
      '巧克力建议冷藏或阴凉处保存，避免阳光直射',
      '膨化食品开封后用密封夹封好，保持脆感',
      '坚果类临期后若有哈喇味即使未过期也不要吃',
      '软糖、果冻冷藏后口感更佳，还能延长保存期',
      '饼干受潮可放入烤箱低温烘烤几分钟恢复脆感'
    ],
    proTips: [
      '临期巧克力做烘焙原料、热巧克力完全不影响',
      '大包装零食分装冷冻，随吃随取保持新鲜',
      '临期坚果打碎做烘焙配料、坚果酱，物尽其用'
    ]
  },
  {
    id: 'beverages',
    name: '饮料饮品',
    icon: Coffee,
    color: '#16A34A',
    badgeClass: 'stamp-green',
    discountRules: [
      '瓶装水、碳酸饮料临期前1-2个月4-6折',
      '果汁、茶饮类临期前3个月开始降价，折扣3-5折',
      '含乳饮料临期折扣最大，可达2-3折',
      '进口酒水、精酿啤酒保质期标注严格，实际可存更久',
      '功能饮料、咖啡饮料折扣稳定在4-6折区间'
    ],
    bestTiming: [
      '换季时：夏季饮品入秋后开始大规模清仓',
      '节日后：年货饮料礼盒节后狂降',
      '新包装换版时：老包装2-3折清货',
      '超市进货日前后：旧批次优先出清'
    ],
    storageTips: [
      '开封后的果汁必须冷藏，24-48小时内喝完',
      '碳酸饮料勿冷冻，会爆裂；冷藏口感最佳',
      '纯果汁临期可用来做冰棒、果冻、水果茶',
      '啤酒冷藏延长保质期，但注意勿结冰',
      '含气饮料开盖后拧紧瓶盖倒放，可延长气感'
    ],
    proTips: [
      '临期纯果汁做冰棒、冰沙，夏日消暑神器',
      '过期啤酒（未变质）可做啤酒鸭、啤酒面包',
      '快过期的牛奶/酸奶加水果打奶昔，完全尝不出差别'
    ]
  },
  {
    id: 'meat-seafood',
    name: '肉类海鲜',
    icon: Fish,
    color: '#DC2626',
    badgeClass: 'stamp-red',
    discountRules: [
      '冷鲜肉当日未售下午开始5-7折，闭店前可至3折',
      '海鲜类临期前1天开始打折，折扣力度5-7折',
      '冷冻肉临期前1个月4-6折，大品牌品质更有保障',
      '熟食卤味当日闭店前3-5折，是性价比之王',
      '进口肉类/海鲜清仓折扣比国产更大，品质稳定'
    ],
    bestTiming: [
      '超市闭店前 1-2 小时：冷鲜区黄金捡漏时间',
      '工作日晚间：上班族少，竞争小，折扣多',
      '台风/暴雨天前：超市大量出清冷鲜品防变质',
      '节假日前夕：备货量大会有少量余货清仓'
    ],
    storageTips: [
      '冷鲜肉买回后立即分装冷冻，可保存1-3个月',
      '海鲜类临期品建议当日食用，不要再存放',
      '熟卤味冷藏不超过24小时，食用前可加热',
      '冷冻肉类解冻后勿再次冷冻，影响口感和安全',
      '肉色发暗、有异味、黏手的肉类立即丢弃勿食用'
    ],
    proTips: [
      '临期冷鲜肉切块做红烧肉、炖菜，长时间炖煮更安全',
      '虾仁类临期冷冻保存，做菜完全不影响',
      '熟食卤味买回家立即分装冷藏，分顿食用'
    ]
  },
  {
    id: 'frozen',
    name: '冷冻食品',
    icon: Snowflake,
    color: '#0891B2',
    badgeClass: 'stamp-blue',
    discountRules: [
      '冷冻水饺/汤圆临期前2-3个月开始4-6折',
      '冷冻面点（包子、馒头）临期折扣稳定在3-5折',
      '冷冻调理食品（炸鸡排、薯条）临期3-5折',
      '冰淇淋临期前1-2个月折扣最多，夏季捡漏超划算',
      '进口冷冻品清仓折扣大，品质相对更有保障'
    ],
    bestTiming: [
      '超市盘点日：冷冻品需要大量翻库，临期货集中出',
      '换季时节：夏季冰淇淋冬季冷冻面点交替清仓',
      '新品导入期：同品类老款打折让位',
      '冷冻柜维修/调架前：所有库存清仓折扣'
    ],
    storageTips: [
      '冷冻食品保持-18°C以下保存，温度波动影响品质',
      '冰淇淋解冻后再冷冻会产生冰渣，建议一次吃完',
      '冷冻水饺等包装袋破损要尽快食用，避免冻伤',
      '冷冻蔬果比新鲜蔬果更耐放，营养流失少',
      '注意：冷冻链中断过的食品即使未过期也需谨慎'
    ],
    proTips: [
      '临期冰淇淋做奶昔、冰淇淋蛋糕、雪花冰完美',
      '冷冻面点囤货做早餐，性价比超高',
      '冷冻薯条、鸡块买回家直接丢烤箱，方便快捷'
    ]
  },
  {
    id: 'seasoning',
    name: '调味品酱料',
    icon: UtensilsCrossed,
    color: '#CA8A04',
    badgeClass: 'stamp-amber',
    discountRules: [
      '酱油、醋等发酵调味品临期前3-6个月5-7折',
      '沙拉酱、番茄酱等含乳/蛋酱料临期前2个月4-6折',
      '进口香料、调料清仓折扣最大，可达2-4折',
      '大包装餐饮装临期折扣远大于家庭装',
      '火锅底料、复合调味料临期前2-3个月3-5折'
    ],
    bestTiming: [
      '火锅季结束后（春季）：底料、蘸料大量清仓',
      '春节后：礼盒装调料、酱料狂降',
      '超市区域调整时：货架尾端清货区重点关注',
      '新口味上市时：经典老款打折让位'
    ],
    storageTips: [
      '开封后的酱料必须冷藏，注意瓶口清洁防发霉',
      '酱油、醋等发酵品未开封可在阴凉处保存',
      '固态香料（八角、桂皮等）保质期极长，临期放心买',
      '沙拉酱、蛋黄酱分层结块后不要食用',
      '辣椒酱、豆瓣酱等含油调料出现哈喇味丢弃'
    ],
    proTips: [
      '临期沙拉酱做蔬菜沙拉、水果沙拉，消耗速度快',
      '火锅底料临期做菜、煮面、做麻辣烫万能调料',
      '大瓶酱油临期分装小瓶，分享给家人朋友'
    ]
  },
  {
    id: 'produce',
    name: '生鲜蔬果',
    icon: Apple,
    color: '#16A34A',
    badgeClass: 'stamp-green',
    discountRules: [
      '叶菜类当日17:00后开始5折，闭店前2-3折',
      '果切拼盘当日20:00后3-5折，性价比超高',
      '品相稍差的整果折扣3-5折，品质大多没问题',
      '进口水果临期折扣最大，原箱购买更划算',
      '菌菇类当日未售打折力度最大，3折起步常见'
    ],
    bestTiming: [
      '每日 17:00-19:00：蔬菜区第一轮折扣开始',
      '每日 20:00 后：水果切盘、叶菜第二轮狂降',
      '超市进货日前一天：旧库存必须清完',
      '台风/恶劣天气前：蔬果清仓大甩卖避免烂损'
    ],
    storageTips: [
      '叶菜类买回立即用厨房纸包裹冷藏，延长2-3天',
      '香蕉、芒果、牛油果等热带水果勿放冰箱',
      '苹果、梨等可单独用保鲜袋冷藏，能存1个月以上',
      '番茄常温保存风味更佳，冷藏会损失口感',
      '蘑菇类用纸袋包装冷藏，勿用塑料袋易发霉'
    ],
    proTips: [
      '品相不好的水果做水果茶、果酱、果干完美',
      '叶菜临期焯水后冷冻保存，随吃随取',
      '香蕉皮变黑但果肉完好，做香蕉面包、奶昔最香'
    ]
  }
];

const TipsGuidePage = () => {
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    categoryGuides.forEach(cat => {
      initial[cat.id] = false;
    });
    return initial;
  });
  const [showScrollTop, setShowScrollTop] = useState(false);

  const toggleCard = (id: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    categoryGuides.forEach(cat => {
      allExpanded[cat.id] = true;
    });
    setExpandedCards(allExpanded);
  };

  const collapseAll = () => {
    const allCollapsed: Record<string, boolean> = {};
    categoryGuides.forEach(cat => {
      allCollapsed[cat.id] = false;
    });
    setExpandedCards(allCollapsed);
  };

  const scrollToCategory = (id: string) => {
    const element = document.getElementById(`category-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (!expandedCards[id]) {
        setTimeout(() => {
          setExpandedCards(prev => ({ ...prev, [id]: true }));
        }, 300);
      }
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', () => {
      setShowScrollTop(window.scrollY > 400);
    });
  }

  return (
    <div className="space-y-8 relative">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 mb-2">
          <ScrollText className="w-8 h-8 text-amber-600" />
          <h2 className="title-display text-3xl md:text-4xl text-amber-900">
            捡漏技巧指南
          </h2>
          <ScrollText className="w-8 h-8 text-amber-600" />
        </div>
        <p className="text-amber-700 font-body text-lg max-w-2xl mx-auto">
          资深临期猎人私藏攻略，掌握每类商品的折扣密码，让你捡漏不踩雷
        </p>
      </div>

      <div className="card-paper p-5 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Compass className="w-5 h-5 text-amber-700" />
          <h3 className="font-display text-xl text-amber-900">
            品类快速导航
          </h3>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {categoryGuides.map((cat) => {
            const IconComp = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => scrollToCategory(cat.id)}
                className="group flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-amber-300 bg-parchment-50 hover:bg-amber-100 hover:border-amber-500 hover:scale-105 transition-all duration-200"
              >
                <IconComp className="w-4 h-4 transition-colors duration-200" style={{ color: cat.color }} />
                <span className="font-display text-sm text-amber-800">{cat.name}</span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-between pt-4 border-t-2 border-amber-200">
          <div className="flex items-center gap-2">
            <span className="text-sm text-amber-600 font-body">
              共 {categoryGuides.length} 个品类攻略
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={expandAll}
              className="btn-stamp btn-secondary text-sm !py-2 !px-4 flex items-center gap-1"
            >
              <ChevronDown className="w-4 h-4" />
              全部展开
            </button>
            <button
              onClick={collapseAll}
              className="btn-stamp btn-secondary text-sm !py-2 !px-4 flex items-center gap-1"
            >
              <ChevronUp className="w-4 h-4" />
              全部收起
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {categoryGuides.map((category, index) => {
          const IconComp = category.icon;
          const isExpanded = expandedCards[category.id];
          
          return (
            <div
              key={category.id}
              id={`category-${category.id}`}
              className="card-paper overflow-hidden animate-fadeIn"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <button
                onClick={() => toggleCard(category.id)}
                className="w-full p-5 md:p-6 flex items-center justify-between hover:bg-amber-50/50 transition-colors duration-200 relative"
              >
                <div className="absolute top-0 left-6 tape" style={{ transform: 'rotate(-3deg)' }}></div>
                
                <div className="flex items-center gap-4 z-10 relative">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center border-3 shadow-md"
                    style={{
                      backgroundColor: `${category.color}15`,
                      borderColor: category.color,
                      borderWidth: '3px',
                    }}
                  >
                    <IconComp className="w-7 h-7" style={{ color: category.color }} />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="title-display text-2xl text-amber-900">
                        {category.name}
                      </h3>
                      <span className={`badge-stamp ${category.badgeClass} text-xs`}>
                        #{index + 1}
                      </span>
                    </div>
                    <p className="text-amber-600 text-sm font-body">
                      点击展开查看折扣规律、最佳时机与保存技巧
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 z-10 relative">
                  <span className={`badge-stamp ${category.badgeClass} text-xs hidden sm:inline-flex`}>
                    {isExpanded ? '收起' : '展开'}
                  </span>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 border-amber-400 bg-parchment-50 transition-all duration-300 ${
                      isExpanded ? 'rotate-180 bg-amber-100' : ''
                    }`}
                  >
                    <ChevronDown className="w-5 h-5 text-amber-700" />
                  </div>
                </div>
              </button>

              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  isExpanded ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-5 md:px-6 pb-6 md:pb-8 border-t-2 border-amber-200 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-6">
                    <div className="p-5 rounded-xl bg-parchment-50 border-2 border-red-300 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
                        <Percent className="w-full h-full text-red-500" />
                      </div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-9 h-9 rounded-lg bg-red-100 border-2 border-red-500 flex items-center justify-center">
                            <Percent className="w-5 h-5 text-red-600" />
                          </div>
                          <h4 className="font-display text-lg text-red-800">
                            折扣规律
                          </h4>
                        </div>
                        <ul className="space-y-3">
                          {category.discountRules.map((rule, i) => (
                            <li key={i} className="flex items-start gap-2.5">
                              <span className="flex-shrink-0 w-5 h-5 mt-0.5 rounded-full bg-red-200 border-2 border-red-400 flex items-center justify-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                              </span>
                              <span className="text-amber-800 text-sm font-body leading-relaxed">
                                {rule}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="p-5 rounded-xl bg-parchment-50 border-2 border-amber-400 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
                        <Target className="w-full h-full text-amber-600" />
                      </div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-9 h-9 rounded-lg bg-amber-100 border-2 border-amber-500 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-amber-700" />
                          </div>
                          <h4 className="font-display text-lg text-amber-900">
                            最佳入手时机
                          </h4>
                        </div>
                        <ul className="space-y-3">
                          {category.bestTiming.map((timing, i) => (
                            <li key={i} className="flex items-start gap-2.5">
                              <span className="flex-shrink-0 w-5 h-5 mt-0.5 rounded-full bg-amber-200 border-2 border-amber-500 flex items-center justify-center">
                                <Target className="w-3 h-3 text-amber-700" />
                              </span>
                              <span className="text-amber-800 text-sm font-body leading-relaxed">
                                {timing}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="p-5 rounded-xl bg-parchment-50 border-2 border-green-400 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
                        <Refrigerator className="w-full h-full text-green-600" />
                      </div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-9 h-9 rounded-lg bg-green-100 border-2 border-green-500 flex items-center justify-center">
                            <Refrigerator className="w-5 h-5 text-green-700" />
                          </div>
                          <h4 className="font-display text-lg text-green-800">
                            保存注意事项
                          </h4>
                        </div>
                        <ul className="space-y-3">
                          {category.storageTips.map((tip, i) => (
                            <li key={i} className="flex items-start gap-2.5">
                              <span className="flex-shrink-0 w-5 h-5 mt-0.5 rounded-full bg-green-200 border-2 border-green-500 flex items-center justify-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                              </span>
                              <span className="text-amber-800 text-sm font-body leading-relaxed">
                                {tip}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-400 relative overflow-hidden">
                    <div className="absolute top-2 right-3 opacity-10">
                      <Sparkles className="w-20 h-20 text-amber-500" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-500 border-2 border-amber-600 flex items-center justify-center shadow-md">
                          <Lightbulb className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="font-display text-lg text-amber-900">
                          猎人私房技巧 ✨
                        </h4>
                        <span className="badge-stamp stamp-amber text-xs">
                          必看
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {category.proTips.map((tip, i) => (
                          <div
                            key={i}
                            className="p-4 rounded-lg bg-parchment-50 border border-amber-300 flex items-start gap-3 hover:shadow-md transition-shadow duration-200"
                          >
                            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                              {i + 1}
                            </div>
                            <p className="text-amber-800 text-sm font-body leading-relaxed">
                              {tip}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card-paper p-6 md:p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 border-3 border-amber-500 mb-4" style={{ borderWidth: '3px' }}>
            <BookOpen className="w-8 h-8 text-amber-700" />
          </div>
          <h3 className="title-display text-2xl text-amber-900 mb-3">
            临期猎人捡漏心法
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mt-6">
            <div className="p-5 rounded-xl bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-300">
              <div className="text-3xl mb-2">🎯</div>
              <h4 className="font-display text-lg text-red-800 mb-2">胆大心细</h4>
              <p className="text-amber-700 text-sm font-body">
                临期不等于过期，正规超市品控严格，只要在保质期内且储存得当，完全可以放心食用
              </p>
            </div>
            <div className="p-5 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-400">
              <div className="text-3xl mb-2">⏰</div>
              <h4 className="font-display text-lg text-amber-800 mb-2">时间敏感</h4>
              <p className="text-amber-700 text-sm font-body">
                记住各超市打折时间规律，踩点购物效率最高。热门商品竞争激烈，手慢则无
              </p>
            </div>
            <div className="p-5 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-400">
              <div className="text-3xl mb-2">💡</div>
              <h4 className="font-display text-lg text-green-800 mb-2">物尽其用</h4>
              <p className="text-amber-700 text-sm font-body">
                购买前想好用途和消耗速度，再便宜的商品吃不完浪费也是亏，理性捡漏最明智
              </p>
            </div>
          </div>
        </div>
      </div>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-40 w-12 h-12 rounded-full bg-amber-600 text-white shadow-lg border-2 border-amber-800 flex items-center justify-center hover:bg-amber-500 hover:scale-110 transition-all duration-300 animate-fadeIn"
          title="返回顶部"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default TipsGuidePage;
