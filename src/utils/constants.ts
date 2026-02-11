import { TDEEList, CalorieFactorList, ProteinList, DRISData } from "@/types";

interface UnitMapping {
  [key: string]: string;
}

export const UNIT_MAPPINGS: UnitMapping = {
  "匙": "spoon",
  "包": "pack",
  "罐": "can"
}

interface CalcUnitMapping {
  [key: string]: string;
}

export const CALC_UNIT_MAPPINGS: CalcUnitMapping = {
  "匙": "g",
  "包": "g",
  "罐": "ml",
}

export const TYPE_OPTIONS = [
  { id: "全部", name: "全部" },
  { id: "粉劑", name: "粉劑" },
  { id: "液劑", name: "液劑" },
]

export const CATEGORY_OPTIONS = [
  { id: "全部", name: "全部" },
  { id: "均衡配方", name: "均衡配方" },
  { id: "低蛋白配方", name: "低蛋白配方" },
  { id: "腎臟病配方", name: "腎臟病配方" },
  { id: "癌症配方", name: "癌症配方" },
  { id: "濃縮配方", name: "濃縮配方" },
  { id: "糖尿病配方", name: "糖尿病配方" },
  { id: "元素配方", name: "元素配方" },
  { id: "單素配方", name: "單素配方" },
]

export const OPERATOR_OPTIONS = [
  { id: "or", name: "或" },
  { id: "and", name: "和" },
]

export const CORE_NUTRIENTS: readonly string[] = [
  'calories',
  'protein',
  'carbohydrates',
  'fat',
  'phosphorus',
  'potassium',
  'sodium',
  'dietary_fiber'
] as const

export const NUTRIENT_LABELS: { [key: string]: string } = {
  calories: '熱量',
  carbohydrates: '碳水化合物',
  protein: '蛋白質',
  fat: '脂肪',
  phosphorus: '磷',
  potassium: '鉀',
  sodium: '鈉',
  dietary_fiber: '纖維',
  // tier 2 nutrients
  biotin: '生物素',
  calcium: '鈣',
  chloride: '氯',
  choline: '膽素',
  chromium: '鉻',
  copper: '銅',
  folic_acid: '葉酸',
  iodine: '碘',
  iron: '鐵',
  magnesium: '鎂',
  manganese: '錳',
  molybdenum: '鉬',
  niacin: '菸鹼素',
  pantothenic_acid: '泛酸',
  selenium: '硒',
  taurine: '牛磺酸',
  vitamin_a: '維生素A',
  vitamin_b1: '維生素B1',
  vitamin_b2: '維生素B2',
  vitamin_b6: '維生素B6',
  vitamin_b12: '維生素B12',
  vitamin_c: '維生素C',
  vitamin_d: '維生素D',
  vitamin_e: '維生素E',
  vitamin_k: '維生素K',
  zinc: '鋅',
  trans_fat: '反式脂肪',
  saturated_fat: '飽和脂肪',
  cholesterol: '膽固醇',
  inositol: '肌醇',
  lactose: '乳糖',
  fructose: '果糖',
  sucrose: '蔗糖',
  inulin: '菊糖',
  sugar: '糖',
  beta_glucan: 'β-聚葡萄糖',
  soluble_dietary_fiber: '水溶性膳食纖維',
  insoluble_dietary_fiber: '非水溶性膳食纖維',
  l_carnitine: '左旋肉鹼',
  alanine: '丙胺酸',
  arginine: '精胺酸',
  aspartic_acid: '天門冬胺酸',
  cystine: '胱胺酸',
  glutamic_acid: '麩胺酸',
  glycine: '甘胺酸',
  histidine: '組胺酸',
  isoleucine: '異白胺酸',
  leucine: '白胺酸',
  lysine: '離胺酸',
  methionine: '甲硫胺酸',
  phenylalanine: '苯丙胺酸',
  proline: '脯胺酸',
  serine: '絲胺酸',
  threonine: '酥胺酸',
  tryptophan: '色胺酸',
  tyrosine: '酪胺酸',
  valine: '纈胺酸',
  beta_carotene: 'β-胡蘿蔔素',
  moisture: '水分',
  hmb: 'β-羥基-β-甲基丁酸(HMB)',
  ca_hmb: 'β-羥基-β-甲基丁酸鈣(CaHMB)',
  bcaa: '支鏈胺基酸',
  eaa: '必需胺基酸',
  mcfa: '中鏈脂肪酸',
  mufa: '單元不飽和脂肪酸',
  pufa: '多元不飽和脂肪酸',
  omega_3_fatty_acid: 'Omega-3 脂肪酸',
  omega_6_fatty_acid: 'Omega-6 脂肪酸',
  omega_9_fatty_acid: 'Omega-9 脂肪酸',
  fructooligosaccharides: '果寡糖',
  lutein: '葉黃素',
}

export const NUTRIENT_UNITS: { [key: string]: string } = {
  calories: 'kcal',
  carbohydrates: 'g',
  protein: 'g',
  fat: 'g',
  phosphorus: 'mg',
  potassium: 'mg',
  sodium: 'mg',
  dietary_fiber: 'g',
  // tier 2 nutrients
  biotin: 'µg',
  calcium: 'mg',
  chloride: 'mg',
  choline: 'mg',
  chromium: 'µg',
  copper: 'mg',
  folic_acid: 'µg',
  iodine: 'µg',
  iron: 'mg',
  magnesium: 'mg',
  manganese: 'mg',
  molybdenum: 'µg',
  niacin: 'mg NE',
  pantothenic_acid: 'mg',
  selenium: 'µg',
  taurine: 'mg',
  vitamin_a: 'µg RE',
  vitamin_b1: 'mg',
  vitamin_b2: 'mg',
  vitamin_b6: 'mg',
  vitamin_b12: 'µg',
  vitamin_c: 'mg',
  vitamin_d: 'µg',
  vitamin_e: 'mg α-TE',
  vitamin_k: 'µg',
  trans_fat: 'g',
  saturated_fat: 'g',
  cholesterol: 'mg',
  zinc: 'mg',
  inositol: 'mg',
  lactose: 'g',
  fructose: 'g',
  sucrose: 'g',
  inulin: 'g',
  sugar: 'g',
  beta_glucan: 'g',
  soluble_dietary_fiber: 'g',
  insoluble_dietary_fiber: 'g',
  l_carnitine: 'mg',
  alanine: 'mg',
  arginine: 'mg',
  aspartic_acid: 'mg',
  cystine: 'mg',
  glutamic_acid: 'mg',
  glycine: 'mg',
  histidine: 'mg',
  isoleucine: 'mg',
  leucine: 'mg',
  lysine: 'mg',
  methionine: 'mg',
  phenylalanine: 'mg',
  proline: 'mg',
  serine: 'mg',
  threonine: 'mg',
  tryptophan: 'mg',
  tyrosine: 'mg',
  valine: 'mg',
  beta_carotene: 'µg',
  moisture: 'g',
  hmb: 'mg',
  ca_hmb: 'mg',
  bcaa: 'g',
  eaa: 'g',
  mcfa: 'g',
  mufa: 'g',
  pufa: 'g',
  omega_3_fatty_acid: 'g',
  omega_6_fatty_acid: 'g',
  omega_9_fatty_acid: 'g',
  fructooligosaccharides: 'g',
  lutein: 'mg'
}

export const NUTRIENT_INFO_TEXTS: { [key: string]: string } = {
  calories: '百分比 = 營養品熱量 / 輸入的熱量',
  protein: '百分比 = 營養品蛋白質 / 輸入的最小蛋白質',
}

export const DEFAULT_TDEE_SETTINGS: TDEEList[] = [
  {
    name: '預設',
    activityFactor: 1.2,
    stressFactor: 1.2,
  }
]
export const DEFAULT_CALORIE_SETTINGS: CalorieFactorList[] = [
  { id: 1, value: 25, checked: true },
  { id: 2, value: 30, checked: true },
  { id: 3, value: 35, checked: true },
]

export const DEFAULT_PROTEIN_SETTINGS: ProteinList[] = [
  { id: 1, value: 0.6, checked: true },
  { id: 2, value: 0.8, checked: true },
  { id: 3, value: 1.0, checked: true },
  { id: 4, value: 1.2, checked: true },
  { id: 5, value: 1.5, checked: true },
  { id: 6, value: 2.0, checked: true },
]

export const DRIS: DRISData = {
  calories: {
    age: {
      1: {
        rda: { man: 1350, woman: 1350 },
      },
      4: {
        rda: { man: 1800, woman: 1650 },
      },
      7: {
        rda: { man: 2100, woman: 1900 },
      },
      10: {
        rda: { man: 2350, woman: 2250 },
      },
      13: {
        rda: { man: 2800, woman: 2350 },
      },
      16: {
        rda: { man: 2900, woman: 2250 },
      },
      19: {
        rda: { man: 2400, woman: 1900 },
      },
      51: {
        rda: { man: 2250, woman: 1800 },
      },
      71: {
        rda: { man: 2150, woman: 1700 },
      },
    },
    state: {
      pregnancy: {
        state1: {
          rda: 0,
        },
        state2: {
          rda: 300,
        },
        state3: {
          rda: 300,
        }
      },
      lactation: {
        rda: 500,
      }
    }
  },
  protein: {
    age: {
      0: {
        rda: {man: 2.3, woman: 2.3 }
      },
      1: {
        rda: { man: 20, woman: 20 },
      },
      4: {
        rda: { man: 30, woman: 30 },
      },
      7: {
        rda: { man: 40, woman: 40 },
      },
      10: {
        rda: { man: 55, woman: 50 },
      },
      13: {
        rda: { man: 70, woman: 60 },
      },
      16: {
        rda: { man: 75, woman: 55 },
      },
      19: {
        rda: { man: 70, woman: 60 },
      },
    },
    state: {
      pregnancy: {
        state1: {
          rda: 10,
        },
        state2: {
          rda: 10,
        },
        state3: {
          rda: 10,
        }
      },
      lactation: {
        rda: 15,
      }
    }
  },
  carbohydrates: {
    age: {
      0: {
        ai: { man: 60, woman: 60 },
      },
      1: {
        rda: { man: 130, woman: 130 },
      },
    },
    state: {
      pregnancy: {
        state1: {
          rda: 0,
        },
        state2: {
          rda: 45,
        },
        state3: {
          rda: 45,
        }
      },
      lactation: {
        rda: 80,
      }
    }
  },
  fat: {
    age: {
      1: {
        amdr: [30, 40]
      },
      4: {
        amdr: [20, 30]
      }
    }
  },
  dietary_fiber: {
    age: {
      1: {
        ai: { man: 19, woman: 19 },
      },
      4: {
        ai: { man: 25, woman: 23 },
      },
      7: {
        ai: { man: 29, woman: 27 },
      },
      10: {
        ai: { man: 33, woman: 32 },
      },
      13: {
        ai: { man: 39, woman: 33 },
      },
      16: {
        ai: { man: 41, woman: 32 },
      },
      19: {
        ai: { man: 34, woman: 27 },
      },
      51: {
        ai: { man: 32, woman: 25 },
      },
      71: {
        ai: { man: 30, woman: 24 },
      },
    },
    state: {
      pregnancy: {
        state1: {
          ai: 0,
        },
        state2: {
          ai: 5,
        },
        state3: {
          ai: 5,
        }
      },
      lactation: {
        ai: 7,
      }
    }
  },
  saturated_fat: {
    age: {
      0: {
        amdr: 10
      }
    },
  },
  omega_6_fatty_acid: {
    age: {
      0: {
        amdr: [4, 8]
      }
    }
  },
  omega_3_fatty_acid: {
    age: {
      0: {
        amdr: [0.6, 1.2]
      }
    }
  },
  trans_fat: {
    age: {
      0: {
        amdr: 1
      }
    },
  },
  vitamin_a: {
    age: {
      0: {
        ai: { man: 400, woman: 400 },
        ul: { man: 600, woman: 600 }
      },
      1: {
        rda: { man: 400, woman: 400 },
        ul: { man: 600, woman: 600 }
      },
      4: {
        rda: { man: 400, woman: 400 },
        ul: { man: 900, woman: 900 }
      },
      10: {
        rda: { man: 500, woman: 500 },
        ul: { man: 1700, woman: 1700 },
      },
      13: {
        rda: { man: 600, woman: 500 },
        ul: { man: 2800, woman: 2800 }
      },
      16: {
        rda: { man: 700, woman: 500 },
        ul: { man: 2800, woman: 2800 }
      },
      19: {
        rda: { man: 600, woman: 500 },
        ul: { man: 3000, woman: 3000 }
      }
    },
    state: {
      pregnancy: {
        state1: {
          rda: 0,
          ul: 3000
        },
        state2: {
          rda: 0,
          ul: 3000
        },
        state3: {
          rda: 100,
          ul: 3000
        }
      },
      lactation: {
        rda: 400,
        ul: 3000
      }
    }
  },
  vitamin_d: {
    age: {
      0: {
        ai: { man: 10, woman: 10 },
        ul: { man: 25, woman: 25 }
      },
      1: {
        ai: { man: 10, woman: 10 },
        ul: { man: 50, woman: 50 }
      },
      51: {
        ai: { man: 15, woman: 15 },
        ul: { man: 50, woman: 50 }
      }
    }
  },
  vitamin_e: {
    age: {
      0: {
        ai: { man: 3, woman: 3 }
      },
      1: {
        ai: { man: 5, woman: 5 },
        ul: { man: 200, woman: 200 }
      },
      4: {
        ai: { man: 6, woman: 6 },
        ul: { man: 300, woman: 300 }
      },
      7: {
        ai: { man: 8, woman: 8 },
        ul: { man: 300, woman: 300 }
      },
      10: {
        ai: { man: 10, woman: 10 },
        ul: { man: 600, woman: 600 }
      },
      13: {
        ai: { man: 12, woman: 12 },
        ul: { man: 800, woman: 800 }
      },
      16: {
        ai: { man: 13, woman: 13 },
        ul: { man: 800, woman: 800 }
      },
      19: {
        ai: { man: 12, woman: 12 },
        ul: { man: 1000, woman: 1000 }
      },
    },
    state: {
      pregnancy: {
        state1: {
          ai: 2,
          ul: 1000
        },
        state2: {
          ai: 2,
          ul: 1000
        },
        state3: {
          ai: 2,
          ul: 1000
        }
      },
      lactation: {
        ai: 3,
        ul: 1000
      }
    }
  },
  vitamin_k: {
    age: {
      0: {
        ai: { man: 2, woman: 2 },
      },
      1: {
        ai: { man: 30, woman: 30 },
      },
      4: {
        ai: { man: 55, woman: 55 },
      },
      10: {
        ai: { man: 60, woman: 60 },
      },
      13: {
        ai: { man: 75, woman: 75 },
      },
      19: {
        ai: { man: 120, woman: 90 },
      },
    }
  },
  vitamin_c: {
    age: {
      0: {
        ai: { man: 40, woman: 40 }, 
      },
      1: {
        rda: { man: 40, woman: 40 },
        ul: { man: 400, woman: 400 }
      },
      4: {
        rda: { man: 50, woman: 50 },
        ul: { man: 650, woman: 650 }
      },
      7: {
        rda: { man: 60, woman: 60 },
        ul: { man: 650, woman: 650 }
      },
      10: {
        rda: { man: 80, woman: 80 },
        ul: { man: 1200, woman: 1200 }
      },
      13: {
        rda: { man: 100, woman: 100 },
        ul: { man: 1800, woman: 1800 }
      },
      19: {
        rda: { man: 100, woman: 100 },
        ul: { man: 2000, woman: 2000 }
      }
    },
    state: {
      pregnancy: {
        state1: {
          rda: 10,
          ul: 2000
        },
        state2: {
          rda: 10,
          ul: 2000
        },
        state3: {
          rda: 10,
          ul: 2000
        }
      },
      lactation: {
        rda: 40,
        ul: 2000
      }
    }
  },
  vitamin_b1: {
    age: {
      0: {
        ai: { man: 0.3, woman: 0.3 },
      },
      1: {
        rda: { man: 0.6, woman: 0.6 },
      },
      4: {
        rda: { man: 0.9, woman: 0.8 },
      },
      7: {
        rda: { man: 1, woman: 0.9 },
      },
      10: {
        rda: { man: 1.1, woman: 1.1 },
      },
      13: {
        rda: { man: 1.3, woman: 1.1 },
      },
      16: {
        rda: { man: 1.4, woman: 1.1 },
      },
      19: {
        rda: { man: 1.2, woman: 0.9 },
      },
    },
    state: {
      pregnancy: {
        state1: {
          rda: 0,
        },
        state2: {
          rda: 0.2,
        },
        state3: {
          rda: 0.2,
        }
      },
      lactation: {
        rda: 0.3,
      }
    }
  },
  vitamin_b2: {
    age: {
      0: {
        ai: { man: 0.3, woman: 0.3 },
      },
      1: {
        rda: { man: 0.7, woman: 0.7 },
      },
      4: {
        rda: { man: 1, woman: 0.9 }
      },
      7: {
        rda: { man: 1.2, woman: 1 },
      },
      10: {
        rda: { man: 1.3, woman: 1.2 },
      },
      13: {
        rda: { man: 1.5, woman: 1.3 },
      },
      16: {
        rda: { man: 1.6, woman: 1.2 },
      },
      19: {
        rda: { man: 1.3, woman: 1 }
      },
    },
    state: {
      pregnancy: {
        state1: {
          rda: 0,
        },
        state2: {
          rda: 0.2,
        },
        state3: {
          rda: 0.2,
        }
      },
      lactation: {
        rda: 0.4,
      }
    }
  },
  niacin: {
    age: {
      0: {
        ai: { man: 2, woman: 2 },
      },
      1: {
        rda: { man: 9, woman: 9 },
        ul: { man: 10, woman: 10 }
      },
      4: {
        rda: { man: 12, woman: 11 },
        ul: { man: 15, woman: 15 }
      },
      7: {
        rda: { man: 14, woman: 12 },
        ul: { man: 20, woman: 20 }
      },
      10: {
        rda: { man: 15, woman: 15 },
        ul: { man: 25, woman: 25 }
      },
      13: {
        rda: { man: 18, woman: 15 },
        ul: { man: 30, woman: 30 }
      },
      19: {
        rda: { man: 16, woman: 14 },
        ul: { man: 35, woman: 35 }
      },
    },
    state: {
      pregnancy: {
        state1: {
          rda: 0,
          ul: 35
        },
        state2: {
          rda: 2,
          ul: 35
        },
        state3: {
          rda: 2,
          ul: 35
        }
      },
      lactation: {
        rda: 4,
        ul: 35
      }
    }
  },
  vitamin_b6: {
    age: {
      0: {
        ai: { man: 0.1, woman: 0.1 },
      },
      1: {
        rda: { man: 0.5, woman: 0.5 },
        ul: { man: 30, woman: 30 }
      },
      4: {
        rda: { man: 0.6, woman: 0.6 },
        ul: { man: 40, woman: 40 }
      },
      7: {
        rda: { man: 0.8, woman: 0.8 },
        ul: { man: 40, woman: 40 }
      },
      10: {
        rda: { man: 1.3, woman: 1.3 },
        ul: { man: 60, woman: 60 }
      },
      13: {
        rda: { man: 1.4, woman: 1.3 },
        ul: { man: 60, woman: 60 }
      },
      16: {
        rda: { man: 1.5, woman: 1.3 },
        ul: { man: 80, woman: 80 }
      },
      19: {
        rda: { man: 1.5, woman: 1.5 },
        ul: { man: 80, woman: 80 }
      },
      51: {
        rda: { man: 1.6, woman: 1.6 },
        ul: { man: 80, woman: 80 }
      },
    },
    state: {
      pregnancy: {
        state1: {
          rda: 0.4,
          ul: 80
        },
        state2: {
          rda: 0.4,
          ul: 80
        },
        state3: {
          rda: 0.4,
          ul: 80
        }
      },
      lactation: {
        rda: 0.4,
        ul: 80
      }
    }
  },
  vitamin_b12: {
    age: {
      0: {
        ai: { man: 0.4, woman: 0.4 },
      },
      1: {
        rda: { man: 0.9, woman: 0.9 },
      },
      4: {
        rda: { man: 1.2, woman: 1.2 },
      },
      7: {
        rda: { man: 1.5, woman: 1.5 },
      },
      10: {
        rda: { man: 2, woman: 2.2 },
      },
      13: {
        rda: { man: 2.4, woman: 2.4 },
      },
    },
    state: {
      pregnancy: {
        state1: {
          rda: 0.2,
        },
        state2: {
          rda: 0.2,
        },
        state3: {
          rda: 0.2,
        }
      },
      lactation: {
        rda: 0.4,
      }
    }
  },
  folic_acid: {
    age: {
      0: {
        ai: { man: 70, woman: 70 },
      },
      1: {
        rda: { man: 170, woman: 170 },
        ul: { man: 300, woman: 300 }
      },
      4: {
        rda: { man: 200, woman: 200 },
        ul: { man: 400, woman: 400 }
      },
      7: {
        rda: { man: 250, woman: 250 },
        ul: { man: 500, woman: 500 }
      },
      10: {
        rda: { man: 300, woman: 300 },
        ul: { man: 700, woman: 700 }
      },
      13: {
        rda: { man: 400, woman: 400 },
        ul: { man: 800, woman: 800 }
      },
      16: {
        rda: { man: 400, woman: 400 },
        ul: { man: 900, woman: 900 }
      },
      19: {
        rda: { man: 400, woman: 400 },
        ul: { man: 1000, woman: 1000 }
      },
    },
    state: {
      pregnancy: {
        state1: {
          rda: 200,
          ul: 1000
        },
        state2: {
          rda: 200,
          ul: 1000
        },
        state3: {
          rda: 200,
          ul: 1000
        }
      },
      lactation: {
        rda: 100,
        ul: 1000
      }
    }
  },
  choline: {
    age: {
      0: {
        ai: { man: 140, woman: 140 }
      },
      1: {
        ai: { man: 180, woman: 180 },
        ul: { man: 1000, woman: 1000 }
      },
      4: {
        ai: { man: 220, woman: 220 },
        ul: { man: 1000, woman: 1000 }
      },
      7: {
        ai: { man: 280, woman: 280 },
        ul: { man: 1000, woman: 1000 }
      },
      10: {
        ai: { man: 350, woman: 350 },
        ul: { man: 2000, woman: 2000 }
      },
      13: {
        ai: { man: 460, woman: 380 },
        ul: { man: 2000, woman: 2000 }
      },
      16: {
        ai: { man: 500, woman: 370 },
        ul: { man: 3000, woman: 3000 }
      },
      19: {
        ai: { man: 450, woman: 390 },
        ul: { man: 3500, woman: 3500 }
      },
    },
    state: {
      pregnancy: {
        state1: {
          ai: 20,
          ul: 3500
        },
        state2: {
          ai: 20,
          ul: 3500
        },
        state3: {
          ai: 20,
          ul: 3500
        }
      },
      lactation: {
        ai: 140,
        ul: 3500
      }
    }
  },
  biotin: {
    age: {
      0: {
        ai: { man: 5, woman: 5 }
      },
      1: {
        ai: { man: 9, woman: 9 },
      },
      4: {
        ai: { man: 12, woman: 12 },
      },
      7: {
        ai: { man: 16, woman: 16 },
      },
      10: {
        ai: { man: 20, woman: 20 },
      },
      13: {
        ai: { man: 25, woman: 25 },
      },
      16: {
        ai: { man: 27, woman: 27 },
      },
      19: {
        ai: { man: 30, woman: 30 },
      },
    },
    state: {
      pregnancy: {
        state1: {
          ai: 0,
        },
        state2: {
          ai: 0,
        },
        state3: {
          ai: 0,
        }
      },
      lactation: {
        ai: 5,
      }
    }
  },
  pantothenic_acid: {
    age: {
      0: {
        ai: { man: 1.7, woman: 1.7 }
      },
      1: {
        ai: { man: 2, woman: 2 },
      },
      4: {
        ai: { man: 2.5, woman: 2.5 },
      },
      7: {
        ai: { man: 3, woman: 3 },
      },
      10: {
        ai: { man: 4, woman: 4 },
      },
      13: {
        ai: { man: 4.5, woman: 4.5 },
      },
      16: {
        ai: { man: 5, woman: 5 },
      },
    },
    state: {
      pregnancy: {
        state1: {
          ai: 1,
        },
        state2: {
          ai: 1,
        },
        state3: {
          ai: 1,
        }
      },
      lactation: {
        ai: 2,
      }
    }
  },
  calcium: {
    age: {
      0: {
        ai: { man: 300, woman: 300 },
        ul: { man: 1000, woman: 1000 }
      },
      1: {
        ai: { man: 500, woman: 500 },
        ul: { man: 2500, woman: 2500 }
      },
      4: {
        ai: { man: 600, woman: 600 },
        ul: { man: 2500, woman: 2500 }
      },
      7: {
        ai: { man: 800, woman: 800 },
        ul: { man: 2500, woman: 2500 }
      },
      10: {
        ai: { man: 1000, woman: 1000 },
        ul: { man: 2500, woman: 2500 }
      },
      13: {
        ai: { man: 1200, woman: 1200 },
        ul: { man: 2500, woman: 2500 }
      },
      19: {
        ai: { man: 1000, woman: 1000 },
        ul: { man: 2500, woman: 2500 }
      },
    },
    state: {
      pregnancy: {
        state1: {
          ai: 0,
          ul: 2500
        },
        state2: {
          ai: 0,
          ul: 2500
        },
        state3: {
          ai: 0,
          ul: 2500
        }
      },
      lactation: {
        ai: 0,
        ul: 2500
      }
    }
  },
  phosphorus: {
    age: {
      0: {
        ai: { man: 200, woman: 200 },
      },
      1: {
        ai: { man: 400, woman: 400 },
        ul: { man: 3000, woman: 3000 }
      },
      4: {
        ai: { man: 500, woman: 500 },
        ul: { man: 3000, woman: 3000 }
      },
      7: {
        ai: { man: 600, woman: 600 },
        ul: { man: 3000, woman: 3000 }
      },
      10: {
        ai: { man: 800, woman: 800 },
        ul: { man: 4000, woman: 4000 }
      },
      13: {
        ai: { man: 1000, woman: 1000 },
        ul: { man: 4000, woman: 4000 }
      },
      19: {
        ai: { man: 800, woman: 800 },
        ul: { man: 4000, woman: 4000 }
      },
      71: {
        ai: { man: 800, woman: 800 },
        ul: { man: 3000, woman: 3000 }
      },
    },
    state: {
      pregnancy: {
        state1: {
          ai: 0,
          ul: 3500
        },
        state2: {
          ai: 0,
          ul: 3500
        },
        state3: {
          ai: 0,
          ul: 3500
        }
      },
      lactation: {
        ai: 0,
        ul: 4000
      }
    }
  },
  magnesium: {
    age: {
      0: {
        ai: { man: 25, woman: 25 },
      },
      1: {
        rda: { man: 80, woman: 80 },
        ul: { man: 65, woman: 65 }
      },
      4: {
        rda: { man: 120, woman: 120 },
        ul: { man: 110, woman: 110 }
      },
      7: {
        rda: { man: 170, woman: 170 },
        ul: { man: 110, woman: 110 }
      },
      10: {
        rda: { man: 230, woman: 230 },
        ul: { man: 350, woman: 350 }
      },
      13: {
        rda: { man: 350, woman: 320 },
        ul: { man: 350, woman: 350 }
      },
      16: {
        rda: { man: 390, woman: 330 },
        ul: { man: 350, woman: 350 }
      },
      19: {
        rda: { man: 380, woman: 320 },
        ul: { man: 350, woman: 350 }
      },
      51: {
        rda: { man: 360, woman: 310 },
        ul: { man: 350, woman: 350 }
      },
      71: {
        rda: { man: 350, woman: 300 },
        ul: { man: 350, woman: 350 }
      },
    },
    state: {
      pregnancy: {
        state1: {
          rda: 35,
          ul: 350
        },
        state2: {
          rda: 35,
          ul: 350
        },
        state3: {
          rda: 35,
          ul: 350
        }
      },
      lactation: {
        rda: 0,
        ul: 350
      }
    }
  },
  iron: {
    age: {
      0: {
        rda: { man: 7, woman: 7 },
        ul: { man: 30, woman: 30 }
      },
      1: {
        rda: { man: 10, woman: 10 },
        ul: { man: 30, woman: 30 }
      },
      10: {
        rda: { man: 15, woman: 15 },
        ul: { man: 30, woman: 30 }
      },
      13: {
        rda: { man: 15, woman: 15 },
        ul: { man: 40, woman: 40 }
      },
      16: {
        rda: { man: 1.5, woman: 1.3 },
        ul: { man: 40, woman: 40 }
      },
      19: {
        rda: { man: 10, woman: 15 },
        ul: { man: 40, woman: 40 }
      },
      51: {
        rda: { man: 10, woman: 10 },
        ul: { man: 40, woman: 40 }
      },
    },
    state: {
      pregnancy: {
        state1: {
          rda: 0,
          ul: 40
        },
        state2: {
          rda: 0,
          ul: 40
        },
        state3: {
          rda: 30,
          ul: 40
        }
      },
      lactation: {
        rda: 30,
        ul: 40
      }
    }
  },
  zinc: {
    age: {
      0: {
        ai: { man: 5, woman: 5 },
        ul: { man: 7, woman: 7 }
      },
      1: {
        ai: { man: 5, woman: 5 },
        ul: { man: 9, woman: 9 }
      },
      4: {
        ai: { man: 5, woman: 5 },
        ul: { man: 11, woman: 11 }
      },
      7: {
        ai: { man: 8, woman: 8 },
        ul: { man: 15, woman: 15 }
      },
      10: {
        ai: { man: 10, woman: 10 },
        ul: { man: 22, woman: 22 }
      },
      13: {
        ai: { man: 15, woman: 12 },
        ul: { man: 29, woman: 29 }
      },
      16: {
        ai: { man: 15, woman: 12 },
        ul: { man: 35, woman: 35 }
      },
    },
    state: {
      pregnancy: {
        state1: {
          ai: 3,
          ul: 35
        },
        state2: {
          ai: 3,
          ul: 35
        },
        state3: {
          ai: 3,
          ul: 35
        }
      },
      lactation: {
        ai: 3,
        ul: 35
      }
    }
  },
  iodine: {
    age: {
      0: {
        ai: { man: 110, woman: 110 },
      },
      1: {
        rda: { man: 65, woman: 65 },
        ul: { man: 200, woman: 200 }
      },
      4: {
        rda: { man: 90, woman: 90 },
        ul: { man: 300, woman: 300 }
      },
      7: {
        rda: { man: 100, woman: 100 },
        ul: { man: 400, woman: 400 }
      },
      10: {
        rda: { man: 120, woman: 120 },
        ul: { man: 600, woman: 600 }
      },
      13: {
        rda: { man: 150, woman: 150 },
        ul: { man: 800, woman: 800 }
      },
      16: {
        rda: { man: 150, woman: 150 },
        ul: { man: 1000, woman: 1000 }
      },
    },
    state: {
      pregnancy: {
        state1: {
          rda: 75,
          ul: 1000
        },
        state2: {
          rda: 75,
          ul: 1000
        },
        state3: {
          rda: 75,
          ul: 1000
        }
      },
      lactation: {
        rda: 100,
        ul: 1000
      }
    }
  },
  selenium: {
    age: {
      0: {
        ai: { man: 15, woman: 15 },
        ul: { man: 40, woman: 40 }
      },
      1: {
        rda: { man: 20, woman: 20 },
        ul: { man: 90, woman: 90 }
      },
      4: {
        rda: { man: 25, woman: 25 },
        ul: { man: 135, woman: 135 }
      },
      7: {
        rda: { man: 30, woman: 30 },
        ul: { man: 185, woman: 185 }
      },
      10: {
        rda: { man: 40, woman: 40 },
        ul: { man: 280, woman: 280 }
      },
      13: {
        rda: { man: 50, woman: 50 },
        ul: { man: 400, woman: 400 }
      },
      16: {
        rda: { man: 55, woman: 55 },
        ul: { man: 400, woman: 400 }
      },
    },
    state: {
      pregnancy: {
        state1: {
          rda: 5,
          ul: 400
        },
        state2: {
          rda: 5,
          ul: 400
        },
        state3: {
          rda: 5,
          ul: 400
        }
      },
      lactation: {
        rda: 15,
        ul: 400
      }
    }
  },
  potassium: {
    age: {
      0: {
        ai: { man: 400, woman: 400 }
      },
      1: {
        ai: { man: 1500, woman: 1500 }
      },
      4: {
        ai: { man: 2100, woman: 1900 }
      },
      7: {
        ai: { man: 2400, woman: 2200 }
      },
      10: {
        ai: { man: 2700, woman: 2500 }
      },
      13: {
        ai: { man: 2800, woman: 2500 }
      },
    },
    state: {
      lactation: {
        ai: 400,
      }
    }
  },
  sodium: {
    age: {
      0: {
        ai: { man: 100, woman: 100 }
      },
      1: {
        cdrr: { man: 1300, woman: 1300 }
      },
      4: {
        cdrr: { man: 1700, woman: 1700 }
      },
      7: {
        cdrr: { man: 2000, woman: 2000 }
      },
      10: {
        cdrr: { man: 2300, woman: 2300 }
      },
    },
  },
}